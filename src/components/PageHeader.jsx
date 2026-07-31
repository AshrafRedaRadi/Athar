import { IoIosNotificationsOutline } from "react-icons/io";
import Avatar from "./Avatar";
import { useTheme } from "../hooks/useTheme";
import user from "../assets/user.png"; // TODO: replace with context/backend user

/* ── Sun / Moon SVGs (DaisyUI swap-rotate pattern) ──────────────── */
const SunIcon = () => (
  <svg className="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73A8.15 8.15 0 0 1 9.08 5.49a8.59 8.59 0 0 1 .25-2A1 1 0 0 0 8 2.36 10.14 10.14 0 1 0 22 14.05a1 1 0 0 0-.36-1.05z" />
  </svg>
);

/**
 * PageHeader — reusable top bar for Library, ListSection, and ListHadith pages.
 *
 * On mobile/tablet (below lg): shows avatar, search slot, notifications + theme toggle.
 * On desktop (lg+): a fixed-width spacer reserves the left side (Sidebar territory);
 *                   a matching spacer on the right balances the row.
 *
 * Props:
 *  - searchSlot: ReactNode   — optional search bar or breadcrumb to render in the center
 *  - rightSlot:  ReactNode   — optional extra element on the right (desktop spacer + actions row)
 */
export default function PageHeader({ searchSlot, rightSlot }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-3 mb-8">
      {/* Profile avatar – mobile/tablet only */}
      <a href="#" className="shrink-0 lg:hidden" aria-label="إعدادات البروفايل">
        <Avatar src={user} size="w-10" />
      </a>

      {/* Spacer for desktop – reserves space for Sidebar's fixed avatar */}
      <div className="hidden lg:block w-10 shrink-0" />

      {/* Center slot (search bar or breadcrumb) */}
      <div className="flex-1">{searchSlot}</div>

      {/* Right slot: custom actions + notifications + theme toggle (mobile/tablet only) */}
      <div className="flex items-center gap-2 shrink-0">
        {rightSlot}

        {/* Notifications – mobile/tablet only */}
        <button
          aria-label="الإشعارات"
          className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-cyan-700 lg:hidden"
        >
          <IoIosNotificationsOutline className="text-xl" />
        </button>

        {/* Theme toggle – mobile/tablet only */}
        <label className="swap swap-rotate btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-cyan-700 lg:hidden">
          <input type="checkbox" checked={isDark} onChange={toggleTheme} />
          <SunIcon />
          <MoonIcon />
        </label>
      </div>

      {/* Desktop balancer spacer */}
      <div className="hidden lg:flex w-20 shrink-0" />
    </div>
  );
}
