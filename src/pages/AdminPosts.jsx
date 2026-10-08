import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../context/ToastContext";

function AdminPosts() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:8080/api/admin/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (response.ok) {
          setPosts(data.posts || []);
          setFilteredPosts(data.posts || []);
        } else {
          setError(data.error || "Failed to fetch tuition posts");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [navigate]);

  // Apply filters
  useEffect(() => {
    let result = [...posts];

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.subject?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.parent_name?.toLowerCase().includes(q)
      );
    }

    setFilteredPosts(result);
  }, [searchQuery, statusFilter, posts]);

  // Handle delete
  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this tuition post? This cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8080/api/tuition/post/${postId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        showToast("Post deleted successfully", "success");
        setPosts(posts.filter((p) => p.id !== postId));
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to delete", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    return status === "open"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-100 text-slate-600";
  };

  return (
    <AdminLayout>
      {/* Page Heading */}
      <div className="mb-7">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          Management
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#10243e]">
          Tuition Posts
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          View and manage all tuition requirements
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
                placeholder="Search by subject, location, or parent..."
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
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Count */}
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total
            </p>
            <p className="mt-1 text-lg font-extrabold text-[#10243e]">
              {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
          <p className="text-sm text-slate-500">Loading tuition posts...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      )}

      {/* Posts List */}
      {!loading && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-extrabold text-[#10243e]">
              All Tuition Posts
            </h2>
            <p className="text-xs text-slate-400">
              Complete list of tuition requirements
            </p>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
                ▣
              </div>
              <h3 className="font-bold text-slate-700">No posts found</h3>
              <p className="mt-1 text-sm text-slate-400">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-6 md:grid-cols-2">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400">
                        Post #{post.id}
                      </p>
                      <h3 className="mt-1 text-lg font-extrabold text-[#10243e]">
                        {post.subject}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase ${getStatusBadge(
                        post.status
                      )}`}
                    >
                      {post.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                    <p>
                      <span className="font-semibold text-slate-600">Grade:</span>{" "}
                      {post.grade}
                    </p>
                    {post.location && (
                      <p>
                        <span className="font-semibold text-slate-600">
                          Location:
                        </span>{" "}
                        {post.location}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold text-slate-600">Mode:</span>{" "}
                      {post.preferred_mode === "online"
                        ? "💻 Online"
                        : "🏠 Offline"}
                    </p>
                    {post.budget && (
                      <p>
                        <span className="font-semibold text-slate-600">
                          Budget:
                        </span>{" "}
                        Rs. {post.budget}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  {post.description && (
                    <p className="mt-3 text-xs text-slate-500 line-clamp-2">
                      {post.description}
                    </p>
                  )}

                  {/* Parent Info */}
                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Posted by
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {post.parent_name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-400">{post.parent_email}</p>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <p className="flex-1 text-[10px] text-slate-400 self-center">
                      {post.created_at}
                    </p>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="rounded-xl border-2 border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      🗑 Delete
                    </button>
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

export default AdminPosts;