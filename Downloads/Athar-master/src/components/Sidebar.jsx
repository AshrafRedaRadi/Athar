import { IoIosNotificationsOutline } from "react-icons/io";
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";
import { RiAwardLine } from "react-icons/ri";
import { BsBook, BsClipboard2Check } from "react-icons/bs";
import { useEffect, useState } from "react";
import User from "./User";

/**
 * Sidebar component with pure Tailwind CSS 500ms slide transition from the right.
 */
function Sidebar(props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    setIsDark(currentTheme === "dark");
  }, []);

  const handleThemeChange = (e) => {
    const dark = e.target.checked;
    setIsDark(dark);

    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light"
    );

    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  return (
    <div>
      {/* Hidden checkbox toggle for sidebar */}
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="peer hidden"
      />

      <User user={props.user} />

      {/* Overlay — pure Tailwind fade transition */}
      <label
        htmlFor="sidebar-drawer"
        className="fixed inset-0 bg-black/40 z-50
                   transition-opacity duration-500 ease-in-out
                   opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto"
      />

      {/* Sidebar panel — pure Tailwind slide transition from the right */}
      <div
        className="fixed top-0 right-0 h-full w-80 z-50 bg-base-200 text-base-content p-6 
                   flex flex-col justify-between shadow-2xl
                   transition-transform duration-500 ease-in-out will-change-transform
                   translate-x-full peer-checked:translate-x-0"
      >
        <div>
          <div className="flex items-center gap-3 border-b border-base-300 pb-4">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <label className="swap swap-rotate cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDark}
                    onChange={handleThemeChange}
                  />

                  {/* Sun Icon */}
                  <svg
                    className="swap-off h-5 w-5 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                  </svg>

                  {/* Moon Icon */}
                  <svg
                    className="swap-on h-5 w-5 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73A8.15 8.15 0 0 1 9.08 5.49a8.59 8.59 0 0 1 .25-2A1 1 0 0 0 8 2.36 10.14 10.14 0 1 0 22 14.05a1 1 0 0 0-.36-1.05z" />
                  </svg>
                </label>
                <IoSettingsOutline className="text-xl text-base cursor-pointer" />
                <IoIosNotificationsOutline className="text-xl text-base cursor-pointer" />
              </div>
            </div>
            {/* User Avatar */}
            <div className="avatar">
              <div className="w-14 rounded-full ring-offset-2">
                <img src={props.user} alt="User" />
              </div>
            </div>
          </div>
          {/* Athar Logo */}
          <div className="flex justify-center mt-4">
            <img
              src={props.logo}
              alt="Athar Logo"
              className="w-20"
            />
          </div>
          <h1 className="font-2 font-bold text-cyan-600 text-2xl text-center">منصة أثر</h1>
          {/* Menu Items */}
          <div className="mt-6 space-y-3">
            {[
              { id: "home",         label: "الرئيسية",   icon: <IoHomeOutline />,      href: "/" },
              { id: "library",      label: "المكتبة",    icon: <BsBook />,             href: "/library" },
              { id: "review",       label: "المراجعة",   icon: <BsClipboard2Check />,  href: "#" },
              { id: "achievements", label: "الإنجازات",  icon: <RiAwardLine />,        href: "#" },
              { id: "settings",     label: "الإعدادت",   icon: <IoSettingsOutline />,   href: "#" },
            ].map((item) => (
              <a
                key={item.id}
                href={item.href}
                dir="rtl"
                className={`btn font-2 rounded-xl justify-start w-full ${
                  props.activePage === item.id
                    ? "bg-cyan-700 text-white border-transparent"
                    : "bg-base-300 text-base-content hover:bg-cyan-700 hover:text-white"
                }`}
              >
                {item.icon}  {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;