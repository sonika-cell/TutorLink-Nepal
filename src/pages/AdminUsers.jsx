import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../context/ToastContext";

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:8080/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (response.ok) {
          setUsers(data.users || []);
          setFilteredUsers(data.users || []);
        } else {
          setError(data.error || "Failed to fetch users");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  // Apply filters
  useEffect(() => {
    let result = [...users];

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }

    setFilteredUsers(result);
  }, [searchQuery, roleFilter, users]);

  // Get role badge color
  const getRoleBadge = (role) => {
    const colors = {
      parent: "bg-blue-100 text-blue-700",
      tutor: "bg-purple-100 text-purple-700",
      admin: "bg-teal-100 text-teal-700",
    };
    return colors[role] || "bg-slate-100 text-slate-700";
  };

  return (
    <AdminLayout>
      {/* Page Heading */}
      <div className="mb-7">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          Management
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#10243e]">
          Users
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          View and manage all platform users
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
                placeholder="Search by name or email..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-56">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-teal-500"
            >
              <option value="all">All Roles</option>
              <option value="parent">Parents</option>
              <option value="tutor">Tutors</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Count */}
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total
            </p>
            <p className="mt-1 text-lg font-extrabold text-[#10243e]">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
          <p className="text-sm text-slate-500">Loading users...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-extrabold text-[#10243e]">
              All Users
            </h2>
            <p className="text-xs text-slate-400">
              Complete list of platform users
            </p>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
                ♙
              </div>
              <h3 className="font-bold text-slate-700">No users found</h3>
              <p className="mt-1 text-sm text-slate-400">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      ID
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Username
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Email
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Role
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-50 transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4 font-bold text-[#10243e]">
                        #{user.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold capitalize ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                            user.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.is_active ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {user.created_at}
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

export default AdminUsers;