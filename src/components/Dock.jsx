import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";
import { RiAwardLine } from "react-icons/ri";
import { BsBook, BsClipboard2Check } from "react-icons/bs";

// Navigation items – same icons used in Sidebar for consistency
const NAV_ITEMS = [
  { id: "home",         label: "الرئيسية",   icon: <IoHomeOutline />,      href: "/" },
  { id: "review",       label: "المراجعة",   icon: <BsClipboard2Check />,  href: "#" },
  { id: "library",      label: "المكتبة",    icon: <BsBook />,             href: "/library" },
  { id: "achievements", label: "الإنجازات",  icon: <RiAwardLine />,        href: "#" },
  { id: "settings",     label: "الإعدادات",  icon: <IoSettingsOutline />,   href: "#" },
];

/**
 * Dock – bottom navigation bar for mobile / tablet screens.
 *
 * @param {string} activePage - id of the currently active page
 *                              ("home" | "review" | "library" | "achievements" | "settings")
 */
export default function Dock({ activePage = "home" }) {
  return (
    <div className="dock font-2" dir="rtl">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={item.id === activePage ? "dock-active" : ""}
        >
          <span className="text-xl text-cyan-700">{item.icon}</span>
          <span className="dock-label">{item.label}</span>
        </a>
      ))}
    </div>
  );
}
