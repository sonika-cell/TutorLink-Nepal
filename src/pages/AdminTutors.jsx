import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../context/ToastContext";

function AdminTutors() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  // Fetch tutors
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:8080/api/admin/tutors", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (response.ok) {
          setTutors(data.tutors || []);
          setFilteredTutors(data.tutors || []);
        } else {
          setError(data.error || "Failed to fetch tutors");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [navigate]);

  // Apply filters
  useEffect(() => {
    let result = [...tutors];

    if (classFilter !== "all") {
      result = result.filter((t) => t.highest_class === classFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.username?.toLowerCase().includes(q) ||
          t.email?.toLowerCase().includes(q) ||
          t.full_name?.toLowerCase().includes(q) ||
          t.subjects?.toLowerCase().includes(q)
      );
    }

    setFilteredTutors(result);
  }, [searchQuery, classFilter, tutors]);

  return (
    <AdminLayout>
      {/* Page Heading */}
      <div className="mb-7">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          Management
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#10243e]">
          Tutors
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          View and manage all registered tutors
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
                placeholder="Search by name, email, or subject..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Class Filter */}
          <div className="w-full md:w-64">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Filter by Highest Class
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-teal-500"
            >
              <option value="all">All Classes</option>
              <option value="Primary (1-5)">Primary (1-5)</option>
              <option value="Lower Secondary (6-8)">Lower Secondary (6-8)</option>
              <option value="Secondary (9-10)">Secondary (9-10)</option>
              <option value="Higher Secondary (11-12)">Higher Secondary (11-12)</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
            </select>
          </div>

          {/* Count */}
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total
            </p>
            <p className="mt-1 text-lg font-extrabold text-[#10243e]">
              {filteredTutors.length} tutor{filteredTutors.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
          <p className="text-sm text-slate-500">Loading tutors...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      )}

      {/* Tutors List */}
      {!loading && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-extrabold text-[#10243e]">
              All Tutors
            </h2>
            <p className="text-xs text-slate-400">
              Complete list of registered tutors
            </p>
          </div>

          {filteredTutors.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
                🎓
              </div>
              <h3 className="font-bold text-slate-700">No tutors found</h3>
              <p className="mt-1 text-sm text-slate-400">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-600">
                      {tutor.full_name?.charAt(0) ||
                        tutor.username?.charAt(0) ||
                        "T"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-[#10243e]">
                        {tutor.full_name || tutor.username}
                      </h3>
                      <p className="truncate text-xs text-slate-400">
                        {tutor.email}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                    {tutor.qualification && (
                      <p>
                        <span className="font-semibold text-slate-600">
                          Qualification:
                        </span>{" "}
                        {tutor.qualification}
                      </p>
                    )}
                    {tutor.subjects && (
                      <p>
                        <span className="font-semibold text-slate-600">
                          Subjects:
                        </span>{" "}
                        {tutor.subjects}
                      </p>
                    )}
                    {tutor.highest_class && (
                      <p>
                        <span className="font-semibold text-slate-600">
                          Highest Class:
                        </span>{" "}
                        {tutor.highest_class}
                      </p>
                    )}
                    {tutor.location && (
                      <p>
                        <span className="font-semibold text-slate-600">
                          Location:
                        </span>{" "}
                        {tutor.location}
                      </p>
                    )}
                    {tutor.phone && (
                      <p>
                        <span className="font-semibold text-slate-600">
                          Phone:
                        </span>{" "}
                        {tutor.phone}
                      </p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${
                        tutor.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {tutor.is_active ? "Active" : "Inactive"}
                    </span>

                    {tutor.has_profile ? (
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700">
                        Profile Complete
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-700">
                        No Profile
                      </span>
                    )}

                    {tutor.has_cv && (
                      <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-[10px] font-bold text-purple-700">
                        CV Uploaded
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    {tutor.has_cv && (
                      <a
                        href={`http://localhost:8080/api/tutor/${tutor.id}/cv`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-xl bg-teal-500 py-2 text-center text-xs font-bold text-white transition hover:bg-teal-600"
                      >
                        📄 View CV
                      </a>
                    )}

                    {tutor.has_profile && (
                      <button
                        onClick={() => navigate(`/tutor/${tutor.id}`)}
                        className="flex-1 rounded-xl border-2 border-slate-200 bg-white py-2 text-xs font-bold text-slate-600 transition hover:border-teal-500 hover:text-teal-600"
                      >
                        View Profile
                      </button>
                    )}
                  </div>

                  <p className="mt-3 text-center text-[10px] text-slate-400">
                    Joined: {tutor.created_at}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminTutors;