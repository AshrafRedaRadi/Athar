import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { IoArrowForward, IoArrowBack, IoListOutline, IoLibraryOutline, IoChevronForward, IoChevronBack } from "react-icons/io5";
import { IoIosNotificationsOutline } from "react-icons/io";
import { AiOutlineInfoCircle } from "react-icons/ai";
import Avatar from "./Avatar";

/**
 * StudyHeader — top bar for the study page.
 */
export default function StudyHeader({ 
  userAvatar, 
  onExplanationToggle, 
  isExplanationOpen,
  onPrevHadith,
  onNextHadith,
  hasPrev = false,
  hasNext = false,
  hadithLabel = "",
  bookId = null,
}) {
  // ── Theme toggle (synced with Sidebar's theme) ──
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    setIsDark(currentTheme === "dark");
  }, []);

  const handleThemeChange = () => {
    const dark = !isDark;
    setIsDark(dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  return (
    <div className="mb-4 space-y-3" dir="rtl">
      {/* ── Row 1: Navbar ── */}
      <header className="flex items-center justify-between gap-3">

        {/* Right side: Avatar (mobile/tablet) */}
        <div className="flex items-center gap-2">
          {/* Profile avatar – mobile/tablet only, on the RIGHT like Library */}
          <a href="#" className="shrink-0 lg:hidden" aria-label="إعدادات البروفايل">
            <Avatar src={userAvatar} size="w-10" />
          </a>
        </div>

        {/* Left side: Explanation button + actions */}
        <div className="flex items-center gap-2">
          {/* Explanation toggle (hidden on all screens in favor of bottom-left icon bar) */}
          <button
            onClick={onExplanationToggle}
            className={`hidden btn btn-sm btn-outline rounded-full font-2 gap-1 transition-colors ${
              isExplanationOpen
                ? "bg-cyan-700 text-white border-transparent"
                : "border-base-300 text-base-content/70 hover:bg-cyan-700 hover:text-white hover:border-transparent"
            }`}
          >
            <AiOutlineInfoCircle className="text-base" />
            شرح الحديث
          </button>

          {/* Notifications – mobile/tablet only */}
          <button
            className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-cyan-700 lg:hidden"
            aria-label="الإشعارات"
          >
            <IoIosNotificationsOutline className="text-xl" />
          </button>

          {/* Theme toggle – mobile/tablet only */}
          <label className="swap swap-rotate btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-cyan-700 lg:hidden">
            <input type="checkbox" checked={isDark} onChange={handleThemeChange} />
            <svg className="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
            <svg className="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73A8.15 8.15 0 0 1 9.08 5.49a8.59 8.59 0 0 1 .25-2A1 1 0 0 0 8 2.36 10.14 10.14 0 1 0 22 14.05a1 1 0 0 0-.36-1.05z" />
            </svg>
          </label>
        </div>
      </header>

      {/* ── Row 2: Back to library / Back to index + Prev/Next buttons ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Right: Back to library & Back to Index buttons */}
        <div className="flex items-center gap-2.5">
          {/* 1. Back to Library button */}
          <Link
            to="/library"
            className="group btn btn-sm border border-base-300 bg-base-100 hover:bg-cyan-700 hover:text-white hover:border-transparent text-base-content/80 font-2 text-xs sm:text-sm rounded-xl shadow-xs transition-all duration-200 gap-1.5 px-3.5"
          >
            <IoLibraryOutline className="text-base text-cyan-700 group-hover:text-white transition-colors" />
            <span>المكتبة</span>
          </Link>

          {/* 2. Back to Index button */}
          <Link
            to={bookId ? `/library/${bookId}/index` : "/library"}
            className="btn btn-sm bg-cyan-700/10 hover:bg-cyan-700 text-cyan-800 dark:text-cyan-300 hover:text-white border border-cyan-700/20 hover:border-transparent font-2 text-xs sm:text-sm rounded-xl shadow-xs transition-all duration-200 gap-1.5 px-3.5"
          >
            <IoListOutline className="text-base" />
            <span>فهرس الكتاب</span>
          </Link>
        </div>

        {/* Left: Prev/Next hadith navigation controls */}
        <div className="flex items-center gap-1.5 bg-base-100 border border-base-300 rounded-xl p-1 shadow-xs">
          <button
            onClick={onPrevHadith}
            disabled={!hasPrev}
            className="btn btn-xs sm:btn-sm btn-ghost font-2 gap-1 text-base-content/70 hover:text-cyan-700 hover:bg-base-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="الحديث السابق"
          >
            <IoChevronForward className="text-sm sm:text-base" />
            <span>السابق</span>
          </button>

          {hadithLabel && (
            <span className="font-2 text-xs font-semibold text-cyan-700 bg-cyan-50 dark:bg-cyan-900/40 px-2.5 py-1 rounded-md">
              {hadithLabel}
            </span>
          )}

          <button
            onClick={onNextHadith}
            disabled={!hasNext}
            className="btn btn-xs sm:btn-sm btn-ghost font-2 gap-1 text-base-content/70 hover:text-cyan-700 hover:bg-base-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="الحديث التالي"
          >
            <span>التالي</span>
            <IoChevronBack className="text-sm sm:text-base" />
          </button>
        </div>
      </div>
    </div>
  );
}
