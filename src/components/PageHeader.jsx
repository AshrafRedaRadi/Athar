import Avatar from "./Avatar";
import HeaderActions from "./HeaderActions";
import user from "../assets/user.png"; // TODO: replace with context/backend user

/**
 * PageHeader — reusable top bar across all pages.
 *
 * Displays profile avatar (toggles sidebar drawer on click), center slot (search or breadcrumb),
 * and action icons (Theme toggle, Notifications, Settings) consistently on all screen sizes.
 */
export default function PageHeader({ searchSlot, rightSlot }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {/* Profile avatar (clicking opens sidebar drawer) */}
      <label
        htmlFor="sidebar-drawer"
        className="shrink-0 cursor-pointer transition-transform hover:scale-105"
        aria-label="فتح القائمة والبروفايل"
      >
        <Avatar src={user} size="w-10" />
      </label>

      {/* Center slot (search bar or breadcrumb) */}
      <div className="flex-1">{searchSlot}</div>

      {/* Right slot: custom actions + HeaderActions (Theme toggle, Notifications, Settings) */}
      <div className="flex items-center gap-2 shrink-0">
        {rightSlot}
        <HeaderActions />
      </div>
    </div>
  );
}
