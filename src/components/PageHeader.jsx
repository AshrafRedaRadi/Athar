import Avatar from "./Avatar";
import HeaderActions from "./HeaderActions";
import user from "../assets/user.png"; // TODO: replace with context/backend user

/**
 * PageHeader — reusable top bar for Library, ListSection, and ListHadith pages.
 *
 * On mobile/tablet (below lg): shows avatar, search slot, theme toggle + notifications + settings.
 * On desktop (lg+): a fixed-width spacer reserves the left side (Sidebar territory);
 *                   a matching spacer on the right balances the row.
 *
 * Props:
 *  - searchSlot: ReactNode   — optional search bar or breadcrumb to render in the center
 *  - rightSlot:  ReactNode   — optional extra element on the right (desktop spacer + actions row)
 */
export default function PageHeader({ searchSlot, rightSlot }) {
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

      {/* Right slot: custom actions + HeaderActions (mobile/tablet only) */}
      <div className="flex items-center gap-2 shrink-0">
        {rightSlot}
        <HeaderActions className="lg:hidden" />
      </div>

      {/* Desktop balancer spacer */}
      <div className="hidden lg:flex w-20 shrink-0" />
    </div>
  );
}
