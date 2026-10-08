import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../context/ToastContext";

function AdminReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:8080/api/admin/reports",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setReports(data.reports || []);
          setFilteredReports(data.reports || []);
        } else {
          setError(data.error || "Failed to fetch reports");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [navigate]);

  // Apply filters
  useEffect(() => {
    let result = [...reports];

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.reporter_name?.toLowerCase().includes(q) ||
          r.reporter_email?.toLowerCase().includes(q) ||
          r.reason?.toLowerCase().includes(q) ||
          r.reported_name?.toLowerCase().includes(q)
      );
    }

    setFilteredReports(result);
  }, [searchQuery, statusFilter, reports]);

  // Update report status
  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8080/api/admin/reports/${reportId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setReports(
          reports.map((r) =>
            r.id === reportId ? { ...r, status: newStatus } : r
          )
        );
        showToast(`Report #${reportId} marked as ${newStatus}`, "success");
      } else {
        showToast(data.error || "Failed to update", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700",
      reviewed: "bg-blue-100 text-blue-700",
      resolved: "bg-emerald-100 text-emerald-700",
    };
    return colors[status] || "bg-slate-100 text-slate-600";
  };

  return (
    <AdminLayout>
      {/* Page Heading */}
      <div className="mb-7">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          Moderation
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#10243e]">
          Reports
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Reported users and posts
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
                placeholder="Search by reporter, reason, or reported user..."
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
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Count */}
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total
            </p>
            <p className="mt-1 text-lg font-extrabold text-[#10243e]">
              {filteredReports.length} report
              {filteredReports.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
          <p className="text-sm text-slate-500">Loading reports...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      )}

      {/* Reports List */}
      {!loading && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-extrabold text-[#10243e]">
              All Reports
            </h2>
            <p className="text-xs text-slate-400">
              Complete list of user reports
            </p>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
                ⚠
              </div>
              <h3 className="font-bold text-slate-700">No reports found</h3>
              <p className="mt-1 text-sm text-slate-400">
                There are no reports matching your filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-6">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-400">
                          Report #{report.id}
                        </p>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase ${getStatusBadge(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-extrabold text-[#10243e]">
                        {report.reason}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  {report.description && (
                    <p className="mt-3 text-sm text-slate-600">
                      {report.description}
                    </p>
                  )}

                  {/* Details Grid */}
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {/* Reporter */}
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Reporter
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {report.reporter_name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {report.reporter_email}
                      </p>
                    </div>

                    {/* Reported User */}
                    {report.reported_name && (
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Reported User
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {report.reported_name}
                        </p>
                      </div>
                    )}

                    {/* Reported Post */}
                    {report.reported_post && (
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Reported Post
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {report.reported_post}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-400">
                      Reported: {report.created_at}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {report.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(report.id, "reviewed")
                            }
                            className="rounded-xl bg-blue-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-600"
                          >
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(report.id, "resolved")
                            }
                            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-600"
                          >
                            Mark Resolved
                          </button>
                        </>
                      )}

                      {report.status === "reviewed" && (
                        <button
                          onClick={() =>
                            handleStatusChange(report.id, "resolved")
                          }
                          className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-600"
                        >
                          Mark Resolved
                        </button>
                      )}

                      {report.status === "resolved" && (
                        <span className="text-xs font-bold text-emerald-600">
                          ✅ Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminReports;