import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoGridOutline } from "react-icons/io5";
import { HiOutlineUsers, HiOutlineDocumentText, HiOutlineLogout } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import defaultAvatar from "../../assets/user.png";
import logoImg from "../../assets/logo.png";

/* ── Sun / Moon SVGs (DaisyUI swap-rotate pattern) ──────────────── */
const SunIcon = () => (
  <svg className="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73A8.15 8.15 0 0 1 9.08 5.49a8.59 8.59 0 0 1 .25-2A1 1 0 0 0 8 2.36 10.14 10.14 0 1 0 22 14.05a1 1 0 0 0-.36-1.05z" />
  </svg>
);

/**
 * AdminSidebar component with slide-over transition from the right.
 * Specifically crafted for the Admin Dashboard area with items:
 * - لوحة التحكم (Dashboard)
 * - المستخدمون (Users)
 * - إدارة المحتوى (Content Management)
 * Includes Theme Toggle & Log Out (تسجيل الخروج) action buttons at the bottom.
 */
function AdminSidebar({
  activePage = "dashboard",
  userName: customName,
  userAvatar: customAvatar,
  drawerId = "admin-sidebar-drawer"
}) {
  const navigate = useNavigate();
  const { user, isGuest, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const drawerRef = useRef(null);

  const userName = customName || user?.fullName || user?.name || user?.userName || (isGuest ? "ضيف أثر" : "مدير النظام");
  const userAvatar = customAvatar || user?.avatarUrl || user?.avatar || user?.picture || defaultAvatar;

  const closeDrawer = () => {
    if (drawerRef.current) {
      drawerRef.current.checked = false;
    }
  };

  const handleLogout = () => {
    closeDrawer();
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const handleMediaChange = (e) => {
      if (e.matches && drawerRef.current?.checked) {
        drawerRef.current.checked = false;
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  const adminMenuItems = [
    { id: "dashboard", label: "لوحة التحكم",   icon: <IoGridOutline className="text-xl" />,         href: "/admin/controlpanel" },
    { id: "users",     label: "المستخدمون",   icon: <HiOutlineUsers className="text-xl" />,        href: "#" },
    { id: "content",   label: "إدارة المحتوى", icon: <HiOutlineDocumentText className="text-xl" />, href: "#" },
  ];

  return (
    <div>
      {/* Hidden checkbox toggle for admin sidebar */}
      <input
        id={drawerId}
        ref={drawerRef}
        type="checkbox"
        className="peer hidden"
      />

      {/* Overlay — pure Tailwind fade transition */}
      <label
        htmlFor={drawerId}
        className="fixed inset-0 bg-black/40 z-50
                   transition-opacity duration-500 ease-in-out
                   opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto"
      />

      {/* Sidebar panel — pure Tailwind slide transition from the right */}
      <div
        dir="rtl"
        className="fixed top-0 right-0 h-full w-80 z-50 bg-base-200 text-base-content p-6 
                   shadow-2xl transition-transform duration-500 ease-in-out will-change-transform
                   translate-x-full peer-checked:translate-x-0 overflow-y-auto flex flex-col justify-between"
      >
        <div>
          {/* User Avatar + Welcome Header + Theme Toggle */}
          <div className="flex items-center justify-between border-b border-base-300 pb-4">
            <div className="flex items-center gap-3">
              <div className="avatar shrink-0">
                <div className="w-12 h-12 rounded-full ring ring-cyan-600/30 ring-offset-2 overflow-hidden">
                  <img src={userAvatar} alt={userName} />
                </div>
              </div>
              <div className="flex flex-col text-start">
                <span className="text-xs text-base-content/60 font-2">مرحباً بك،</span>
                <span className="font-1 font-bold text-base text-base-content">
                  {userName}
                </span>
              </div>
            </div>

            {/* Sun / Moon Theme Toggle (DaisyUI swap-rotate pattern matching Navbar) */}
            <label
              className="swap swap-rotate btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-cyan-700 transition-colors"
              title="تغيير المظهر"
            >
              <input type="checkbox" checked={isDark} onChange={toggleTheme} />
              <SunIcon />
              <MoonIcon />
            </label>
          </div>

          {/* Athar Logo + Admin Badge */}
          <div className="flex flex-col items-center mt-4 gap-1">
            <img src={logoImg} alt="Athar Logo" className="w-20" />
            <h1 className="font-1 font-bold text-cyan-600 text-2xl text-center">منصة أثر</h1>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
              إدارة المنصة
            </span>
          </div>

          {/* Admin Menu Items */}
          <div className="mt-6 space-y-3">
            {adminMenuItems.map((item) => {
              const isActive = activePage === item.id;
              const classes = `btn font-2 rounded-xl justify-start w-full ${
                isActive
                  ? "bg-cyan-700 text-white border-transparent"
                  : "bg-base-300 text-base-content hover:bg-cyan-700 hover:text-white"
              }`;

              if (item.href.startsWith("/")) {
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={classes}
                    onClick={closeDrawer}
                  >
                    {item.icon} <span className="mr-2">{item.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  className={classes}
                  onClick={closeDrawer}
                >
                  {item.icon} <span className="mr-2">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom area — Logout button */}
        <div className="pt-4 mt-6 border-t border-base-300">
          <button
            type="button"
            onClick={handleLogout}
            className="btn font-2 rounded-xl justify-start w-full bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white border-transparent transition-colors flex items-center gap-2"
          >
            <HiOutlineLogout className="text-xl" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;
