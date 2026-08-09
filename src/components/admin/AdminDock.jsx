import React from "react";
import { Link } from "react-router-dom";
import { ADMIN_NAV_ITEMS } from "./adminNavConfig.jsx";

/**
 * AdminDock – Bottom navigation bar for Admin area on mobile / tablet screens (<lg).
 * Matches DaisyUI Dock pattern from Dock.jsx using shared ADMIN_NAV_ITEMS.
 *
 * @param {string} activePage - id of the currently active admin page ("dashboard" | "users" | "content" | "plans")
 */
export default function AdminDock({ activePage = "dashboard" }) {
  return (
    <div className="dock font-2 z-50" dir="rtl">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = activePage === item.id;
        const content = (
          <>
            <span className="text-xl text-cyan-700">{item.icon}</span>
            <span className="dock-label">{item.dockLabel || item.label}</span>
          </>
        );

        if (item.href.startsWith("/")) {
          return (
            <Link
              key={item.id}
              to={item.href}
              className={isActive ? "dock-active" : ""}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            className={isActive ? "dock-active" : ""}
            onClick={() => {
              if (item.onClick) item.onClick();
            }}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
