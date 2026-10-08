import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function FindTutors() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [subject, setSubject] = useState("");
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tutors from backend
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
          setError("Please login first");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8080/api/tutors", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTutors(data.tutors || []);
        } else {
          setError("Failed to fetch tutors");
        }
      } catch (error) {
        console.error("Error fetching tutors:", error);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  // Filter tutors based on search
  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch =
      tutor.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      tutor.subjects?.toLowerCase().includes(search.toLowerCase()) ||
      tutor.qualification?.toLowerCase().includes(search.toLowerCase());

    const matchesLocation =
      location === "" || tutor.location?.toLowerCase() === location.toLowerCase();

    const matchesSubject =
      subject === "" || tutor.subjects?.toLowerCase().includes(subject.toLowerCase());

    return matchesSearch && matchesLocation && matchesSubject;
  });

  // Get unique locations for filter dropdown
  const locations = [...new Set(tutors.map(t => t.location).filter(Boolean))];
  
  // Get unique subjects for filter dropdown
  const allSubjects = tutors.flatMap(t => 
    t.subjects ? t.subjects.split(',').map(s => s.trim()) : []
  );
  const uniqueSubjects = [...new Set(allSubjects)];

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/parent/dashboard")}
            className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-slate-800">
            Find a Tutor
          </h1>

          <p className="mt-2 text-slate-600">
            Search and connect with qualified tutors on TutorLink Nepal.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-slate-800">
            Search Tutors
          </h2>

          <div className="grid gap-4 md:grid-cols-3">

            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search
              </label>

              <input
                type="text"
                placeholder="Tutor name, subject, or qualification"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Subject
              </label>

              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Location
              </label>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Results */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            Available Tutors
          </h2>

          <span className="text-sm text-slate-500">
            {loading ? "Loading..." : `${filteredTutors.length} tutor(s) found`}
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <div className="mb-4 text-4xl">⏳</div>
            <h3 className="text-xl font-bold text-slate-800">Loading tutors...</h3>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl bg-red-50 border border-red-200 py-16 text-center shadow-sm">
            <div className="mb-4 text-4xl">❌</div>
            <h3 className="text-xl font-bold text-red-700">{error}</h3>
            <p className="mt-2 text-red-500">Please try again later.</p>
          </div>
        )}

        {/* Tutors Grid */}
        {!loading && !error && (
          filteredTutors.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">

              {filteredTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Tutor Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">

                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                        {tutor.full_name?.charAt(0) || "T"}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-800">
                          {tutor.full_name || "Tutor"}
                        </h3>

                        <p className="text-sm text-blue-600">
                          {tutor.subjects || "No subjects listed"}
                        </p>
                      </div>

                    </div>

                    <div className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                      {tutor.experience_years || 0} years
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-5 space-y-2 text-sm text-slate-600">
                    <p>
                      🎓 <span className="font-medium">Qualification:</span>{" "}
                      {tutor.qualification || "Not specified"}
                    </p>

                    <p>
                      💼 <span className="font-medium">Subjects:</span>{" "}
                      {tutor.subjects || "Not specified"}
                    </p>

                    <p>
                      📍 <span className="font-medium">Location:</span>{" "}
                      {tutor.location || "Not specified"}
                    </p>

                    {tutor.cv_text && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        📄 {tutor.cv_text.substring(0, 100)}
                        {tutor.cv_text.length > 100 && "..."}
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="mt-6 flex gap-3">

                    <button
                      onClick={() => navigate(`/tutor/${tutor.user_id}`)}
                      className="flex-1 rounded-xl border border-blue-600 px-4 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        // Navigate to parent post tuition with tutor pre-selected
                        navigate(`/parent/post-tuition?tutor=${tutor.user_id}`);
                      }}
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Send Request
                    </button>

                  </div>
                </div>
              ))}

            </div>
          ) : (
            <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
              <div className="mb-4 text-5xl">🔍</div>

              <h3 className="text-xl font-bold text-slate-800">
                No tutors found
              </h3>

              <p className="mt-2 text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          )
        )}

      </div>
    </div>
  );
}

export default FindTutors;