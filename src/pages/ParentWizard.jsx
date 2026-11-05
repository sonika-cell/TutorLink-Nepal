import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function ParentWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    goal: "",
    subject: "",
    education_level: "",
    subject_level: "",
    mode: "",
    location: "",
    budget: "",
  });
  const [classSearch, setClassSearch] = useState("");
  const { showToast } = useToast();

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep === 2) {
      if (!answers.subject.trim()) {
        showToast("Please select or enter a subject", "error");
        return;
      }
      if (answers.subject.trim().length < 2) {
        showToast("Subject must be at least 2 characters", "error");
        return;
      }
    }

    if (currentStep === 5) {
      if (answers.mode === "At-home" && !answers.location) {
        showToast("Please select a location for at-home tuition", "error");
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setClassSearch("");
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelect = (field, value) => {
    setAnswers({ ...answers, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch("http://localhost:8080/api/tuition/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: answers.subject,
          grade: answers.education_level,
          description: `Goal: ${answers.goal}, Level: ${answers.subject_level}`,
          location: answers.location || "Not specified",
          mode: answers.mode,
          budget: answers.budget || "5000",
          goal: answers.goal,
          education_level: answers.education_level,
          subject_level: answers.subject_level,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.has_posted = true;
        localStorage.setItem("user", JSON.stringify(user));

        showToast("Tuition posted successfully!", "success");
        navigate("/parent/dashboard");
      } else {
        showToast(data.error || "Failed to post tuition", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Something went wrong", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8">
        {/* Header */}
        <div className="mb-8">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="text-[#202020] hover:text-black text-2xl mb-4 font-bold"
            >
              ←
            </button>
          )}

          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-800">
              {currentStep === 1 && "What would you like to achieve?"}
              {currentStep === 2 && "Which subject do you need help with?"}
              {currentStep === 3 && "What is your current education level?"}
              {currentStep === 4 &&
                "What's your current level in this subject?"}
              {currentStep === 5 && "How would you like to learn?"}
              {currentStep === 6 && "What's your monthly budget?"}
            </h1>

            <p className="mt-2 text-slate-500">
              {currentStep === 1 && "We'll match you based on your goal."}
              {currentStep === 2 &&
                "We'll match you with tutors who specialize in this subject."}
              {currentStep === 3 &&
                "This helps us understand your learning stage."}
              {currentStep === 4 &&
                "We match tutors based on your current understanding."}
              {currentStep === 5 &&
                "Choose between online or at-home sessions. You can select both."}
              {currentStep === 6 && "This helps us set a fair placement fee."}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#89CFF0] transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-3">
          {/* STEP 1: Goal */}
          {currentStep === 1 && (
            <>
              {[
                "Build strong basics (recommended)",
                "Homework help and assignments",
                "Prepare for exams",
                "Get better at a subject",
              ].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect("goal", option)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition ${
                    answers.goal === option
                      ? "border-[#202020] bg-[#A9A9A9] text-[#202020] font-semibold"
                      : "border-[#202020] bg-transparent text-[#202020] font-semibold text-sm hover:bg-[#202020] hover:text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </>
          )}

          {/* STEP 2: Subject */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  "English",
                  "Maths",
                  "Science",
                  "Nepali",
                  "Accounts",
                  "Computer Science",
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect("subject", option)}
                    className={`w-full px-5 py-4 rounded-xl border transition ${
                      answers.subject === option
                        ? "border-[#202020] bg-[#A9A9A9] text-[#202020] font-semibold"
                        : "border-[#202020] bg-transparent text-[#202020] font-semibold text-sm hover:bg-[#202020] hover:text-white"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Or enter a custom subject
                </label>
                <input
                  type="text"
                  value={answers.subject}
                  onChange={(e) => handleSelect("subject", e.target.value)}
                  placeholder="e.g. Physics, Chemistry, Biology..."
                  className={`w-full rounded-xl border-2 px-4 py-3 text-base font-semibold text-[#202020] focus:outline-none ${
                    answers.subject && answers.subject.trim().length < 2
                      ? "border-red-500 bg-red-50"
                      : "border-[#202020] focus:border-[#89CFF0]"
                  }`}
                />
                {answers.subject &&
                  answers.subject.trim().length > 0 &&
                  answers.subject.trim().length < 2 && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      ⚠️ Subject must be at least 2 characters
                    </p>
                  )}
                <p className="mt-2 text-xs text-slate-500">
                  💡 Type any subject not listed above
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Education Level — NEW SEARCHABLE LIST */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div>
                <div className="flex items-center rounded-xl border-2 border-[#202020] bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-[#89CFF0] transition">
                  <span className="mr-3 text-slate-400">🔍</span>
                  <input
                    type="text"
                    value={classSearch}
                    onChange={(e) => setClassSearch(e.target.value)}
                    placeholder="Search your class (e.g. Class 8, Bachelor...)"
                    className="flex-1 bg-transparent outline-none text-sm text-[#202020] font-semibold placeholder:text-slate-400"
                  />
                  {classSearch && (
                    <button
                      onClick={() => setClassSearch("")}
                      className="text-slate-400 hover:text-slate-600 text-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Class List */}
              <div className="max-h-80 overflow-y-auto rounded-xl border-2 border-[#202020] p-2 space-y-1">
                {(() => {
                  const classOptions = [
                    ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`),
                    "Bachelor's Degree",
                  ];

                  const filtered = classOptions.filter((c) =>
                    c.toLowerCase().includes(classSearch.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        No results for "{classSearch}"
                      </div>
                    );
                  }

                  return filtered.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSelect("education_level", option)}
                      className={`w-full text-left px-5 py-3 rounded-lg transition ${
                        answers.education_level === option
                          ? "bg-[#202020] text-white font-semibold"
                          : "bg-transparent text-[#202020] font-semibold text-sm hover:bg-slate-100"
                      }`}
                    >
                      {option}
                    </button>
                  ));
                })()}
              </div>

              {/* Selected indicator */}
              {answers.education_level && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm">
                  <p className="text-emerald-700">
                    ✅ Selected:{" "}
                    <span className="font-bold">{answers.education_level}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Subject Level */}
          {currentStep === 4 && (
            <>
              {[
                "Beginner (Starting from basics)",
                "Basic (Know a little, but need clarity)",
                "Intermediate (Need practice & improvement)",
                "Advanced (Exam-focused / mastery)",
              ].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect("subject_level", option)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition ${
                    answers.subject_level === option
                      ? "border-[#202020] bg-[#202020] text-white font-semibold"
                      : "border-[#202020] bg-transparent text-[#202020] font-semibold text-sm hover:bg-[#202020] hover:text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </>
          )}

          {/* STEP 5: Mode */}
          {currentStep === 5 && (
            <>
              <button
                onClick={() => handleSelect("mode", "Online")}
                className={`w-full px-5 py-4 rounded-xl border transition ${
                  answers.mode === "Online"
                    ? "border-[#202020] bg-[#202020] text-white font-semibold"
                    : "border-[#202020] bg-transparent text-[#202020] font-semibold text-sm hover:bg-[#202020] hover:text-white"
                }`}
              >
                Online
              </button>

              <button
                onClick={() => handleSelect("mode", "At-home")}
                className={`w-full px-5 py-4 rounded-xl border transition ${
                  answers.mode === "At-home"
                    ? "border-[#202020] bg-[#202020] text-white font-semibold"
                    : "border-[#202020] bg-transparent text-[#202020] font-semibold text-sm hover:bg-[#202020] hover:text-white"
                }`}
              >
                At-home (face-to-face)
              </button>

              {answers.mode === "At-home" && (
                <>
                  <select
                    value={answers.location}
                    onChange={(e) => handleSelect("location", e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-[#202020] bg-transparent text-[#202020] font-semibold text-sm focus:outline-none"
                  >
                    <option value="">Choose a location</option>
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Chitwan">Chitwan</option>
                    <option value="Biratnagar">Biratnagar</option>
                    <option value="Butwal">Butwal</option>
                    <option value="Dharan">Dharan</option>
                    <option value="Hetauda">Hetauda</option>
                  </select>
                  {!answers.location && (
                    <p className="mt-1 text-xs font-medium text-amber-600">
                      ⚠️ Location is required for at-home tuition
                    </p>
                  )}
                </>
              )}
            </>
          )}

          {/* STEP 6: Budget */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[5000, 10000, 15000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleSelect("budget", amount.toString())}
                    className={`py-4 rounded-xl border transition ${
                      answers.budget === amount.toString()
                        ? "border-[#202020] bg-[#A9A9A9] text-[#202020] font-semibold"
                        : "border-[#202020] bg-transparent text-[#202020] font-semibold text-sm hover:bg-[#202020] hover:text-white"
                    }`}
                  >
                    Rs. {amount.toLocaleString()}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Or enter a custom amount
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-slate-600">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="5000"
                    max="100000"
                    value={answers.budget}
                    onChange={(e) => handleSelect("budget", e.target.value)}
                    placeholder="5000"
                    className={`w-full rounded-xl border-2 px-4 py-3 text-lg font-semibold text-[#202020] focus:outline-none ${
                      answers.budget &&
                      (parseInt(answers.budget) < 5000 ||
                        parseInt(answers.budget) > 100000)
                        ? "border-red-500 bg-red-50"
                        : "border-[#202020] focus:border-[#89CFF0]"
                    }`}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  💰 Range: Rs. 5,000 - Rs. 1,00,000 per month
                </p>

                {answers.budget && parseInt(answers.budget) < 5000 && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    ⚠️ Budget must be at least Rs. 5,000
                  </p>
                )}

                {answers.budget && parseInt(answers.budget) > 100000 && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    ⚠️ Budget cannot exceed Rs. 1,00,000
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Continue / Submit Button */}
        <div className="mt-8">
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !answers.goal) ||
                (currentStep === 2 && !answers.subject.trim()) ||
                (currentStep === 3 && !answers.education_level) ||
                (currentStep === 4 && !answers.subject_level) ||
                (currentStep === 5 && !answers.mode) ||
                (currentStep === 5 &&
                  answers.mode === "At-home" &&
                  !answers.location)
              }
              className="w-full py-4 rounded-xl bg-[#89CFF0] text-[#202020] font-bold text-lg border-2 border-[#202020] transition hover:bg-[#202020] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={
                !answers.budget ||
                parseInt(answers.budget) < 5000 ||
                parseInt(answers.budget) > 100000
              }
              className="w-full py-4 rounded-xl bg-[#89CFF0] text-[#202020] font-bold text-lg border-2 border-[#202020] transition hover:bg-[#202020] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post Tuition →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ParentWizard;