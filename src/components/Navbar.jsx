import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const isActive = (path) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(path + "/")
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");

    setIsLoggedIn(false);
    setUserRole(null);

    window.location.href = "/";
  };

  return (
    <nav className="w-full bg-[#FAF7EF] px-8 sm:px-12 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-16">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 no-underline"
          >
            <span className="text-[#F5C542] text-xl">
              ☀
            </span>

            <span className="text-[20px] font-bold tracking-tight text-[#202020]">
              TutorLink
            </span>
          </Link>

          {/* NAV LINKS */}
          <div className="hidden md:flex items-center gap-9 text-sm">

            <Link
              to="/"
              className={`relative py-2 ${
                isActive("/") &&
                !isActive("/about") &&
                !isActive("/help") &&
                !isActive("/parent") &&
                !isActive("/tutor")
                  ? "text-[#202020] font-medium"
                  : "text-[#666] hover:text-[#202020]"
              }`}
            >
              Home

              {isActive("/") &&
                !isActive("/about") &&
                !isActive("/help") &&
                !isActive("/parent") &&
                !isActive("/tutor") && (
                  <span className="absolute left-0 right-0 -bottom-1 h-[1.5px] bg-[#202020]" />
                )}
            </Link>

            <Link
              to="/about"
              className={`relative py-2 ${
                isActive("/about")
                  ? "text-[#202020] font-medium"
                  : "text-[#666] hover:text-[#202020]"
              }`}
            >
              About

              {isActive("/about") && (
                <span className="absolute left-0 right-0 -bottom-1 h-[1.5px] bg-[#202020]" />
              )}
            </Link>

            <Link
              to="/help"
              className={`relative py-2 ${
                isActive("/help")
                  ? "text-[#202020] font-medium"
                  : "text-[#666] hover:text-[#202020]"
              }`}
            >
              Help

              {isActive("/help") && (
                <span className="absolute left-0 right-0 -bottom-1 h-[1.5px] bg-[#202020]" />
              )}
            </Link>

            {/* DASHBOARD */}
            {isLoggedIn && userRole === "parent" && (
              <Link
                to="/parent/dashboard"
                className="text-[#666] hover:text-[#202020]"
              >
                Dashboard
              </Link>
            )}

            {isLoggedIn && userRole === "tutor" && (
              <Link
                to="/tutor/dashboard"
                className="text-[#666] hover:text-[#202020]"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* SEARCH */}
          <button
            className="p-2 text-[#202020] hover:bg-[#F1EEDF] rounded-full transition"
            aria-label="Search"
          >
            <svg
              className="w-[19px] h-[19px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M21 21l-5.5-5.5m2-5A7 7 0 1 1 3.5 10.5a7 7 0 0 1 14 0Z"
              />
            </svg>
          </button>

          {!isLoggedIn ? (
            <>
              {/* LOGIN */}
              {location.pathname !== "/login" && (
                <Link to="/login">
                  <button
                    className="
                      px-5 py-2
                      text-sm
                      text-[#202020]
                      font-medium
                      border border-[#E5E0D7]
                      bg-[#FBF9F4]
                      rounded-lg
                      hover:bg-white
                      transition
                    "
                  >
                    Login
                  </button>
                </Link>
              )}

              {/* SIGN UP */}
              {location.pathname !== "/register" && (
                <Link to="/register">
                  <button
                    className="
                      px-6 py-2.5
                      bg-[#F6C94A]
                      hover:bg-[#F2BE32]
                      text-[#202020]
                      text-sm
                      font-semibold
                      rounded-full
                      transition
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <span>Sign Up</span>
                    <span>→</span>
                  </button>
                </Link>
              )}
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#666]">
                👋 {userRole === "parent" ? "Parent" : "Tutor"}
              </span>

              <button
                onClick={handleLogout}
                className="
                  px-5 py-2
                  text-sm
                  font-semibold
                  text-red-600
                  hover:bg-red-50
                  rounded-lg
                "
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}