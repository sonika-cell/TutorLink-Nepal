import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function TutorDashboard() {
  const [parentContacts, setParentContacts] = useState({});
  const navigate = useNavigate();
  const [tuitionPosts, setTuitionPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const { showToast } = useToast();

  // Filters (editable for tutors — they can search freely)
  const [filters, setFilters] = useState({
    subject: "",
    mode: "",
    location: "",
    search: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserName(user.username || "Tutor");

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Please login first");
          setLoading(false);
          return;
        }

        // Fetch tuition posts
        const postsRes = await fetch(
          "http://localhost:8080/api/tuition/posts",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setTuitionPosts(postsData.posts || []);
        }

        // Fetch applications
        const appsRes = await fetch(
          "http://localhost:8080/api/applications/tutor",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplications(appsData.applications || []);
        }

        // Fetch schedules
        const schedulesRes = await fetch(
          "http://localhost:8080/api/schedules/tutor",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (schedulesRes.ok) {
          const schedulesData = await schedulesRes.json();
          setSchedules(schedulesData.schedules || []);
        }

        // NEW: Fetch placements
                // Fetch placements
        const placementsRes = await fetch(
          "http://localhost:8080/api/placements/tutor",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (placementsRes.ok) {
          const placementsData = await placementsRes.json();
          const fetchedPlacements = placementsData.placements || [];
          setPlacements(fetchedPlacements);

          // NEW: Fetch parent contacts for confirmed placements
          const contactsMap = {};
          for (const placement of fetchedPlacements) {
            if (
              placement.status === "confirmed" ||
              placement.status === "paid"
            ) {
              try {
                const contactRes = await fetch(
                  `http://localhost:8080/api/placement/${placement.id}/parent-contact`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  },
                );
                if (contactRes.ok) {
                  const contactData = await contactRes.json();
                  contactsMap[placement.application_id] = contactData;
                }
              } catch (err) {
                console.error("Error fetching parent contact:", err);
              }
            }
          }
          setParentContacts(contactsMap);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter posts
  const filteredPosts = tuitionPosts.filter((post) => {
    if (
      filters.subject &&
      !post.subject?.toLowerCase().includes(filters.subject.toLowerCase())
    )
      return false;
    if (
      filters.mode &&
      post.preferred_mode?.toLowerCase() !== filters.mode.toLowerCase()
    )
      return false;
    if (
      filters.location &&
      !post.location?.toLowerCase().includes(filters.location.toLowerCase())
    )
      return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !post.subject?.toLowerCase().includes(q) &&
        !post.description?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const handleApply = async (postId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        "http://localhost:8080/api/application/apply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tuition_post_id: postId,
            message:
              "I am interested in this tuition. Please consider my application.",
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        showToast("✅ Application submitted successfully!", "success");
        const appsRes = await fetch(
          "http://localhost:8080/api/applications/tutor",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplications(appsData.applications || []);
        }
      } else {
        showToast(data.error || "Failed to submit application", "error");
      }
    } catch (error) {
      console.error("Error applying:", error);
      showToast("Something went wrong", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Banner */}
        <div className="mb-8 rounded-2xl bg-white border-2 border-[#202020] p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👋</span>
            <div>
              <h1 className="text-2xl font-extrabold text-[#202020]">
                Welcome, {userName}!
              </h1>
              <p className="text-sm text-[#202020] mt-1">
                Find tuition opportunities and manage your classes.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border-2 border-[#202020] bg-white p-5">
            <p className="text-sm text-slate-500">Available Posts</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-800">
              {tuitionPosts.length}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Matching opportunities
            </p>
          </div>

          <div className="rounded-2xl border-2 border-[#202020] bg-white p-5">
            <p className="text-sm text-slate-500">My Applications</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-800">
              {applications.length}
            </p>
            <p className="mt-1 text-xs text-slate-400">Submitted</p>
          </div>

          <div className="rounded-2xl border-2 border-[#202020] bg-white p-5">
            <p className="text-sm text-slate-500">My Classes</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-800">
              {schedules.length}
            </p>
            <p className="mt-1 text-xs text-slate-400">Scheduled</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-2xl border-2 border-[#202020] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">🔍 Filters</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Subject
              </label>
              <select
                value={filters.subject}
                onChange={(e) =>
                  setFilters({ ...filters, subject: e.target.value })
                }
                className="w-full rounded-xl border-2 border-[#202020] bg-white px-4 py-3 text-sm font-semibold text-[#202020] focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Any subject</option>
                <option value="English">English</option>
                <option value="Maths">Maths</option>
                <option value="Science">Science</option>
                <option value="Nepali">Nepali</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Mode
              </label>
              <select
                value={filters.mode}
                onChange={(e) =>
                  setFilters({ ...filters, mode: e.target.value })
                }
                className="w-full rounded-xl border-2 border-[#202020] bg-white px-4 py-3 text-sm font-semibold text-[#202020] focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Any mode</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
                className="w-full rounded-xl border-2 border-[#202020] bg-white px-4 py-3 text-sm font-semibold text-[#202020] focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Any location</option>
                <option value="Kathmandu">Kathmandu</option>
                <option value="Lalitpur">Lalitpur</option>
                <option value="Bhaktapur">Bhaktapur</option>
                <option value="Butwal">Butwal</option>
                <option value="Pokhara">Pokhara</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search posts..."
                className="w-full rounded-xl border-2 border-[#202020] bg-white px-4 py-3 text-sm font-semibold text-[#202020] focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <p className="text-slate-500">Loading dashboard...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Available Posts */}
        {!loading && !error && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                🎯 Available Tuition Posts
              </h2>
              <span className="text-sm text-slate-500">
                {filteredPosts.length} post(s)
              </span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="mb-8 rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center bg-white">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-slate-800">
                  No tuition posts available
                </h3>
                <p className="mt-2 text-slate-500">
                  Try changing your filters or check back later.
                </p>
              </div>
            ) : (
              <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => {
                  const applied = applications.find(
                    (a) => a.tuition_post_id === post.id,
                  );

                  return (
                    <div
                      key={post.id}
                      className="rounded-2xl border-2 border-[#202020] bg-white p-6 hover:shadow-lg transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-slate-500">
                          Tuition Post #{post.id}
                        </p>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            post.status === "open"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-800 text-lg">
                        {post.subject}
                      </h3>

                      <div className="mt-3 space-y-2 text-sm">
                        <p className="text-slate-600">
                          <span className="font-semibold">🎓 Grade:</span>{" "}
                          {post.grade}
                        </p>
                        <p className="text-slate-600">
                          <span className="font-semibold">📍 Location:</span>{" "}
                          {post.location || "Not specified"}
                        </p>
                        <p className="text-slate-600">
                          <span className="font-semibold">💻 Mode:</span>{" "}
                          {post.preferred_mode === "online"
                            ? "Online"
                            : "Offline"}
                        </p>
                      </div>

                      {post.description && (
                        <p className="mt-3 text-sm text-slate-500 line-clamp-2">
                          {post.description}
                        </p>
                      )}

                      <button
                        onClick={() => handleApply(post.id)}
                        disabled={!!applied}
                        className={`mt-4 w-full rounded-xl py-3 font-semibold text-sm transition ${
                          applied
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-yellow-500 text-white hover:bg-yellow-600 border-2 border-[#202020]"
                        }`}
                      >
                        {applied
                          ? `✅ Applied (${applied.status})`
                          : "Apply Now"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* My Applications */}
        {!loading && !error && (
          <div className="mb-8 rounded-2xl border-2 border-[#202020] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  📋 My Applications
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Track your applications and pay placement fees.
                </p>
              </div>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                {applications.length} applied
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-bold text-slate-700">
                  No applications yet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Apply to tuition posts and they will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {applications.map((app) => {
                  const placement = placements.find(
                    (p) => p.application_id === app.id,
                  );
                  const needsPayment =
                    app.status === "hired" &&
                    placement &&
                    placement.status !== "confirmed" &&
                    placement.status !== "paid";
                  const canSchedule =
                    app.status === "hired" &&
                    placement &&
                    (placement.status === "confirmed" ||
                      placement.status === "paid");

                  return (
                    <div
                      key={app.id}
                      className="rounded-xl border-2 border-slate-200 p-4"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">
                            Tuition Post #{app.tuition_post_id}
                          </p>
                          <p className="text-sm text-slate-500">
                            Status:{" "}
                            <span
                              className={`font-medium ${
                                app.status === "pending"
                                  ? "text-yellow-600"
                                  : app.status === "accepted"
                                    ? "text-green-600"
                                    : app.status === "hired"
                                      ? "text-teal-600"
                                      : "text-red-600"
                              }`}
                            >
                              {app.status}
                            </span>
                          </p>
                          {app.message && (
                            <p className="text-sm text-slate-500 mt-1">
                              "{app.message}"
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Pay Now Button */}
                      {needsPayment && (
                        <div className="mt-3">
                          <button
                            onClick={() => navigate(`/tutor/payment/${app.id}`)}
                            className="w-full rounded-xl bg-teal-500 py-3 text-sm font-bold text-white transition hover:bg-teal-600"
                          >
                            💰 Pay Rs. {placement.amount} to Complete Hire
                          </button>
                        </div>
                      )}

                      {/* Schedule Demo Button */}
                      {canSchedule && (
                        <div className="mt-3 space-y-3">
                          {/* Parent Contact Card */}
                          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                              ✅ Payment complete · Parent Contact
                            </p>
                            <div className="space-y-1">
                              <p className="text-sm text-slate-700">
                                <span className="font-semibold">👤 Name:</span>{" "}
                                {parentContacts[app.id]?.name || "Loading..."}
                              </p>
                              <p className="text-sm text-slate-700">
                                <span className="font-semibold">📧 Email:</span>{" "}
                                {parentContacts[app.id]?.email || "Loading..."}
                              </p>
                              <p className="text-sm text-slate-700">
                                <span className="font-semibold">📞 Phone:</span>{" "}
                                {parentContacts[app.id]?.phone ||
                                  "Not provided"}
                              </p>
                            </div>
                          </div>

                          {/* Schedule Button */}
                          <button
                            onClick={() =>
                              navigate(`/tutor/schedule/${app.id}`)
                            }
                            className="w-full rounded-xl bg-teal-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-600"
                          >
                            📅 Schedule Demo Class
                          </button>
                        </div>
                      )}

                      {/* Pending setup */}
                      {app.status === "hired" && !placement && (
                        <div className="mt-3 rounded-xl bg-yellow-50 border border-yellow-200 py-2 px-3 text-xs text-yellow-700 font-semibold">
                          ⏳ Placement setup in progress...
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* My Classes */}
        {!loading && !error && (
          <div className="mb-8 rounded-2xl border-2 border-[#202020] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  📅 My Classes
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Join your scheduled online classes.
                </p>
              </div>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                {schedules.length} classes
              </span>
            </div>

            {schedules.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="font-bold text-slate-700">
                  No classes scheduled yet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  When you schedule demo classes, they will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="rounded-xl border-2 border-slate-200 p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">
                          Tuition Post #{schedule.tuition_post_id}
                        </p>
                        <h3 className="font-bold text-slate-800">
                          Class with Parent
                        </h3>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          schedule.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : schedule.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {schedule.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mt-2">
                      📅 {schedule.date} • {schedule.start_time} -{" "}
                      {schedule.end_time}
                    </p>
                    <p className="text-sm text-slate-600">
                      {schedule.mode === "online" ? "💻 Online" : "🏠 Offline"}
                    </p>

                    {schedule.class_type && (
                      <p className="text-sm text-slate-500">
                        Type:{" "}
                        {schedule.class_type === "demo"
                          ? "Demo Class"
                          : "Regular Class"}
                      </p>
                    )}

                    {schedule.notes && (
                      <p className="text-sm text-slate-500 mt-1">
                        📝 {schedule.notes}
                      </p>
                    )}

                    {schedule.mode === "online" &&
                      schedule.meeting_link &&
                      schedule.status === "scheduled" && (
                        <a
                          href={schedule.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 w-full inline-block text-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
                        >
                          🎥 Join Class
                        </a>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorDashboard;