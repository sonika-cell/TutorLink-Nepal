import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function TutorSignup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // User info from login
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    highest_class: "",
    subjects: "",
    password: "",
    confirm_password: "",
    location: "",
    cv_text: "",
    cv_path: "",
  });

  const [errors, setErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState("");

  // CV file state
  const [cvFile, setCvFile] = useState(null);
  const [cvError, setCvError] = useState("");
  const { showToast } = useToast();

  const totalSteps = 3;

  // Load logged-in user info
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserEmail(user.email || "");
    setUserName(user.username || "");
    setForm((prev) => ({
      ...prev,
      email: user.email || "",
      full_name: user.username || "",
    }));
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // For phone, only allow digits and max 10
    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm({ ...form, [name]: value });

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    setCvError("");
    const file = e.target.files[0];

    if (!file) {
      setCvFile(null);
      return;
    }

    // Check file type — PDF only
    if (file.type !== "application/pdf") {
      setCvError("Only PDF files are allowed");
      setCvFile(null);
      e.target.value = "";
      return;
    }

    // Check file size — max 2MB
    if (file.size > 2 * 1024 * 1024) {
      setCvError("File size must be less than 2MB");
      setCvFile(null);
      e.target.value = "";
      return;
    }

    setCvFile(file);
  };

  // ==========================================================
  // VALIDATION FUNCTIONS
  // ==========================================================

  const validateStep1 = () => {
    const newErrors = {};

    // Full Name
    if (!form.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (form.full_name.trim().length < 2) {
      newErrors.full_name = "Name must be at least 2 characters";
    } else if (form.full_name.trim().length > 50) {
      newErrors.full_name = "Name must be less than 50 characters";
    }

    // Phone
    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (form.phone.length !== 10) {
      newErrors.phone = "Phone number must be 10 digits";
    } else if (!/^98\d{8}$/.test(form.phone)) {
      newErrors.phone = "Phone must start with 98";
    }

    // Highest Class
    if (!form.highest_class) {
      newErrors.highest_class = "Please select highest class";
    }

    // Subjects
    if (!form.subjects.trim()) {
      newErrors.subjects = "Please enter at least one subject";
    } else if (form.subjects.trim().length < 2) {
      newErrors.subjects = "Subject name is too short";
    }

    // Password
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm Password
    if (!form.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (form.password !== form.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    // Location
    if (!form.location.trim()) {
      newErrors.location = "Location is required";
    } else if (form.location.trim().length < 3) {
      newErrors.location = "Location must be at least 3 characters";
    } else if (form.location.trim().length > 100) {
      newErrors.location = "Location is too long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    // CV file
    if (!cvFile) {
      newErrors.cv = "Please upload your CV (PDF)";
    }
    if (cvError) {
      newErrors.cv = cvError;
    }

    // CV Text
    if (!form.cv_text.trim()) {
      newErrors.cv_text = "Professional summary is required";
    } else if (form.cv_text.trim().length < 20) {
      newErrors.cv_text = "Please write at least 20 characters";
    }

    // Agree Terms
    if (!agreeTerms) {
      newErrors.agreeTerms = "Please agree to the terms and conditions";
    }

    // Digital Signature
    if (!digitalSignature.trim()) {
      newErrors.digitalSignature = "Please type your full name to sign";
    } else if (
      digitalSignature.trim().toLowerCase() !==
      form.full_name.trim().toLowerCase()
    ) {
      newErrors.digitalSignature =
        "Digital signature must match your full name exactly";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleNext = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }

    if (!isValid) {
      showToast("Please fill all required fields correctly", "error");
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate Step 3
    const isValid = validateStep3();

    if (!isValid) {
      showToast("Please fill all required fields correctly", "error");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      // STEP 1: Create the profile first
      const profileRes = await fetch("http://localhost:8080/api/tutor/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          phone: form.phone,
          subjects: form.subjects.trim(),
          highest_class: form.highest_class,
          qualification: form.highest_class,
          experience_years: 0,
          bio: form.cv_text.trim(),
          location: form.location.trim(),
          cv_text: form.cv_text.trim(),
        }),
      });

      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        showToast(profileData.error || "Failed to create profile", "error");
        setLoading(false);
        return;
      }

      // STEP 2: Upload the CV file
      const formData = new FormData();
      formData.append("cv", cvFile);

      const cvRes = await fetch("http://localhost:8080/api/tutor/upload-cv", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const cvData = await cvRes.json();

      if (!cvRes.ok) {
        showToast(cvData.error || "Failed to upload CV", "error");
        setLoading(false);
        return;
      }

      // Update user has_profile flag
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.has_profile = true;
      localStorage.setItem("user", JSON.stringify(user));

      showToast("Profile created successfully with CV!", "success");
      navigate("/tutor/dashboard");
    } catch (err) {
      console.error("Error:", err);
      showToast("Unable to connect to server", "error");
    } finally {
      setLoading(false);
    }
  };

  // Get input class based on error
  const getInputClass = (fieldName) => {
    const base =
      "w-full rounded-xl border px-4 py-3 text-slate-800 transition-all focus:outline-none focus:ring-2";
    if (errors[fieldName]) {
      return `${base} border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100`;
    }
    return `${base} border-slate-300 focus:border-yellow-500 focus:ring-yellow-100`;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl bg-white rounded-3xl shadow-xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800">
            {currentStep === 1 && "Teacher Signup"}
            {currentStep === 2 && "Where do you live?"}
            {currentStep === 3 && "Upload CV & Terms"}
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            {currentStep === 1 && "Create your account to apply as a teacher"}
            {currentStep === 2 && "Step 2 of 3: Select your location"}
            {currentStep === 3 && "Step 3 of 3: Upload your CV and accept terms"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={getInputClass("full_name")}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.full_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-slate-400">
                ℹ️ Must match your registered email
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength="10"
                placeholder="98XXXXXXXX"
                className={getInputClass("phone")}
              />
              {errors.phone ? (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.phone}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  Enter 10-digit number starting with 98
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Highest Class You Can Teach <span className="text-red-500">*</span>
              </label>
              <select
                name="highest_class"
                value={form.highest_class}
                onChange={handleChange}
                className={getInputClass("highest_class")}
              >
                <option value="">Select highest class</option>
                <option value="Primary (1-5)">Primary (1-5)</option>
                <option value="Lower Secondary (6-8)">Lower Secondary (6-8)</option>
                <option value="Secondary (9-10)">Secondary (9-10)</option>
                <option value="Higher Secondary (11-12)">
                  Higher Secondary (11-12)
                </option>
                <option value="Bachelor">Bachelor Degree</option>
                <option value="Master">Master's Degree</option>
              </select>
              {errors.highest_class && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.highest_class}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Subjects You Can Teach <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subjects"
                value={form.subjects}
                onChange={handleChange}
                placeholder="e.g. Mathematics, Physics, Science"
                className={getInputClass("subjects")}
              />
              {errors.subjects ? (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.subjects}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  Separate multiple subjects with commas
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Create Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={getInputClass("password")}
              />
              {errors.password ? (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.password}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  At least 6 characters
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                className={getInputClass("confirm_password")}
              />
              {errors.confirm_password && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.confirm_password}
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Full Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Narayanhiti, Kathmandu"
                className={getInputClass("location")}
              />
              {errors.location ? (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.location}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  Enter your complete address
                </p>
              )}
            </div>

            <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center bg-slate-50">
              <p className="text-slate-500 text-sm">
                🗺️ Map will be added in the next version
              </p>
              <p className="text-xs text-slate-400 mt-2">
                For now, please enter your full address above
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: CV & Terms */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Upload CV (PDF only, max 2MB){" "}
                <span className="text-red-500">*</span>
              </label>
              <div
                className={`rounded-xl border-2 border-dashed p-6 text-center transition ${
                  errors.cv
                    ? "border-red-300 bg-red-50"
                    : "border-[#202020] bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <input
                  type="file"
                  id="cv-upload"
                  name="cv"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="cv-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="text-4xl mb-2">📄</div>
                  {cvFile ? (
                    <>
                      <p className="text-sm font-semibold text-green-700">
                        ✅ {cvFile.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {(cvFile.size / 1024).toFixed(1)} KB
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Click to change file
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-[#202020]">
                        Choose CV File
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PDF only • Max 2MB
                      </p>
                    </>
                  )}
                </label>
              </div>
              {errors.cv && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.cv}
                </p>
              )}
              {cvError && !errors.cv && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {cvError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Professional Summary / CV Text <span className="text-red-500">*</span>
              </label>
              <textarea
                name="cv_text"
                value={form.cv_text}
                onChange={handleChange}
                rows="6"
                placeholder="Describe your experience, qualifications, achievements... (min 20 characters)"
                className={getInputClass("cv_text")}
                style={{ resize: "none" }}
              />
              {errors.cv_text ? (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.cv_text}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  {form.cv_text.length} characters (min 20)
                </p>
              )}
            </div>

            {/* Terms */}
            <div>
              <h3 className="font-bold text-slate-800 mb-2">
                Terms and Conditions
              </h3>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 max-h-48 overflow-y-auto text-sm text-slate-600">
                <p className="font-semibold text-slate-700">
                  Teacher Application Terms:
                </p>
                <p className="mt-2">
                  1. <strong>Declaration of Information Accuracy:</strong> The
                  applicant declares that all information provided is true and
                  accurate.
                </p>
                <p className="mt-2">
                  2. <strong>Teaching Responsibilities:</strong> Provide
                  high-quality teaching services, be punctual, and maintain
                  confidentiality.
                </p>
                <p className="mt-2">
                  3. <strong>Privacy Compliance:</strong> All student
                  information must be handled in accordance with Nepal's
                  Individual Privacy Act.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms) {
                    setErrors({ ...errors, agreeTerms: "" });
                  }
                }}
                className="mt-1 w-4 h-4 accent-yellow-500"
              />
              <span className="text-sm text-slate-700">
                I have read and agree to the terms and conditions{" "}
                <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-xs font-medium text-red-600">
                ⚠️ {errors.agreeTerms}
              </p>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Digital Confirmation <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Type your full name exactly as entered above to sign
              </p>
              <input
                type="text"
                value={digitalSignature}
                onChange={(e) => {
                  setDigitalSignature(e.target.value);
                  if (errors.digitalSignature) {
                    setErrors({ ...errors, digitalSignature: "" });
                  }
                }}
                placeholder="Type your full name"
                className={getInputClass("digitalSignature")}
              />
              {errors.digitalSignature && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  ⚠️ {errors.digitalSignature}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-8 flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 rounded-xl border-2 border-[#202020] bg-transparent text-[#202020] font-semibold py-3 transition hover:bg-[#202020] hover:text-white"
            >
              ← Back
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="flex-1 rounded-xl bg-yellow-500 text-white font-bold py-3 transition hover:bg-yellow-600"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 rounded-xl bg-yellow-500 text-white font-bold py-3 transition hover:bg-yellow-600 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Profile"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default TutorSignup;