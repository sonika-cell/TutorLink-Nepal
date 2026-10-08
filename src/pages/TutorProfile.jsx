import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function TutorProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
          setError("Please login first");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8080/api/tutor/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTutor(data);
        } else if (response.status === 404) {
          setError("Tutor not found");
        } else {
          setError("Failed to fetch tutor profile");
        }
      } catch (error) {
        console.error("Error fetching tutor:", error);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTutor();
    }
  }, [id]);

  const handleRequest = () => {
    // Navigate to post tuition with tutor pre-selected
    navigate(`/parent/post-tuition?tutor=${id}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-5xl text-center py-20">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-slate-700">Loading tutor profile...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-5xl text-center py-20">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600">{error || "Tutor not found"}</h2>
          <button
            onClick={() => navigate("/parent/find-tutors")}
            className="mt-4 rounded-xl bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Back to Find Tutors
          </button>
        </div>
      </div>
    );
  }

  // Get subjects array
  const subjectsList = tutor.tutor?.subjects 
    ? tutor.tutor.subjects.split(',').map(s => s.trim()) 
    : [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back Button */}
        <button
          onClick={() => navigate("/parent/find-tutors")}
          className="mb-6 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Find Tutors
        </button>

        {/* Profile Header */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-5">

              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-blue-100 text-4xl font-bold text-blue-600">
                {tutor.tutor?.full_name?.charAt(0) || "T"}
              </div>

              <div>
                <h1 className="text-3xl font-extrabold text-slate-800">
                  {tutor.tutor?.full_name || "Tutor"}
                </h1>

                <p className="mt-1 text-lg font-semibold text-blue-600">
                  {tutor.tutor?.subjects || "No subjects listed"}
                </p>

                <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span>📍 {tutor.tutor?.location || "Not specified"}</span>
                  <span>🎓 {tutor.tutor?.qualification || "Not specified"}</span>
                  <span>💼 {tutor.tutor?.experience_years || 0} years experience</span>
                </div>
              </div>

            </div>

            {/* Request Button */}
            <button
              onClick={handleRequest}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-95"
            >
              Send Tuition Request
            </button>

          </div>
        </div>

        {/* Main Information */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* About */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">

            <h2 className="text-xl font-bold text-slate-800">
              About the Tutor
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              {tutor.tutor?.bio || "No bio provided by the tutor."}
            </p>

            {/* CV/Resume Section */}
            {tutor.tutor?.cv_text && (
              <div className="mt-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Professional Summary / CV
                </h2>
                <div className="mt-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <p className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">
                    {tutor.tutor.cv_text}
                  </p>
                </div>
              </div>
            )}

            {/* Subjects */}
            {subjectsList.length > 0 && (
              <>
                <h2 className="mt-8 text-xl font-bold text-slate-800">
                  Subjects I Teach
                </h2>

                <div className="mt-4 flex flex-wrap gap-3">
                  {subjectsList.map((subjectName) => (
                    <span
                      key={subjectName}
                      className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600"
                    >
                      {subjectName}
                    </span>
                  ))}
                </div>
              </>
            )}

          </div>

          {/* Quick Details */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-800">
              Tutor Details
            </h2>

            <div className="mt-5 space-y-5">

              <div>
                <p className="text-sm text-slate-400">
                  Full Name
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  {tutor.tutor?.full_name || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Qualification
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  🎓 {tutor.tutor?.qualification || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Experience
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  💼 {tutor.tutor?.experience_years || 0} years
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Location
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  📍 {tutor.tutor?.location || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Subjects
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  {tutor.tutor?.subjects || "Not specified"}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Why Choose This Tutor */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-800">
            Why Choose This Tutor?
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="text-2xl">🎓</div>
              <h3 className="mt-3 font-bold text-slate-700">Qualified</h3>
              <p className="mt-1 text-sm text-slate-500">
                {tutor.tutor?.qualification 
                  ? `Has ${tutor.tutor.qualification}`
                  : "Strong educational background"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="text-2xl">💼</div>
              <h3 className="mt-3 font-bold text-slate-700">Experienced</h3>
              <p className="mt-1 text-sm text-slate-500">
                {tutor.tutor?.experience_years 
                  ? `${tutor.tutor.experience_years} years of experience`
                  : "Experience helping students"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="text-2xl">📚</div>
              <h3 className="mt-3 font-bold text-slate-700">Subject Expert</h3>
              <p className="mt-1 text-sm text-slate-500">
                {tutor.tutor?.subjects 
                  ? `Teaches ${tutor.tutor.subjects}`
                  : "Specialized in multiple subjects"}
              </p>
            </div>

          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 rounded-2xl bg-blue-600 p-6 text-white shadow-lg">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Interested in this tutor?
              </h2>

              <p className="mt-1 text-sm text-blue-100">
                Send a tuition request and start your learning journey.
              </p>
            </div>

            <button
              onClick={handleRequest}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Send Request
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default TutorProfile;