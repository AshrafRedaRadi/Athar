import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { MAIN_NAV_ITEMS } from "./mainNavConfig";
import defaultAvatar from "../../assets/user.png";
import logoImg from "../../assets/logo.png";

/**
 * Sidebar component with pure Tailwind CSS slide transition from the right.
 * Dynamically displays authenticated user profile from AuthContext / Backend API.
 */
function Sidebar({ activePage = "home", userName: customName, userAvatar: customAvatar, drawerId = "sidebar-drawer", onOpenSettings }) {
  const navigate = useNavigate();
  const { user, isGuest, logout } = useAuth();
  const drawerRef = useRef(null);

  const userName = customName || user?.fullName || user?.name || user?.userName || (isGuest ? "ضيف أثر" : "زائر");
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

  const handleItemClick = (item) => {
    closeDrawer();
    if (item.id === "settings" && onOpenSettings) {
      onOpenSettings();
    }
  };

  useEffect(() => {
    // 1024px matches Tailwind CSS 'lg' breakpoint threshold
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const handleMediaChange = (e) => {
      // Close sidebar immediately when transitioning from large screen to small screen
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

  return (
    <div>
      {/* Hidden checkbox toggle for sidebar */}
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
          {/* User Avatar + Welcome Header */}
          <Link
            to="/settings"
            onClick={closeDrawer}
            className="flex items-center justify-start gap-3 border-b border-base-300 pb-4 hover:opacity-90 transition-opacity cursor-pointer group"
            title="انتقل إلى إعدادات الملف الشخصي"
          >
            {/* User Avatar (Right in RTL) */}
            <div className="avatar shrink-0">
              <div className="w-12 h-12 rounded-full ring ring-cyan-600/30 group-hover:ring-cyan-600 ring-offset-2 overflow-hidden transition-all">
                <img src={userAvatar} alt={userName} />
              </div>
            </div>
            {/* Welcome Text + Username */}
            <div className="flex flex-col text-start">
              <span className="text-xs text-base-content/60 font-2">أهلاً بك،</span>
              <span className="font-1 font-bold text-base text-base-content group-hover:text-cyan-600 transition-colors">
                {userName}
              </span>
            </div>
          </Link>

          {/* Athar Logo */}
          <div className="flex justify-center mt-4">
            <img src={logoImg} alt="Athar Logo" className="w-20" />
          </div>
          <h1 className="font-1 font-bold text-cyan-600 text-2xl text-center">منصة أثر</h1>

          {/* Menu Items */}
          <div className="mt-6 space-y-3">
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              const classes = `btn font-2 rounded-xl justify-start w-full gap-3 ${
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
                    onClick={() => handleItemClick(item)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  className={classes}
                  onClick={() => handleItemClick(item)}
                >
                  {item.icon}
                  <span>{item.label}</span>
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

export default Sidebar;
