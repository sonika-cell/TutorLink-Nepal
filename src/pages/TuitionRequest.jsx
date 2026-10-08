import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function TuitionRequest() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    subject: "",
    grade: "",
    location: "",
    mode: "Offline",
    budget: "",
    message: "",
  });

  // Temporary tutor data
  // Later this will come from the Go backend.
  const tutors = {
    1: "Aarav Sharma",
    2: "Sita Karki",
    3: "Rohan Thapa",
    4: "Anisha Gurung",
  };

  const tutorName = tutors[id] || "Tutor";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Tuition Request:", {
      tutorId: id,
      tutorName,
      ...form,
    });

    showToast(`Request sent successfully to ${tutorName}!`, "success");

    navigate("/parent/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Back Button */}
        <button
          onClick={() => navigate(`/tutor/${id}`)}
          className="mb-6 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Tutor Profile
        </button>

        {/* Header */}
        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-600">
            Tuition Request
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-slate-800">
            Send Request to {tutorName}
          </h1>

          <p className="mt-2 text-slate-500">
            Tell the tutor about your tuition requirements.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
        >

          {/* Subject & Grade */}
          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Subject
              </label>

              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="Computer Science">
                  Computer Science
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Grade / Class
              </label>

              <select
                name="grade"
                value={form.grade}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select Grade</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
            </div>

          </div>

          {/* Location */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Location
            </label>

            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="e.g. Kathmandu, Lalitpur"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Mode */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Tuition Mode
            </label>

            <div className="grid gap-3 sm:grid-cols-2">

              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="Offline"
                  checked={form.mode === "Offline"}
                  onChange={handleChange}
                  className="mr-2"
                />
                🏠 Offline / Home Tuition
              </label>

              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="Online"
                  checked={form.mode === "Online"}
                  onChange={handleChange}
                  className="mr-2"
                />
                💻 Online Tuition
              </label>

            </div>
          </div>

          {/* Budget */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Your Budget
            </label>

            <input
              type="text"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              required
              placeholder="e.g. Rs. 800/hr"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Message */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Message to Tutor
            </label>

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Tell the tutor about your learning requirements..."
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Submit */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={() => navigate(`/tutor/${id}`)}
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-95"
            >
              Send Tuition Request
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default TuitionRequest;