import React from "react";
import { FiPlus } from "react-icons/fi";
import { IoBookOutline } from "react-icons/io5";

// ─────────────────────────────────────────────
//  Difficulty badge colour map
// ─────────────────────────────────────────────
const LEVEL_STYLES = {
  مبتدئ: "badge-warning text-warning-content",
  متوسط: "badge-success text-success-content",
  متقدم: "badge-error text-error-content",
};

/**
 * Card component – displays a single matn (متن) in the library grid.
 * Optimized to fit 2 cards side-by-side cleanly on mobile screens.
 */
export default function Card({ title, author, level, category, coverImage, isAdded = false, onAdd }) {
  const levelStyle = LEVEL_STYLES[level] ?? "badge-ghost";

  return (
    <div
      className="
        card bg-base-100 border border-base-200
        shadow-md hover:shadow-xl
        transition-all duration-300 hover:-translate-y-1
        w-full overflow-hidden flex flex-col justify-between
      "
      dir="rtl"
    >
      {/* ── Book Cover Image Section ── */}
      <div className="relative w-full h-28 sm:h-36 lg:h-44 bg-base-300 flex items-center justify-center overflow-hidden group">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-900/10 via-cyan-800/20 to-base-300 flex flex-col items-center justify-center gap-1 sm:gap-2 text-cyan-700 dark:text-cyan-400">
            <IoBookOutline className="text-2xl sm:text-4xl" />
            <span className="text-[10px] sm:text-xs font-2 opacity-60">غلاف الكتاب</span>
          </div>
        )}

        {/* Category tag overlay */}
        {category && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 badge bg-black/60 backdrop-blur-md text-white border-none font-2 text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1">
            {category}
          </span>
        )}
      </div>

      <div className="card-body p-3 sm:p-5 gap-2 sm:gap-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h2 className="card-title font-3 font-bold text-sm sm:text-xl text-base-content leading-snug mb-1">
            {title}
          </h2>

          {/* Author */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] sm:text-xs text-base-content/50 font-2">المؤلف</span>
            <span className="text-xs sm:text-sm font-2 text-base-content/80 font-medium line-clamp-1">
              {author}
            </span>
          </div>
        </div>

        {/* Footer: level badge + add button */}
        <div className="card-actions justify-between items-center mt-1 sm:mt-2 pt-2 border-t border-base-200">
          {/* Add button */}
          <button
            onClick={onAdd}
            aria-label="إضافة المتن"
            className="
              btn btn-xs sm:btn-sm btn-ghost btn-circle
              border border-base-300
              hover:bg-2 hover:text-white hover:border-transparent
              transition-colors duration-200
            "
          >
            <FiPlus className="text-sm sm:text-lg" />
          </button>

          {/* Difficulty level badge */}
          {level && (
            <span className={`badge badge-xs sm:badge-sm font-2 font-semibold ${levelStyle}`}>
              {level}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
