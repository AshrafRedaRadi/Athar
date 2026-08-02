import React from "react";
import { Link } from "react-router-dom";
import { IoListOutline, IoLibraryOutline, IoChevronForward, IoChevronBack } from "react-icons/io5";

/**
 * StudyToolbar — dedicated control bar for Hadith navigation & index links during study mode.
 */
export default function StudyToolbar({
  bookId = null,
  sectionId = "0",
  onPrevHadith,
  onNextHadith,
  hasPrev = false,
  hasNext = false,
  hadithLabel = "",
  className = "",
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 mb-4 pt-1 ${className}`}
      dir="rtl"
    >
      {/* Right: Back to library & Back to Index buttons */}
      <div className="flex items-center gap-2.5">
        <Link
          to="/library"
          className="group btn btn-sm border border-base-300 bg-base-100 hover:bg-cyan-700 hover:text-white hover:border-transparent text-base-content/80 font-2 text-xs sm:text-sm rounded-xl shadow-xs transition-all duration-200 gap-1.5 px-3.5"
        >
          <IoLibraryOutline className="text-base text-cyan-700 group-hover:text-white transition-colors" />
          <span>المكتبة</span>
        </Link>

        <Link
          to={bookId ? `/library/${bookId}/${sectionId}` : "/library"}
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
  );
}
