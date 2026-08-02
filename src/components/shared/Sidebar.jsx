import React from "react";
import { Link } from "react-router-dom";
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";
import { RiAwardLine } from "react-icons/ri";
import { BsBook, BsClipboard2Check } from "react-icons/bs";
import { useAuth } from "../../context/AuthContext";
import defaultAvatar from "../../assets/user.png";
import logoImg from "../../assets/logo.png";

/**
 * Sidebar component with pure Tailwind CSS slide transition from the right.
 * Dynamically displays authenticated user profile from AuthContext / Backend API.
 */
function Sidebar(props) {
  const { user, isGuest } = useAuth();

  const userName = props.userName || user?.fullName || user?.name || user?.userName || (isGuest ? "ضيف أثر" : "زائر");
  const userAvatar = props.user || user?.avatarUrl || user?.avatar || user?.picture || defaultAvatar;

  return (
    <div>
      {/* Hidden checkbox toggle for sidebar */}
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="peer hidden"
      />

      {/* Overlay — pure Tailwind fade transition */}
      <label
        htmlFor="sidebar-drawer"
        className="fixed inset-0 bg-black/40 z-50
                   transition-opacity duration-500 ease-in-out
                   opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto"
      />

      {/* Sidebar panel — pure Tailwind slide transition from the right */}
      <div
        dir="rtl"
        className="fixed top-0 right-0 h-full w-80 z-50 bg-base-200 text-base-content p-6 
                   flex flex-col justify-between shadow-2xl
                   transition-transform duration-500 ease-in-out will-change-transform
                   translate-x-full peer-checked:translate-x-0"
      >
        <div>
          {/* User Avatar + Welcome Header */}
          <div className="flex items-center justify-start gap-3 border-b border-base-300 pb-4">
            {/* User Avatar (Right in RTL) */}
            <div className="avatar shrink-0">
              <div className="w-12 h-12 rounded-full ring ring-cyan-600/30 ring-offset-2 overflow-hidden">
                <img src={userAvatar} alt={userName} />
              </div>
            </div>
            {/* Welcome Text + Username */}
            <div className="flex flex-col text-start">
              <span className="text-xs text-base-content/60 font-2">أهلاً بك،</span>
              <span className="font-1 font-bold text-base text-base-content">
                {userName}
              </span>
            </div>
          </div>

          {/* Athar Logo */}
          <div className="flex justify-center mt-4">
            <img
              src={logoImg}
              alt="Athar Logo"
              className="w-20"
            />
          </div>
          <h1 className="font-1 font-bold text-cyan-600 text-2xl text-center">منصة أثر</h1>

          {/* Menu Items */}
          <div className="mt-6 space-y-3">
            {[
              { id: "home",         label: "الرئيسية",   icon: <IoHomeOutline />,      href: "/" },
              { id: "library",      label: "المكتبة",    icon: <BsBook />,             href: "/library" },
              { id: "review",       label: "المراجعة",   icon: <BsClipboard2Check />,  href: "#" },
              { id: "achievements", label: "الإنجازات",  icon: <RiAwardLine />,        href: "#" },
              { id: "settings",     label: "الإعدادت",   icon: <IoSettingsOutline />,   href: "#" },
            ].map((item) => {
              const isActive = props.activePage === item.id;
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
                    dir="rtl"
                    className={classes}
                  >
                    {item.icon}  {item.label}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  dir="rtl"
                  className={classes}
                >
                  {item.icon}  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
