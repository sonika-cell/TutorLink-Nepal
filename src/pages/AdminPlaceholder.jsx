import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

function AdminPlaceholder() {
  const location = useLocation();
  const navigate = useNavigate();

  // Map URL paths to page info
  const pages = {
    "/admin/users": {
      title: "Users",
      category: "Management",
      icon: "♙",
      description: "View and manage all platform users",
    },
    "/admin/tutors": {
      title: "Tutors",
      category: "Management",
      icon: "🎓",
      description: "View and manage all registered tutors",
    },
    "/admin/posts": {
      title: "Tuition Posts",
      category: "Management",
      icon: "▣",
      description: "View and manage all tuition requirements",
    },
    "/admin/applications": {
      title: "Applications",
      category: "Management",
      icon: "▤",
      description: "View all tutor applications",
    },
    "/admin/placements": {
      title: "Placements",
      category: "Management",
      icon: "◉",
      description: "View all successful and pending placements",
    },
    "/admin/payments": {
      title: "Payments",
      category: "Management",
      icon: "💰",
      description: "View all payment transactions",
    },
    "/admin/revenue": {
      title: "Revenue",
      category: "Analytics",
      icon: "📈",
      description: "Platform revenue overview",
    },
    "/admin/reports": {
      title: "Reports",
      category: "Moderation",
      icon: "⚠",
      description: "Reported users and posts",
    },
  };

  const page = pages[location.pathname] || {
    title: "Admin",
    category: "Admin",
    icon: "⚙",
    description: "Admin page",
  };

  return (
    <AdminLayout>
      {/* Page Heading */}
      <div className="mb-7">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          {page.category}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#10243e]">
          {page.title}
        </h1>
        <p className="mt-1 text-sm text-slate-400">{page.description}</p>
      </div>

      {/* Placeholder Content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
          {page.icon}
        </div>
        <h3 className="text-lg font-bold text-slate-700">
          {page.title} Management
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          {page.title} features coming soon.
        </p>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="mt-5 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600"
        >
          ← Back to Dashboard
        </button>
      </div>
    </AdminLayout>
  );
}

export default AdminPlaceholder;