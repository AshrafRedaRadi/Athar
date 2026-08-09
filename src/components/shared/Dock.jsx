import React from "react";
import { Link } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { RiAwardLine } from "react-icons/ri";
import { BsBook, BsClipboard2Check } from "react-icons/bs";

// Navigation items – same icons used in Sidebar for consistency
const NAV_ITEMS = [
  { id: "home",         label: "الرئيسية",   icon: <IoHomeOutline />,      href: "/home" },
  { id: "library",      label: "المكتبة",    icon: <BsBook />,             href: "/library" },
  { id: "review",       label: "الخطة",   icon: <BsClipboard2Check />,  href: "#" },
  { id: "achievements", label: "الإنجازات",  icon: <RiAwardLine />,        href: "/achievements" },
];

/**
 * Dock – bottom navigation bar for mobile / tablet screens.
 *
 * @param {string} activePage - id of the currently active page
 *                              ("home" | "review" | "library" | "achievements" | "settings")
 */
export default function Dock({ activePage = "home" }) {
  return (
    <div className="dock font-2 z-50" dir="rtl">
      {NAV_ITEMS.map((item) => {
        const content = (
          <>
            <span className="text-xl text-cyan-700">{item.icon}</span>
            <span className="dock-label">{item.label}</span>
          </>
        );

        if (item.href.startsWith("/")) {
          return (
            <Link
              key={item.id}
              to={item.href}
              className={item.id === activePage ? "dock-active" : ""}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            className={item.id === activePage ? "dock-active" : ""}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
