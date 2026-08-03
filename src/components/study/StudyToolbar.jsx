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
      className={`sticky -top-6 z-30 flex items-center justify-between gap-1 sm:gap-3 py-3 px-2 w-full bg-base-200/35 backdrop-blur-md transition-all duration-200 ${className}`}
      dir="rtl"
    >
      {/* Right: Back to library & Back to Index buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <Link
          to="/library"
          className="group btn btn-xs sm:btn-sm border border-base-300 bg-base-100 hover:bg-cyan-700 hover:text-white hover:border-transparent text-base-content/80 font-2 text-[11px] sm:text-xs font-semibold rounded-lg sm:rounded-xl shadow-xs transition-all duration-200 gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 h-7.5 sm:h-auto min-h-0 sm:min-h-[2rem]"
        >
          <IoLibraryOutline className="text-sm sm:text-base text-cyan-700 group-hover:text-white transition-colors shrink-0" />
          <span>المكتبة</span>
        </Link>

        <Link
          to={bookId ? `/library/${bookId}/${sectionId}` : "/library"}
          className="group btn btn-xs sm:btn-sm bg-base-100 dark:bg-slate-800 hover:bg-cyan-700 border border-cyan-600/40 dark:border-cyan-400/50 hover:border-transparent font-2 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl shadow-xs transition-all duration-200 gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 h-7.5 sm:h-auto min-h-0 sm:min-h-[2rem]"
        >
          <IoListOutline className="text-sm sm:text-base text-cyan-700 dark:text-cyan-200 group-hover:text-white transition-colors shrink-0" />
          <span className="hidden sm:inline text-cyan-700 dark:text-cyan-200 group-hover:text-white">فهرس الكتاب</span>
          <span className="sm:hidden text-cyan-700 dark:text-cyan-200 group-hover:text-white">الفهرس</span>
        </Link>
      </div>

      {/* Left: Prev/Next hadith navigation controls */}
      <div className="flex items-center gap-0.5 bg-base-100 border border-base-300 rounded-lg sm:rounded-xl p-0.5 shadow-xs shrink-0">
        <button
          onClick={onPrevHadith}
          disabled={!hasPrev}
          className="btn btn-xs btn-ghost font-2 gap-0.5 text-[10px] sm:text-xs text-base-content/70 hover:text-cyan-700 hover:bg-base-200 rounded-md sm:rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors h-7 sm:h-auto min-h-0 sm:min-h-[2rem] px-1 sm:px-2"
          aria-label="الحديث السابق"
        >
          <IoChevronForward className="text-xs sm:text-base" />
          <span>السابق</span>
        </button>

        <div className="w-px h-3.5 sm:h-5 bg-base-300"></div>

        <button
          onClick={onNextHadith}
          disabled={!hasNext}
          className="btn btn-xs btn-ghost font-2 gap-0.5 text-[10px] sm:text-xs text-base-content/70 hover:text-cyan-700 hover:bg-base-200 rounded-md sm:rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors h-7 sm:h-auto min-h-0 sm:min-h-[2rem] px-1 sm:px-2"
          aria-label="الحديث التالي"
        >
          <span>التالي</span>
          <IoChevronBack className="text-xs sm:text-base" />
        </button>
      </div>
    </div>
  );
}
