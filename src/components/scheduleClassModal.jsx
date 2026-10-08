import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function ScheduleClassModal({ application, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    application_id: application?.id || "",
    class_type: "regular",
    date: "",
    start_time: "",
    end_time: "",
    mode: "online",
    notes: "",
  });
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch("http://localhost:8080/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("✅ Class scheduled successfully!", "success");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        navigate("/parent/dashboard");
      } else {
        showToast(data.error || "Failed to schedule class", "error");
      }
    } catch (error) {
      console.error("Error scheduling class:", error);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
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
          Schedule a class with the accepted tutor.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Application ID (hidden) */}
          <input
            type="hidden"
            name="application_id"
            value={formData.application_id}
          />

          {/* Class Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Class Type
            </label>
            <select
              name="class_type"
              value={formData.class_type}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="demo">Demo / Trial Class</option>
              <option value="regular">Regular Class</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Date
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
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-100"
            />
            <p className="mt-1 text-xs text-slate-400">
              📅 You can schedule within the next 30 days only
            </p>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Mode
            </label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
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
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any additional information for the tutor..."
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Scheduling..." : "Schedule Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleClassModal;
