import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ScheduleClassModal from "../components/scheduleClassModal";
import { useToast } from "../context/ToastContext";

function ParentApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError("Please login first");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:8080/api/applications/parent",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        } else {
          setError("Failed to fetch applications");
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Function to handle accept/reject
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
        },
      );

      const data = await response.json();

      if (response.ok) {
        showToast(`Application ${status} successfully!`, "success");
        // Refresh applications
        const refreshResponse = await fetch(
          "http://localhost:8080/api/applications/parent",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setApplications(refreshData.applications || []);
        }
      } else {
        showToast(data.error || "Failed to update application", "error");
      }
    } catch (error) {
      console.error("Error updating application:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  // Get status counts
  const totalApplications = applications.length;
  const pendingCount = applications.filter(
    (app) => app.status === "pending",
  ).length;
  const acceptedCount = applications.filter(
    (app) => app.status === "accepted",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/parent/dashboard")}
            className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-extrabold text-slate-800">
            My Applications
          </h1>

          <p className="mt-2 text-slate-500">
            Track the tutor applications for your tuition posts.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Applications</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-800">
              {totalApplications}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-extrabold text-yellow-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Accepted</p>
            <p className="mt-2 text-3xl font-extrabold text-green-600">
              {acceptedCount}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-10">
            <p className="text-slate-500">Loading applications...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Applications */}
        {!loading && !error && (
          <div className="space-y-6">
            {applications.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
                  📝
                </div>
                <h3 className="mt-4 font-bold text-slate-700">
                  No applications yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  When tutors apply to your tuition posts, they will appear here.
                </p>
                <button
                  onClick={() => navigate("/parent/post-tuition")}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Post a Tuition
                </button>
              </div>
            ) : (
              applications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  {/* Top */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-600">
                        Tuition Post #{application.tuition_post_id}
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-slate-800">
                        Tutor #{application.tutor_id}
                      </h2>
                    </div>

                    <span
                      className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                        application.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : application.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>

                  {/* Message */}
                  {application.message && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-700">
                        Tutor's Message
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        "{application.message}"
                      </p>
                    </div>
                  )}

                  {/* Bottom */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-400">
                      Applied: {new Date(application.created_at).toLocaleDateString()}
                    </p>

                    {application.status === "accepted" && (
                      <div className="flex gap-2">
                        <p className="font-semibold text-green-600">
                          ✓ Tutor accepted
                        </p>
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowModal(true);
                          }}
                          className="ml-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                        >
                          📅 Schedule Class
                        </button>
                      </div>
                    )}

                    {application.status === "pending" && (
                      <div className="flex gap-2">
                        <p className="font-semibold text-yellow-600">
                          ⏳ Waiting for your decision
                        </p>
                        <button
                          onClick={() => handleStatusUpdate(application.id, "accepted")}
                          className="ml-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
                        >
                          ✅ Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(application.id, "rejected")}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}

                    {application.status === "rejected" && (
                      <p className="font-semibold text-red-600">
                        ✗ Application was rejected
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showModal && selectedApplication && (
        <ScheduleClassModal
          application={selectedApplication}
          onClose={() => {
            setShowModal(false);
            setSelectedApplication(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setSelectedApplication(null);
            // Refresh applications
            const fetchApplications = async () => {
              const token = localStorage.getItem("access_token");
              const response = await fetch("http://localhost:8080/api/applications/parent", {
                headers: { "Authorization": `Bearer ${token}` },
              });
              if (response.ok) {
                const data = await response.json();
                setApplications(data.applications || []);
              }
            };
            fetchApplications();
          }}
        />
      )}
    </div>
  );
}

export default ParentApplications;