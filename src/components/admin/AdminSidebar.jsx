import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ADMIN_NAV_ITEMS } from "./adminNavConfig.jsx";
import defaultAvatar from "../../assets/user.png";
import logoImg from "../../assets/logo.png";

/**
 * AdminSidebar component with slide-over transition from the right.
 * Specifically crafted for the Admin Dashboard area using ADMIN_NAV_ITEMS.
 */
function AdminSidebar({
  activePage = "dashboard",
  userName: customName,
  userAvatar: customAvatar,
  drawerId = "admin-sidebar-drawer",
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const drawerRef = useRef(null);

  const userName = customName || user?.fullName || user?.name || user?.userName || "مدير النظام";
  const userAvatar = customAvatar || user?.avatarUrl || user?.avatar || user?.picture || defaultAvatar;

  const closeDrawer = () => {
    if (drawerRef.current) {
      drawerRef.current.checked = false;
    }
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
          {/* User Avatar + Welcome Header */}
          <Link
            to="/admin/settings"
            onClick={closeDrawer}
            className="flex items-center justify-between border-b border-base-300 pb-4 hover:opacity-90 transition-opacity cursor-pointer group"
            title="انتقل إلى إعدادات الملف الشخصي"
          >
            <div className="flex items-center gap-3">
              <div className="avatar shrink-0">
                <div className="w-12 h-12 rounded-full ring ring-cyan-600/30 group-hover:ring-cyan-600 ring-offset-2 overflow-hidden transition-all">
                  <img src={userAvatar} alt={userName} />
                </div>
              </div>
              <div className="flex flex-col text-start">
                <span className="text-xs text-base-content/60 font-2">مرحباً بك،</span>
                <span className="font-1 font-bold text-base text-base-content group-hover:text-cyan-600 transition-colors">
                  {userName}
                </span>
              </div>
            </div>
          </Link>

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
            {ADMIN_NAV_ITEMS.map((item) => {
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
                  onClick={() => {
                    closeDrawer();
                    if (item.onClick) item.onClick();
                  }}
                >
                  {item.icon} <span className="mr-2">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;
