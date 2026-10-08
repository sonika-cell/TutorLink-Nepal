import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

function AdminApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:8080/api/admin/applications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setApplications(data.applications || []);
          setFilteredApplications(data.applications || []);
        } else {
          setError(data.error || "Failed to fetch applications");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  // Apply filters
  useEffect(() => {
    let result = [...applications];

    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.tutor_name?.toLowerCase().includes(q) ||
          a.tutor_email?.toLowerCase().includes(q) ||
          a.parent_name?.toLowerCase().includes(q) ||
          a.post_subject?.toLowerCase().includes(q)
      );
    }

    setFilteredApplications(result);
  }, [searchQuery, statusFilter, applications]);

  // Get status badge
  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700",
      accepted: "bg-emerald-100 text-emerald-700",
      hired: "bg-teal-100 text-teal-700",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-slate-100 text-slate-600";
  };

  return (
    <AdminLayout>
      {/* Page Heading */}
      <div className="mb-7">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          Management
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#10243e]">
          Applications
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          View all tutor applications
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          {/* Search */}
          <div className="flex-1">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Search
            </label>
            <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
              <span className="mr-3 text-slate-400">⌕</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by tutor, parent, or subject..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-56">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-teal-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Count */}
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total
            </p>
            <p className="mt-1 text-lg font-extrabold text-[#10243e]">
              {filteredApplications.length} application
              {filteredApplications.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
          <p className="text-sm text-slate-500">Loading applications...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      )}

      {/* Applications Table */}
      {!loading && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-extrabold text-[#10243e]">
              All Applications
            </h2>
            <p className="text-xs text-slate-400">
              Complete list of tutor applications
            </p>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
                ▤
              </div>
              <h3 className="font-bold text-slate-700">
                No applications found
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      ID
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Tutor
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Parent
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Tuition Post
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Applied
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-slate-50 transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4 font-bold text-[#10243e]">
                        #{app.id}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">
                          {app.tutor_name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {app.tutor_email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">
                          {app.parent_name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {app.parent_email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">
                          {app.post_subject || "-"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {app.post_grade}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {app.created_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminApplications;