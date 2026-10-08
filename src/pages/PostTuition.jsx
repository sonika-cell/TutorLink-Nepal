import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function PostTuition() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    subject: "",
    grade: "",
    description: "",
    location: "",
    mode: "offline",
    budget: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================
  const validateForm = () => {
    const newErrors = {};

    // Subject
    if (!form.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (form.subject.trim().length < 2) {
      newErrors.subject = "Subject must be at least 2 characters";
    } else if (form.subject.trim().length > 50) {
      newErrors.subject = "Subject must be less than 50 characters";
    }

    // Grade
    if (!form.grade) {
      newErrors.grade = "Please select a grade level";
    }

    // Description
    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length < 20) {
      newErrors.description = "Please write at least 20 characters";
    } else if (form.description.trim().length > 500) {
      newErrors.description = "Description is too long (max 500 characters)";
    }

    // Location
    if (!form.location.trim()) {
      newErrors.location = "Location is required";
    } else if (form.location.trim().length < 3) {
      newErrors.location = "Location must be at least 3 characters";
    } else if (form.location.trim().length > 100) {
      newErrors.location = "Location is too long";
    }

    // Mode
    if (!form.mode) {
      newErrors.mode = "Please select a teaching mode";
    }

    // Budget
    if (!form.budget) {
      newErrors.budget = "Budget is required";
    } else if (parseInt(form.budget) < 5000) {
      newErrors.budget = "Budget must be at least Rs. 5,000";
    } else if (parseInt(form.budget) > 100000) {
      newErrors.budget = "Budget cannot exceed Rs. 1,00,000";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!validateForm()) {
      showToast("Please fill all required fields correctly", "error");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        showToast("Please login first", "error");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:8080/api/tuition/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: form.subject.trim(),
          grade: form.grade,
          description: form.description.trim(),
          location: form.location.trim(),
          mode: form.mode,
          budget: form.budget,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Tuition post created successfully!", "success");
        navigate("/parent/dashboard");
      } else {
        showToast(data.error || "Failed to create tuition post", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  // Get input class based on error
  const getInputClass = (fieldName) => {
    const base =
      "w-full rounded-xl border px-4 py-3 text-slate-800 transition-all focus:outline-none focus:ring-2";
    if (errors[fieldName]) {
      return `${base} border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100`;
    }
    return `${base} border-slate-300 focus:border-blue-600 focus:ring-blue-100`;
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-blue-600">
            Parent Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-800">
            Post a New Tuition
          </h1>

          <p className="mt-2 text-slate-500">
            Tell tutors what kind of learning support you are looking for.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Subject <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g. Mathematics"
                className={getInputClass("subject")}
              />
              {errors.subject && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.subject}
                </p>
              )}
            </div>

            {/* Grade */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Grade / Level <span className="text-red-500">*</span>
              </label>

              <select
                name="grade"
                value={form.grade}
                onChange={handleChange}
                className={getInputClass("grade")}
              >
                <option value="">Select grade</option>
                <option value="primary">Primary Level</option>
                <option value="secondary">Secondary Level</option>
                <option value="see">SEE</option>
                <option value="plus-two">+2</option>
                <option value="bachelor">Bachelor Level</option>
                <option value="other">Other</option>
              </select>
              {errors.grade && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.grade}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tuition Requirements <span className="text-red-500">*</span>
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="5"
                placeholder="Describe what you need from the tutor... (min 20 characters)"
                className={`${getInputClass("description")} resize-none`}
              />
              {errors.description ? (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.description}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  {form.description.length}/500 characters (min 20)
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Location <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Kathmandu, Lalitpur"
                className={getInputClass("location")}
              />
              {errors.location && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.location}
                </p>
              )}
            </div>

            {/* Mode */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Teaching Mode <span className="text-red-500">*</span>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                    form.mode === "offline"
                      ? "border-blue-600 bg-blue-50"
                      : errors.mode
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 hover:border-blue-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="offline"
                    checked={form.mode === "offline"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="font-medium text-slate-700">
                    🏠 Offline / In-person
                  </span>
                </label>

                <label
                  className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                    form.mode === "online"
                      ? "border-blue-600 bg-blue-50"
                      : errors.mode
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 hover:border-blue-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="online"
                    checked={form.mode === "online"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="font-medium text-slate-700">💻 Online</span>
                </label>
              </div>
              {errors.mode && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.mode}
                </p>
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Monthly Budget (NPR) <span className="text-red-500">*</span>
              </label>

              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="e.g. 5000"
                min="5000"
                max="100000"
                className={getInputClass("budget")}
              />
              {errors.budget ? (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.budget}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  💰 Range: Rs. 5,000 - Rs. 1,00,000 per month
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/parent/dashboard")}
                className="w-full rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.98]"
              >
                Post Tuition
              </button>
            </div>
          </form>
        </div>

        {/* Information */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Providing clear information about the
            subject, grade, location, and your requirements helps tutors
            understand your needs.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PostTuition;