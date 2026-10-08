import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function ParentDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [myPost, setMyPost] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Please login first");
          setLoading(false);
          return;
        }

        const user = JSON.parse(localStorage.getItem("user") || "{}");

        // 1. Fetch my post
        const postsRes = await fetch("http://localhost:8080/api/tuition/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const postsData = await postsRes.json();
        const myPostData = postsData.posts?.find(
          (p) => p.parent_id === user.id
        );
        setMyPost(myPostData);

        // 2. Fetch applications
        const appsRes = await fetch(
          "http://localhost:8080/api/applications/parent",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          const apps = appsData.applications || [];
          setApplications(apps);

          // 3. Fetch tutor profiles for applicants
          const tutorPromises = apps.map((app) =>
            fetch(`http://localhost:8080/api/tutor/${app.tutor_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => (res.ok ? res.json() : null))
              .catch(() => null)
          );

          const tutorResults = await Promise.all(tutorPromises);
          const validTutors = tutorResults.filter((t) => t !== null);
          setTutors(validTutors);
          setFilteredTutors(validTutors);
        }

        // 4. Fetch schedules
        const schedulesRes = await fetch(
          "http://localhost:8080/api/schedules/parent",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (schedulesRes.ok) {
          const schedulesData = await schedulesRes.json();
          setSchedules(schedulesData.schedules || []);
        }

        // 5. Fetch placements
        const placementsRes = await fetch(
          "http://localhost:8080/api/placements/parent",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (placementsRes.ok) {
          const placementsData = await placementsRes.json();
          setPlacements(placementsData.placements || []);
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

  // Search filter
  useEffect(() => {
    let result = [...tutors];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.tutor?.full_name?.toLowerCase().includes(q) ||
          t.tutor?.subjects?.toLowerCase().includes(q)
      );
    }
    setFilteredTutors(result);
  }, [searchQuery, tutors]);

  // Handle reject
  const handleStatusUpdate = async (applicationId, status) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8080/api/application/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showToast(`Application ${status} successfully!`, "success");
        const appsRes = await fetch(
          "http://localhost:8080/api/applications/parent",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplications(appsData.applications || []);
        }
      } else {
        showToast(data.error || "Failed to update application", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  // Handle Confirm Hire
  const handleConfirmHire = async (applicationId) => {
    if (
      !window.confirm(
        "Confirm hire? The tutor will be notified and must complete the TutorLink placement payment before scheduling begins."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8080/api/placement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ application_id: applicationId }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Hire confirmed! The tutor will be notified.", "success");
        const appsRes = await fetch(
          "http://localhost:8080/api/applications/parent",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplications(appsData.applications || []);
        }
      } else {
        showToast(data.error || "Failed to confirm hire", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Something went wrong", "error");
    }
  };

  // Get smart status message for hired applications
  const getHiredStatusMessage = (app) => {
    const placement = placements.find((p) => p.application_id === app.id);
    const scheduledClass = schedules.find((s) => s.application_id === app.id);

    // Case 1: Tutor already scheduled the demo class
    if (scheduledClass) {
      return (
        <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
          <p className="text-xs text-emerald-700 font-semibold">
            ✅ Tutor scheduled your demo class!
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            📅 {scheduledClass.date} • {scheduledClass.start_time} -{" "}
            {scheduledClass.end_time}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            Check "My Classes" below to join.
          </p>
        </div>
      );
    }

    // Case 2: Tutor has paid placement fee but hasn't scheduled yet
    if (
      placement &&
      (placement.status === "confirmed" || placement.status === "paid")
    ) {
      return (
        <div className="mt-3 rounded-xl bg-teal-50 border border-teal-200 p-3">
          <p className="text-xs text-teal-700 font-semibold">
            💰 Tutor has paid the placement fee!
          </p>
          <p className="text-xs text-teal-600 mt-1">
            Waiting for the tutor to schedule a demo class.
          </p>
        </div>
      );
    }

    // Case 3: Placement is pending payment
    if (placement && placement.status === "pending_payment") {
      return (
        <div className="mt-3 rounded-xl bg-blue-50 border border-blue-200 p-3">
          <p className="text-xs text-blue-700 font-semibold">
            ⏳ Waiting for tutor to complete placement payment
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Once the tutor pays, they will schedule a demo class.
          </p>
        </div>
      );
    }

    // Case 4: No placement yet (processing)
    return (
      <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
        <p className="text-xs text-slate-600 font-semibold">
          ⏳ Setting up placement...
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Success Banner */}
        {myPost && (
          <div className="mb-8 rounded-2xl bg-[#89CFF0] border-2 border-[#202020] p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <h1 className="text-2xl font-extrabold text-[#202020]">
                  Your Tuition Post is Live!
                </h1>
                <p className="text-sm text-[#202020] mt-1">
                  Tutors are viewing your post. Applicants will appear below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* My Post Summary */}
        {myPost && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border-2 border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                📋 Your Tuition Post
              </h2>
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {myPost.status}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">
                  Level
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {myPost.grade || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">
                  Subject
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {myPost.subject || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">
                  Mode
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {myPost.preferred_mode === "online"
                    ? "💻 Online"
                    : "🏠 Offline"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">
                  Location
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  📍 {myPost.location || "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Post Yet */}
        {!loading && !myPost && (
          <div className="mb-8 rounded-2xl bg-white p-10 shadow-sm border-2 border-dashed border-slate-200 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-slate-800">
              No tuition post yet
            </h3>
            <p className="mt-2 text-slate-500">Create a post to find tutors.</p>
            <button
              onClick={() => navigate("/parent/wizard")}
              className="mt-5 rounded-xl bg-[#89CFF0] border-2 border-[#202020] text-[#202020] font-semibold px-6 py-3 transition hover:bg-[#202020] hover:text-white"
            >
              Post Tuition
            </button>
          </div>
        )}

        {/* Filters */}
        {myPost && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Filters</h2>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Level
                </label>
                <div className="w-full rounded-xl border-2 border-[#202020] bg-[#F5F5F5] px-4 py-3 text-sm font-semibold text-[#202020] cursor-not-allowed">
                  {myPost.grade || "Not set"}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Subject
                </label>
                <div className="w-full rounded-xl border-2 border-[#202020] bg-[#F5F5F5] px-4 py-3 text-sm font-semibold text-[#202020] cursor-not-allowed">
                  {myPost.subject || "Not set"}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Mode
                </label>
                <div className="w-full rounded-xl border-2 border-[#202020] bg-[#F5F5F5] px-4 py-3 text-sm font-semibold text-[#202020] cursor-not-allowed">
                  {myPost.preferred_mode === "online"
                    ? "Online"
                    : myPost.preferred_mode === "offline"
                    ? "Offline"
                    : "Not set"}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Location
                </label>
                <div className="w-full rounded-xl border-2 border-[#202020] bg-[#F5F5F5] px-4 py-3 text-sm font-semibold text-[#202020] cursor-not-allowed">
                  {myPost.location || "Not set"}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Search by name
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tutors..."
                  className="w-full rounded-xl border-2 border-[#202020] bg-white px-4 py-3 text-sm font-semibold text-[#202020] focus:outline-none focus:ring-2 focus:ring-[#89CFF0]"
                />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              ℹ️ Your post details cannot be changed after posting.
            </p>
          </div>
        )}

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

        {/* Applicant Tutors */}
        {!loading && !error && myPost && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                🎯 Tutors who applied to your post
              </h2>
              <span className="text-sm text-slate-500">
                {filteredTutors.length} tutor(s)
              </span>
            </div>

            {filteredTutors.length === 0 ? (
              <div className="mb-8 rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center bg-white">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-slate-800">
                  No tutors have applied yet
                </h3>
                <p className="mt-2 text-slate-500">
                  When tutors apply to your post, they will appear here.
                </p>
              </div>
            ) : (
              <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTutors.map((item) => {
                  const tutor = item.tutor || {};
                  const application = applications.find(
                    (a) => a.tutor_id === tutor.user_id
                  );

                  return (
                    <div
                      key={tutor.id}
                      className="rounded-2xl border-2 border-[#202020] bg-white p-6 hover:shadow-lg transition"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#89CFF0] text-2xl font-bold text-[#202020] border-2 border-[#202020]">
                          {tutor.full_name?.charAt(0) || "T"}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">
                            {tutor.full_name || "Unknown Tutor"}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {tutor.qualification || "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <p className="text-slate-600">
                          <span className="font-semibold">📚 Subjects:</span>{" "}
                          {tutor.subjects || "Not specified"}
                        </p>
                        <p className="text-slate-600">
                          <span className="font-semibold">💼 Experience:</span>{" "}
                          {tutor.experience_years || 0} years
                        </p>
                        <p className="text-slate-600">
                          <span className="font-semibold">📍 Location:</span>{" "}
                          {tutor.location || "Not specified"}
                        </p>
                      </div>

                      <button
                        onClick={() => navigate(`/tutor/${tutor.user_id}`)}
                        className="w-full rounded-xl border-2 border-[#202020] bg-transparent text-[#202020] font-semibold text-sm py-2 transition hover:bg-[#202020] hover:text-white"
                      >
                        View Profile
                      </button>

                      {application && (
                        <div className="mt-3 text-center">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              application.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : application.status === "hired"
                                ? "bg-teal-100 text-teal-700"
                                : application.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            Application: {application.status}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* My Applications */}
        {!loading && !error && (
          <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  📋 My Applications
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage applications from tutors.
                </p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                {applications.length} applications
              </span>
            </div>

            <div className="grid gap-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">
                        Tuition Post #{app.tuition_post_id}
                      </p>
                      <p className="text-sm text-slate-500">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            app.status === "pending"
                              ? "text-yellow-600"
                              : app.status === "hired"
                              ? "text-teal-600"
                              : app.status === "accepted"
                              ? "text-green-600"
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

                  {app.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleConfirmHire(app.id)}
                        className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 transition"
                      >
                        🎯 Confirm Hire
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app.id, "rejected")}
                        className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}

                  {app.status === "hired" && getHiredStatusMessage(app)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Classes */}
        {!loading && !error && (
          <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  📅 My Classes
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Join your scheduled online classes.
                </p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
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
                  After the tutor pays and schedules a demo class, it will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-blue-600 mb-1">
                          Tuition Post #{schedule.tuition_post_id}
                        </p>
                        <h3 className="font-bold text-slate-800">
                          Class with Tutor
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

                    <p className="text-sm text-slate-600 mt-1">
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

export default ParentDashboard;