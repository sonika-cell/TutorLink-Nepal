import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const params = new URLSearchParams(location.search);
  const roleFromUrl = params.get("role");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: roleFromUrl === "tutor" ? "tutor" : "parent",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    let { name, value } = e.target;

    // For phone, only allow digits and max 10
    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm({
      ...form,
      [name]: value,
    });

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // ==========================================================
  // VALIDATION FUNCTION
  // ==========================================================
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (form.name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (form.phone.length !== 10) {
      newErrors.phone = "Phone number must be 10 digits";
    } else if (!/^98\d{8}$/.test(form.phone)) {
      newErrors.phone = "Phone must start with 98";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (form.password.length > 50) {
      newErrors.password = "Password is too long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      showToast("Please fill all required fields correctly", "error");
      return;
    }

    const response = await fetch("http://localhost:8080/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: "+977 " + form.phone,
        password: form.password,
        role: form.role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setErrors({ general: data.error || "Registration failed." });
      showToast(data.error || "Registration failed.", "error");
      return;
    }

    // Auto-login: Save token and user
    localStorage.setItem("access_token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    showToast("Registration successful!", "success");

    // Redirect based on role
    if (data.user.role === "parent") {
      navigate("/parent/wizard");
    } else if (data.user.role === "tutor") {
      navigate("/tutor/signup");
    } else if (data.user.role === "admin") {
      navigate("/admin/dashboard");
    }
  };

  // Get input styling based on error
  const getInputClass = (fieldName) => {
    const base =
      "w-full rounded-xl border px-4 py-2.5 transition-all focus:outline-none focus:ring-2";
    if (errors[fieldName]) {
      return `${base} border-red-300 bg-red-50 text-slate-800 focus:border-red-500 focus:ring-red-100`;
    }
    return `${base} border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100`;
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-slate-800">
            Create Your TutorLink Account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Join TutorLink Nepal and connect with the right learning
            opportunities.
          </p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={getInputClass("name")}
            />
            {errors.name && (
              <p className="mt-1 text-xs font-medium text-red-600">
                ⚠️ {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={getInputClass("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs font-medium text-red-600">
                ⚠️ {errors.email}
              </p>
            )}
          </div>

          {/* Phone with Nepal Flag */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex items-center rounded-xl border overflow-hidden transition-all ${
                errors.phone
                  ? "border-red-300 bg-red-50 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
                  : "border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100"
              }`}
            >
              <div className="flex items-center gap-1 bg-slate-50 px-3 py-2.5 border-r border-slate-300">
                <span className="text-xl">🇳🇵</span>
                <span className="text-sm font-semibold text-slate-700">
                  +977
                </span>
              </div>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength="10"
                placeholder="98XXXXXXXX"
                className="flex-1 px-4 py-2.5 text-slate-800 focus:outline-none bg-transparent"
              />
            </div>
            {errors.phone ? (
              <p className="mt-1 text-xs font-medium text-red-600">
                ⚠️ {errors.phone}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                Enter 10-digit number
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password (min 6 characters)"
              className={getInputClass("password")}
            />
            {errors.password ? (
              <p className="mt-1 text-xs font-medium text-red-600">
                ⚠️ {errors.password}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                Must be at least 6 characters
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              I am a: <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="parent">Parent</option>
              <option value="tutor">Tutor</option>
            </select>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 active:scale-[0.98]"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
