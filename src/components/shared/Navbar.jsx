import React from "react";
import Avatar from "./Avatar";
import HeaderActions from "./HeaderActions";
import Sidebar from "./Sidebar";
import Dock from "./Dock";
import { CURRENT_USER } from "../../constants/currentUser";

/**
 * Unified Navbar component for Athar platform.
 */
export default function Navbar({ activePage = "home", searchSlot, rightSlot }) {
  return (
    <>
      {/* Sidebar drawer component */}
      <Sidebar activePage={activePage} />

      {/* Dock navigation for mobile / tablet (below lg) */}
      <div className="block lg:hidden">
        <Dock activePage={activePage} />
      </div>

      {/* Unified Top Navigation Header Bar */}
      <header className="flex items-center gap-3 mb-8">
        {/* Desktop Profile avatar (lg+) – clicking opens sidebar drawer */}
        <label
          htmlFor="sidebar-drawer"
          className="shrink-0 cursor-pointer hidden lg:block transition-transform hover:scale-105"
          aria-label="فتح القائمة والبروفايل"
          title={`أهلاً بك، ${CURRENT_USER.name}`}
        >
          <Avatar src={CURRENT_USER.avatar} size="w-10" />
        </label>

        {/* Mobile / Tablet Profile avatar (<lg) – static, does not open sidebar drawer */}
        <div
          className="shrink-0 block lg:hidden"
          title={`أهلاً بك، ${CURRENT_USER.name}`}
        >
          <Avatar src={CURRENT_USER.avatar} size="w-10" />
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
