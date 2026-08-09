import React from "react";
import { IoBookOutline } from "react-icons/io5";
import {
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineClock,
} from "react-icons/hi";

/**
 * ContentCard – Admin content card matching the Library Card.jsx design.
 * Features visibility toggle button (ظاهر / مخفي في الموقع الرئيسي) in place of plain active badge,
 * plus cover image, category badge, edit/delete buttons, author & students count.
 */
export default function ContentCard({ book, onEdit, onDelete, onToggleVisibility }) {
  const {
    title,
    author,
    category = "الحديث",
    studentsCount = "0",
    status = "ظاهر",
    lastUpdated = "قبل يومين",
    coverImage,
  } = book;

  const isVisible = status === "معروض" || status === "ظاهر" || status === "مفعل";

  return (
    <div
      className="group card bg-base-100 border border-base-200 shadow-sm hover:shadow-xl w-full overflow-hidden flex flex-col rounded-2xl hover:border-cyan-600/40 transition-all duration-300 h-full"
      dir="rtl"
    >
      {/* ── Cover Image Area ── */}
      <div className="relative w-full h-32 sm:h-38 lg:h-44 flex items-center justify-center overflow-hidden shrink-0 rounded-t-2xl">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 transform-gpu"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-900/15 via-cyan-800/25 to-base-300 flex flex-col items-center justify-center gap-1 text-cyan-700 dark:text-cyan-400">
            <IoBookOutline className="text-3xl" />
            <span className="text-[10px] font-2 opacity-60">غلاف الكتاب</span>
          </div>
        )}

        {/* Category badge (top-right) */}
        {category && (
          <span className="absolute top-2.5 right-2.5 badge bg-black/65 backdrop-blur-xs text-white border-none font-2 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-lg shadow-sm z-10">
            {category}
          </span>
        )}

        {/* Edit & Delete buttons (top-left) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(book); }}
            className="w-8.5 h-8.5 rounded-xl bg-white dark:bg-base-100 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-700 hover:text-white dark:hover:bg-cyan-600 dark:hover:text-white shadow-md border border-base-200/80 dark:border-base-300 flex items-center justify-center transition-all cursor-pointer"
            title="تعديل المتن"
            aria-label="تعديل المتن"
          >
            <HiOutlinePencilAlt className="text-lg font-bold" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(book); }}
            className="w-8.5 h-8.5 rounded-xl bg-white dark:bg-base-100 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white shadow-md border border-base-200/80 dark:border-base-300 flex items-center justify-center transition-all cursor-pointer"
            title="حذف المتن"
            aria-label="حذف المتن"
          >
            <HiOutlineTrash className="text-lg font-bold" />
          </button>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="card-body p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2.5 bg-base-100">
        {/* Title & Author */}
        <div>
          <h2 className="card-title font-1 font-bold text-sm sm:text-base lg:text-lg text-base-content leading-snug mb-0.5 group-hover:text-cyan-700 transition-colors duration-200 line-clamp-1">
            {title}
          </h2>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] sm:text-[10px] text-base-content/50 font-2">المؤلف</span>
            <span className="text-xs font-2 text-base-content/80 font-medium line-clamp-1">
              {author}
            </span>
          </div>
        </div>

        {/* Students Count */}
        <div className="flex items-center gap-1 text-xs text-base-content/70">
          <HiOutlineUsers className="text-sm text-cyan-600" />
          <span>{studentsCount} طالب</span>
        </div>

        {/* Footer: Visibility Toggle + Last Updated */}
        <div className="pt-2 border-t border-base-200/80 flex items-center justify-between text-[11px] text-base-content/60 mt-auto">
          {/* Main site visibility toggle button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleVisibility && onToggleVisibility(book); }}
            className={`flex items-center gap-1 font-medium transition-all px-2.5 py-1 rounded-xl border text-[11px] shadow-2xs ${
              isVisible
                ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                : "text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
            }`}
            title="انقر لتغيير حالة الإظهار/الإخفاء في الموقع الرئيسي"
          >
            {isVisible ? (
              <>
                <HiOutlineEye className="text-sm shrink-0 text-emerald-600" />
                <span>معروض بالمكتبة</span>
              </>
            ) : (
              <>
                <HiOutlineEyeOff className="text-sm shrink-0 text-amber-600" />
                <span>مخفي من المكتبة</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1">
            <HiOutlineClock className="text-sm text-base-content/40" />
            <span>آخر تحديث: {lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
