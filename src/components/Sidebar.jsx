import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";
import { RiAwardLine } from "react-icons/ri";
import { BsBook, BsClipboard2Check } from "react-icons/bs";
import User from "./User";
import HeaderActions from "./HeaderActions";

/**
 * Sidebar component with pure Tailwind CSS 500ms slide transition from the right.
 */
function Sidebar(props) {
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
        dir="rtl"
        className="fixed top-0 right-0 h-full w-80 z-50 bg-base-200 text-base-content p-6 
                   flex flex-col justify-between shadow-2xl
                   transition-transform duration-500 ease-in-out will-change-transform
                   translate-x-full peer-checked:translate-x-0"
      >
        <div>
          <div className="flex items-center justify-between border-b border-base-300 pb-4">
            {/* User Avatar (on the RIGHT in RTL) */}
            <div className="avatar">
              <div className="w-14 rounded-full ring-offset-2">
                <img src={props.user} alt="User" />
              </div>
            </div>
            {/* HeaderActions (on the LEFT in RTL) */}
            <HeaderActions />
          </div>
          {/* Athar Logo */}
          <div className="flex justify-center mt-4">
            <img
              src={props.logo}
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