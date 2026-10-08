import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function CreateTutorProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    qualification: "",
    subjects: "",
    experience_years: "",
    bio: "",
    location: "",
    cv_text: "",  // NEW: CV Text field
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://localhost:8080/api/tutor/profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            experience_years: Number(form.experience_years),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create profile.");
        return;
      }

      setMessage("Tutor profile saved successfully!");
      console.log("Profile created:", data);
      
      // Redirect to dashboard after success
      setTimeout(() => {
        navigate("/tutor/dashboard");
      }, 1500);
    } catch (err) {
      console.error("PROFILE ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">

        <h1 className="text-3xl font-bold text-slate-800">
          Create Your Tutor Profile
        </h1>

        <p className="mt-2 text-slate-500">
          Tell parents about yourself and your teaching experience.
        </p>

        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="mt-6">
            <label className="block font-semibold text-slate-700">
              Full Name
            </label>

            <input
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              value={form.full_name}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Qualification */}
          <div className="mt-5">
            <label className="block font-semibold text-slate-700">
              Qualification
            </label>

            <input
              type="text"
              name="qualification"
              placeholder="e.g. B.Sc. Mathematics"
              value={form.qualification}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Subjects */}
          <div className="mt-5">
            <label className="block font-semibold text-slate-700">
              Subjects You Teach
            </label>

            <input
              type="text"
              name="subjects"
              placeholder="e.g. Mathematics, Science, English"
              value={form.subjects}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Experience */}
          <div className="mt-5">
            <label className="block font-semibold text-slate-700">
              Years of Experience
            </label>

            <input
              type="number"
              name="experience_years"
              placeholder="e.g. 2"
              min="0"
              value={form.experience_years}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Bio */}
          <div className="mt-5">
            <label className="block font-semibold text-slate-700">
              About You
            </label>

            <textarea
              name="bio"
              placeholder="Tell parents about yourself and your teaching experience."
              rows="4"
              value={form.bio}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Location */}
          <div className="mt-5">
            <label className="block font-semibold text-slate-700">
              Location
            </label>

            <input
              type="text"
              name="location"
              placeholder="e.g. Kathmandu"
              value={form.location}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* CV / Professional Summary - NEW */}
          <div className="mt-5">
            <label className="block font-semibold text-slate-700">
              CV / Professional Summary
            </label>

            <textarea
              name="cv_text"
              placeholder="Paste your CV, resume, or professional summary here. Include your education, work experience, achievements, skills, certifications, etc..."
              rows="6"
              value={form.cv_text}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-slate-400">
              Add your professional summary, qualifications, work experience, achievements, and certifications. Parents will see this on your profile.
            </p>
          </div>

          {/* Messages */}
          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-600">
              {message}
            </p>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default CreateTutorProfile;