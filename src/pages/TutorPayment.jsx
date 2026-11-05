import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function TutorPayment() {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [application, setApplication] = useState(null);
  const [placement, setPlacement] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  // Fetch application + placement
  useEffect(() => {
    const setup = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        // 1. Get tutor's applications
        const appsRes = await fetch(
          "http://localhost:8080/api/applications/tutor",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const appsData = await appsRes.json();
        const app = (appsData.applications || []).find(
          (a) => a.id === parseInt(applicationId)
        );

        if (!app) {
          setError("Application not found");
          setLoading(false);
          return;
        }

        setApplication(app);

        // 2. Get placements
        const placementsRes = await fetch(
          "http://localhost:8080/api/placements/tutor",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const placementsData = await placementsRes.json();
        const pl = (placementsData.placements || []).find(
          (p) => p.application_id === parseInt(applicationId)
        );

        if (!pl) {
          setError("Placement not found");
          setLoading(false);
          return;
        }

        setPlacement(pl);
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    setup();
  }, [applicationId, navigate]);

  // Pay with Khalti — initiate and redirect
  const handlePayWithKhalti = async () => {
    if (!placement) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        "http://localhost:8080/api/payments/khalti/initiate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            placement_id: placement.id,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.payment_url) {
        // Redirect to Khalti sandbox
        window.location.href = data.payment_url;
      } else {
        showToast(
          data.error || "Could not initiate Khalti payment",
          "error"
        );
        setProcessing(false);
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
      setProcessing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
          <p className="text-slate-500 font-medium">Loading payment page...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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

  const fee = placement?.amount || 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">

        {/* Success Banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎉</span>
            <div>
              <h1 className="text-2xl font-extrabold">You've been hired!</h1>
              <p className="mt-1 text-sm text-teal-50">
                Complete the placement fee to unlock scheduling
              </p>
            </div>
          </div>
        </div>

        {/* Tuition Details */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold text-[#10243e]">
            📋 Tuition Details
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
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
                Application
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                #{application?.id}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Status
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-600 capitalize">
                {application?.status}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Placement
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700 capitalize">
                {placement?.status?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Amount */}
        <div className="mb-6 rounded-2xl border-2 border-purple-500 bg-white p-6 shadow-sm">
          <p className="text-center text-xs font-bold uppercase tracking-wide text-slate-400">
            Placement Fee
          </p>
          <p className="mt-2 text-center text-5xl font-extrabold text-purple-600">
            Rs. {fee}
          </p>
          <p className="mt-2 text-center text-xs text-slate-500">
            One-time fee · 25% of monthly budget
          </p>
        </div>

        {/* Khalti Payment Card */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-lg font-extrabold text-[#10243e]">
              Pay with Khalti
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Secure payment via Khalti Sandbox
            </p>
          </div>

          {/* Khalti QR Placeholder */}
          <div className="flex justify-center mb-6">
            <div className="rounded-2xl border-2 border-purple-200 bg-white p-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Khalti-Pay-Rs${fee}-Placement${placement?.id || 0}`}
                alt="Khalti Payment QR"
                className="h-56 w-56 rounded-lg"
              />
            </div>
          </div>

          {/* Amount below QR */}
          <p className="text-center text-2xl font-extrabold text-purple-600 mb-6">
            Rs. {fee}
          </p>

          {/* Pay Button */}
          <button
            onClick={handlePayWithKhalti}
            disabled={processing || !placement}
            className="w-full rounded-xl bg-purple-600 py-4 text-base font-bold text-white shadow-md transition hover:bg-purple-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Redirecting to Khalti..." : "Pay with Khalti"}
          </button>

          {/* Sandbox Note */}
          <p className="mt-3 text-center text-xs text-slate-400">
            🔒 Sandbox mode · No real money will be charged
          </p>
        </div>

        {/* Back Link */}
        <button
          onClick={() => navigate("/tutor/dashboard")}
          className="mt-4 w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          ← Back to Dashboard
        </button>

      </div>
    </div>
  );
}

export default TutorPayment;