import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function TutorApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError("Please login first");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8080/api/applications/tutor", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/tutor/dashboard")}
            className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-extrabold text-slate-800">
            My Applications
          </h1>

          <p className="mt-2 text-slate-500">
            Track the tuition posts you have applied to.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Applications</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-800">
              {applications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-extrabold text-yellow-600">
              {applications.filter(a => a.status === "pending").length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Accepted</p>
            <p className="mt-2 text-3xl font-extrabold text-green-600">
              {applications.filter(a => a.status === "accepted").length}
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
                  Apply to tuition posts and they will appear here.
                </p>
                <button
                  onClick={() => navigate("/tutor/dashboard")}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Find Tuition
                </button>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">
                        Tuition Post #{app.tuition_post_id}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Status: <span className={`font-medium ${
                          app.status === 'pending' ? 'text-yellow-600' :
                          app.status === 'accepted' ? 'text-green-600' :
                          'text-red-600'
                        }`}>{app.status}</span>
                      </p>
                    </div>

                    <span className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                      app.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : app.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  {app.message && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-700">
                        Your Message
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        "{app.message}"
                      </p>
                    </div>
                  )}

                  <p className="mt-4 text-sm text-slate-400">
                    Applied: {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default TutorApplications;