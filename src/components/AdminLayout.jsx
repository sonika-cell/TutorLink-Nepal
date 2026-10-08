import { useNavigate, useLocation } from "react-router-dom";

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Sidebar menu items
  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "▦" },
    { name: "Users", path: "/admin/users", icon: "♙" },
    { name: "Tutors", path: "/admin/tutors", icon: "🎓" },
    { name: "Tuition Posts", path: "/admin/posts", icon: "▣" },
    { name: "Applications", path: "/admin/applications", icon: "▤" },
    { name: "Placements", path: "/admin/placements", icon: "◉" },
    { name: "Payments", path: "/admin/payments", icon: "💰" },
    { name: "Revenue", path: "/admin/revenue", icon: "📈" },
    { name: "Reports", path: "/admin/reports", icon: "⚠" },
  ];

  // Check if menu item is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">

      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col bg-[#0c1b2e] text-white lg:flex">

        {/* Logo */}
        <div className="flex h-[72px] items-center border-b border-white/10 px-7">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbc744] text-xl text-slate-900">
              ☀
            </div>
            <div className="text-lg font-extrabold tracking-tight">
              TutorLink
              <span className="ml-1 text-sm font-medium text-slate-400">
                Nepal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Admin Panel
          </p>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive(item.path)
                    ? "bg-teal-500/30 font-semibold text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Admin Profile */}
        <div className="border-t border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 font-bold">
                A
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Admin</p>
                <p className="text-xs text-slate-400">TutorLink Nepal</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-slate-400 transition hover:text-white"
            >
              ↪
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================
          MAIN AREA
      ========================================================= */}
      <div className="lg:pl-[260px]">

        {/* =====================================================
            TOP BAR — Home / About / Help + Search
        ===================================================== */}
        <header className="sticky top-0 z-30 h-[72px] border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-full items-center justify-between px-5 sm:px-7">

            {/* Left: Nav Links */}
            <nav className="flex items-center gap-6">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="text-sm font-semibold text-slate-800 hover:text-teal-600 transition"
              >
                Home
              </button>
              <button
                onClick={() => navigate("/about")}
                className="text-sm font-medium text-slate-500 hover:text-teal-600 transition"
              >
                About
              </button>
              <button
                onClick={() => navigate("/help")}
                className="text-sm font-medium text-slate-500 hover:text-teal-600 transition"
              >
                Help
              </button>
            </nav>

            {/* Center: Search Bar */}
            <div className="hidden lg:block w-full max-w-[420px] mx-8">
              <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-400">
                <span className="mr-3 text-lg">⌕</span>
                <input
                  type="text"
                  placeholder="Search pages or run a command..."
                  className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
                <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-400">
                  ⌘ K
                </span>
              </div>
            </div>

            {/* Right: Admin Info */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-white">
                A
              </div>
              <span className="hidden text-sm font-medium text-slate-500 sm:block">
                Admin
              </span>
              <span className="text-slate-400 cursor-pointer">˅</span>
            </div>
          </div>
        </header>

        {/* =====================================================
            CONTENT
        ===================================================== */}
        <main className="p-5 sm:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;