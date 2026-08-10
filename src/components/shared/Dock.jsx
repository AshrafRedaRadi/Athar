import React from "react";
import { Link } from "react-router-dom";
import { MAIN_NAV_ITEMS } from "./mainNavConfig";

/**
 * Dock – bottom navigation bar for mobile / tablet screens.
 * Single source of truth driven by mainNavConfig.
 *
 * @param {string} activePage - id of the currently active page
 *                              ("home" | "library" | "review" | "achievements" | "settings")
 */
export default function Dock({ activePage = "home" }) {
  const dockItems = MAIN_NAV_ITEMS.filter((item) => !item.isSidebarOnly);

  return (
    <div className="dock font-2 z-50" dir="rtl">
      {dockItems.map((item) => {
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
