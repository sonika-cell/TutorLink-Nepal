import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

function AdminPlacements() {
  const navigate = useNavigate();
  const [placements, setPlacements] = useState([]);
  const [filteredPlacements, setFilteredPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch placements
  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:8080/api/admin/placements",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setPlacements(data.placements || []);
          setFilteredPlacements(data.placements || []);
        } else {
          setError(data.error || "Failed to fetch placements");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPlacements();
  }, [navigate]);

  // Apply filters
  useEffect(() => {
    let result = [...placements];

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.parent_name?.toLowerCase().includes(q) ||
          p.tutor_name?.toLowerCase().includes(q) ||
          p.parent_email?.toLowerCase().includes(q) ||
          p.tutor_email?.toLowerCase().includes(q) ||
          p.post_subject?.toLowerCase().includes(q)
      );
    }

    setFilteredPlacements(result);
  }, [searchQuery, statusFilter, placements]);

  // Get status badge
  const getStatusBadge = (status) => {
    const colors = {
      pending_payment: "bg-amber-100 text-amber-700",
      pending_verification: "bg-blue-100 text-blue-700",
      paid: "bg-emerald-100 text-emerald-700",
      confirmed: "bg-teal-100 text-teal-700",
      payment_failed: "bg-red-100 text-red-700",
      cancelled: "bg-slate-100 text-slate-600",
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
          Placements
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          View all successful and pending placements
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
                placeholder="Search by parent, tutor, or subject..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-64">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-teal-500"
            >
              <option value="all">All Status</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="paid">Paid</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Count */}
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total
            </p>
            <p className="mt-1 text-lg font-extrabold text-[#10243e]">
              {filteredPlacements.length} placement
              {filteredPlacements.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
          <p className="text-sm text-slate-500">Loading placements...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      )}

      {/* Placements Table */}
      {!loading && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-extrabold text-[#10243e]">
              All Placements
            </h2>
            <p className="text-xs text-slate-400">
              Complete list of parent-tutor placements
            </p>
          </div>

          {filteredPlacements.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
                ◉
              </div>
              <h3 className="font-bold text-slate-700">No placements found</h3>
              <p className="mt-1 text-sm text-slate-400">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      ID
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Parent
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Tutor
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Tuition Post
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlacements.map((placement) => (
                    <tr
                      key={placement.id}
                      className="border-b border-slate-50 transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4 font-bold text-[#10243e]">
                        #{placement.id}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">
                          {placement.parent_name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {placement.parent_email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">
                          {placement.tutor_name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {placement.tutor_email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">
                          {placement.post_subject || "-"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {placement.post_grade}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        Rs. {placement.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase ${getStatusBadge(
                            placement.status
                          )}`}
                        >
                          {placement.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {placement.created_at}
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

export default AdminPlacements;