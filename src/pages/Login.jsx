import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("LOGIN ERROR RESPONSE:", data);
        setError(data.error || "Invalid email or password.");
        return;
      }

      // Save JWT token
      localStorage.setItem("access_token", data.token);

      // Save user information
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Login successful!");
      console.log("Logged in user:", data.user);
      console.log("Has posted:", data.user.has_posted);

      // Redirect according to user's role
      if (data.user.role === "parent") {
        if (!data.user.has_posted) {
          console.log("→ Navigating to wizard");
          navigate("/parent/wizard");
        } else {
          console.log("→ Navigating to matches");
          navigate("/parent/dashboard");
        }
      }  else if (data.user.role === "tutor") {
  if (!data.user.has_profile) {
    console.log("→ Navigating to tutor signup");
    navigate("/tutor/signup");
  } else {
    console.log("→ Navigating to tutor dashboard");
    navigate("/tutor/dashboard");
  }
} else if (data.user.role === "admin") {
  console.log("→ Navigating to admin dashboard");
  navigate("/admin/dashboard");
} else {
  setError("Your account does not have a valid role.");
}
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-slate-800">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your TutorLink account
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 shadow-md shadow-blue-200 mt-2"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
