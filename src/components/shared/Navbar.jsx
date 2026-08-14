import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiOutlineMenuAlt3, HiOutlineHome, HiOutlineCog } from "react-icons/hi";
import Avatar from "./Avatar";
import HeaderActions from "./HeaderActions";
import Sidebar from "./Sidebar";
import Dock from "./Dock";
import AdminSidebar from "../admin/AdminSidebar";
import AdminDock from "../admin/AdminDock";
import { useAuth } from "../../context/AuthContext";
import defaultAvatar from "../../assets/user.png";

/**
 * Unified Navbar component for Athar platform.
 * Dynamically displays authenticated user profile from AuthContext / Backend API.
 * Features a dedicated 'القائمة' button on the right edge to open the drawer.
 */
export default function Navbar({
  activePage = "home",
  searchSlot,
  rightSlot,
  drawerId = "sidebar-drawer",
  showSidebar = true,
  showDock = true,
  isAdmin = false,
  onOpenSettings,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isSettingsPage = activePage === "settings" || location.pathname === "/settings";

  const userName = user?.fullName || user?.name || user?.userName || "المستخدم";
  const userAvatar = user?.avatarUrl || user?.avatar || user?.picture || defaultAvatar;

  const handleAvatarClick = () => {
    if (isSettingsPage) {
      if (window.history?.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    } else {
      if (typeof onOpenSettings === 'function') {
        onOpenSettings();
      }
      navigate('/settings');
    }
  };

  return (
    <>
      {/* Sidebar drawer component */}
      {showSidebar && (
        isAdmin ? (
          <AdminSidebar activePage={activePage} drawerId={drawerId} onOpenSettings={onOpenSettings} />
        ) : (
          <Sidebar activePage={activePage} drawerId={drawerId} onOpenSettings={onOpenSettings} />
        )
      )}

      {/* Dock navigation for mobile / tablet (below lg) */}
      {showDock && (
        <div className="block lg:hidden">
          {isAdmin ? (
            <AdminDock activePage={activePage} onOpenSettings={onOpenSettings} />
          ) : (
            <Dock activePage={activePage} />
          )}
        </div>
      )}

      {/* Unified Top Navigation Header Bar */}
      <header className="flex items-center gap-3 mb-4">
        {/* Dedicated Sidebar Drawer Toggle Button on Right Edge */}
        <label
          htmlFor={drawerId}
          className="bg-base-200 border-2 border-cyan-600/50 text-base-content hover:bg-cyan-700 hover:text-white dark:hover:bg-cyan-600 dark:hover:text-white hover:border-cyan-700 shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all font-2 rounded-2xl gap-2 shrink-0 cursor-pointer hidden lg:flex items-center px-4 py-2 font-bold group"
          aria-label="فتح القائمة الجانبية"
          title="فتح القائمة الجانبية"
        >
          <HiOutlineMenuAlt3 className="text-xl text-cyan-700 dark:text-cyan-400 group-hover:text-white transition-colors" />
          <span className="text-sm font-bold text-base-content group-hover:text-white transition-colors">القائمة</span>
        </label>

        {/* Center slot (optional search bar or breadcrumbs) */}
        <div className="flex-1">{searchSlot}</div>

        {/* Left Action icons slot (Avatar Profile, Notifications, Theme toggle) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {rightSlot}

          {/* Admin Mode Switcher Button */}
          {user?.isAdmin && (
            isAdmin ? (
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="btn btn-sm btn-ghost border border-cyan-700/40 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-700 hover:text-white rounded-xl gap-1.5 font-bold font-2 text-xs transition-all shadow-xs"
                title="الذهاب للموقع الرئيسي وتصفح المنصة"
              >
                <HiOutlineHome className="text-base shrink-0" />
                <span className="hidden sm:inline">الموقع الرئيسي</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(localStorage.getItem('lastAdminRoute') || '/admin/controlpanel')}
                className="btn btn-sm bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl gap-1.5 font-bold font-2 text-xs transition-all shadow-xs"
                title="الذهاب إلى لوحة تحكم الأدمن"
              >
                <HiOutlineCog className="text-base shrink-0" />
                <span className="hidden sm:inline">لوحة التحكم</span>
              </button>
            )
          )}

          <HeaderActions />

          {/* Desktop Profile avatar (lg+) */}
          <div
            onClick={handleAvatarClick}
            className="shrink-0 hidden lg:block cursor-pointer transition-transform hover:scale-105"
            title={isSettingsPage ? "الصفحة الرئيسية" : "الإعدادات"}
          >
            <Avatar src={userAvatar} size="w-10" />
          </div>

          {/* Mobile / Tablet Profile avatar (<lg) */}
          <div
            onClick={handleAvatarClick}
            className="shrink-0 block lg:hidden cursor-pointer transition-transform hover:scale-105"
            title={isSettingsPage ? "الصفحة الرئيسية" : "الإعدادات"}
          >
            <Avatar src={userAvatar} size="w-10" />
          </div>
        </div>
      </header>
    </>
  );
}

