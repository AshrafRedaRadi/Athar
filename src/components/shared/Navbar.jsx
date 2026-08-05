import React from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import HeaderActions from "./HeaderActions";
import Sidebar from "./Sidebar";
import Dock from "./Dock";
import { useAuth } from "../../context/AuthContext";
import defaultAvatar from "../../assets/user.png";

/**
 * Unified Navbar component for Athar platform.
 * Dynamically displays authenticated user profile from AuthContext / Backend API.
 */
export default function Navbar({ activePage = "home", searchSlot, rightSlot }) {
  const navigate = useNavigate();
  const { user, isGuest, logout } = useAuth();

  const userName = user?.fullName || user?.name || user?.userName || (isGuest ? "ضيف أثر" : "زائر");
  const userAvatar = user?.avatarUrl || user?.avatar || user?.picture || defaultAvatar;

  const handleMobileAvatarClick = () => {
    if (isGuest) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      {/* Sidebar drawer component */}
      <Sidebar activePage={activePage} />

      {/* Dock navigation for mobile / tablet (below lg) */}
      <div className="block lg:hidden">
        <Dock activePage={activePage} />
      </div>

      {/* Unified Top Navigation Header Bar */}
      <header className="flex items-center gap-3 mb-4">
        {/* Desktop Profile avatar (lg+) – clicking opens sidebar drawer */}
        <label
          htmlFor="sidebar-drawer"
          className="shrink-0 cursor-pointer hidden lg:block transition-transform hover:scale-105"
          aria-label="فتح القائمة والبروفايل"
          title={`أهلاً بك، ${userName}`}
        >
          <Avatar src={userAvatar} size="w-10" />
        </label>

        {/* Mobile / Tablet Profile avatar (<lg) */}
        <div
          onClick={handleMobileAvatarClick}
          className="shrink-0 block lg:hidden cursor-pointer transition-transform hover:scale-105"
          title={isGuest ? "تسجيل الدخول" : `أهلاً بك، ${userName}`}
        >
          <Avatar src={userAvatar} size="w-10" />
        </div>

        {/* Center slot (optional search bar or breadcrumbs) */}
        <div className="flex-1">{searchSlot}</div>

        {/* Action icons slot (Theme toggle, Notifications, Settings) */}
        <div className="flex items-center gap-2 shrink-0">
          {rightSlot}
          <HeaderActions />
        </div>
      </header>
    </>
  );
}
