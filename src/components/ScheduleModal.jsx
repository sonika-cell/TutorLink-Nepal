import { useState } from "react";
import { useToast } from "../context/ToastContext";

function ScheduleModal({ application, onClose, onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    class_type: "regular",
    date: "",
    start_time: "",
    end_time: "",
    mode: "online",
    notes: "",
  });
  const [error, setError] = useState("");

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

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch("http://localhost:8080/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          application_id: application.id,
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
        showToast("Class scheduled successfully!", "success");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(data.error || "Failed to schedule class");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800">
            📅 Schedule Class
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Schedule a class with the accepted tutor
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Class Type
            </label>
            <select
              name="class_type"
              value={form.class_type}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-100"
            >
              <option value="demo">Demo / Trial Class</option>
              <option value="regular">Regular Class</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Start Time *
            </label>
            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-100"
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
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Mode *
            </label>
            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-100"
            >
              <option value="online">💻 Online (Jitsi Meet)</option>
              <option value="offline">🏠 Offline (In-person)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any additional information..."
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-100 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-[#202020] bg-transparent text-[#202020] font-semibold py-2.5 transition hover:bg-[#202020] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-yellow-500 text-white font-bold py-2.5 transition hover:bg-yellow-600 disabled:opacity-50"
            >
              {loading ? "Scheduling..." : "Schedule"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default ScheduleModal;