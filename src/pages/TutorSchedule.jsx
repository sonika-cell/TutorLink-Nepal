import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function TutorSchedule() {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [application, setApplication] = useState(null);
  const [placement, setPlacement] = useState(null);
  const [parentContact, setParentContact] = useState(null);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    class_type: "demo",
    date: "",
    start_time: "",
    end_time: "",
    mode: "online",
    notes: "",
  });

  // Fetch application + placement + parent contact
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Get applications
        const appsRes = await fetch(
          "http://localhost:8080/api/applications/tutor",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const appsData = await appsRes.json();
        const app = (appsData.applications || []).find(
          (a) => a.id === parseInt(applicationId),
        );

        if (!app) {
          setError("Application not found");
          setLoading(false);
          return;
        }

        setApplication(app);

        // Get placements
        const placementsRes = await fetch(
          "http://localhost:8080/api/placements/tutor",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const placementsData = await placementsRes.json();
        const pl = (placementsData.placements || []).find(
          (p) => p.application_id === parseInt(applicationId),
        );

        if (!pl) {
          setError("Placement not found. Complete payment first.");
          setLoading(false);
          return;
        }

        if (pl.status !== "confirmed" && pl.status !== "paid") {
          setError(
            "Payment must be confirmed before scheduling. Current status: " +
              pl.status,
          );
          setLoading(false);
          return;
        }

        setPlacement(pl);

        // NEW: Get parent contact
        try {
          const contactRes = await fetch(
            `http://localhost:8080/api/placement/${pl.id}/parent-contact`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (contactRes.ok) {
            const contactData = await contactRes.json();
            setParentContact(contactData);
          }
        } catch (err) {
          console.error("Error fetching parent contact:", err);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [applicationId, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.date) return setError("Please select a date");
    if (!form.start_time) return setError("Please select start time");
    if (!form.end_time) return setError("Please select end time");
    if (form.start_time >= form.end_time)
      return setError("End time must be after start time");

    setSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch("http://localhost:8080/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          application_id: parseInt(applicationId),
          class_type: form.class_type,
          date: form.date,
          start_time: form.start_time,
          end_time: form.end_time,
          mode: form.mode,
          notes: form.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("✅ Demo class scheduled successfully!", "success");
        navigate("/tutor/dashboard");
      } else {
        setError(data.error || "Failed to schedule class");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
          <p className="text-slate-500 font-medium">Loading schedule form...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error && !application) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
            ❌
          </div>
          <h2 className="text-xl font-bold text-red-600">{error}</h2>
          <button
            onClick={() => navigate("/tutor/dashboard")}
            className="mt-6 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header Banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📅</span>
            <div>
              <h1 className="text-2xl font-extrabold">Schedule Demo Class</h1>
              <p className="mt-1 text-sm text-teal-50">
                Pick a date and time for the demo session
              </p>
            </div>
          </div>
        </div>

        {/* NEW: Parent Contact Card */}
        {parentContact && (
          <div className="mb-6 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📞</span>
              <h2 className="text-lg font-extrabold text-emerald-800">
                Parent Contact
              </h2>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-emerald-800">👤 Name:</span>{" "}
                {parentContact.name || "Not provided"}
              </p>
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-emerald-800">
                  📧 Email:
                </span>{" "}
                <a
                  href={`mailto:${parentContact.email}`}
                  className="text-emerald-700 underline hover:text-emerald-900"
                >
                  {parentContact.email || "Not provided"}
                </a>
              </p>
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-emerald-800">
                  📱 Phone:
                </span>{" "}
                {parentContact.phone ? (
                  <a
                    href={`tel:${parentContact.phone}`}
                    className="text-emerald-700 underline hover:text-emerald-900"
                  >
                    {parentContact.phone}
                  </a>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>

            <div className="mt-4 rounded-xl bg-white/60 border border-emerald-200 p-3">
              <p className="text-xs text-emerald-700">
                💡 <strong>Tip:</strong> You can call the parent directly to
                confirm, or schedule the demo class below.
              </p>
            </div>
          </div>
        )}

        {/* Application Details */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold text-[#10243e]">
            📋 Application Details
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Application
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                #{application?.id}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Tuition Post
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                #{application?.tuition_post_id}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Placement Fee
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-600">
                Rs. {placement?.amount} ✅ Paid
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Status
              </p>
              <p className="mt-1 text-sm font-semibold text-teal-600 capitalize">
                {placement?.status?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-extrabold text-[#10243e]">
            📅 Class Details
          </h2>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Class Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Class Type
              </label>
              <select
                name="class_type"
                value={form.class_type}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                <option value="demo">Demo / Trial Class</option>
                <option value="regular">Regular Class</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                max={
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* Time Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Mode *
              </label>
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                <option value="online">💻 Online (Jitsi Meet)</option>
                <option value="offline">🏠 Offline (In-person)</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional info for the parent..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/tutor/dashboard")}
              className="flex-1 rounded-xl border-2 border-[#202020] bg-transparent text-[#202020] font-semibold py-3 transition hover:bg-[#202020] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-teal-500 text-white font-bold py-3 transition hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Scheduling..." : "Schedule Class →"}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> A Jitsi Meet link will be automatically
            generated for online classes. Both you and the parent can join from
            your dashboards.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TutorSchedule;
