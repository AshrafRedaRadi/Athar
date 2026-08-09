import React from "react";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

export const DEFAULT_CATEGORIES = [
  { id: 1, label: "الكل" },
  { id: 2, label: "الحديث" },
  { id: 3, label: "العقيدة" },
  { id: 4, label: "الفقه" },
  { id: 5, label: "اللغة العربية" },
  { id: 6, label: "التفسير" },
];

/**
 * Shared CategoryFilters component used across Library and Admin Content Management pages.
 */
export default function CategoryFilters({
  activeCategory = "الكل",
  onSelectCategory,
  categories = DEFAULT_CATEGORIES,
  onFilterClick,
  className = "",
  ariaLabel = "تصنيفات المتون",
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 mb-6 ${className}`}
      role="tablist"
      aria-label={ariaLabel}
      dir="rtl"
    >
      {categories.map((cat, idx) => {
        const label = typeof cat === "string" ? cat : cat.label;
        const id = typeof cat === "string" ? `cat-${idx}` : (cat.id || idx);
        const isActive = activeCategory === label;

        return (
          <button
            key={id}
            id={`cat-btn-${id}`}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectCategory && onSelectCategory(label)}
            className={`
              btn btn-sm rounded-full font-2 transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? "bg-2 text-white border-transparent shadow-md"
                  : "btn-outline border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200"
              }
            `}
          >
            {label}
          </button>
        );
      })}

      {/* Advanced filter button */}
      <button
        id="library-filter-btn"
        onClick={onFilterClick}
        className="btn btn-sm btn-square btn-outline border-base-300 bg-base-100
                   hover:bg-2 hover:text-white hover:border-transparent
                   ms-auto transition-colors duration-200"
        aria-label="فلتر متقدم"
        title="فلتر متقدم"
      >
        <HiOutlineAdjustmentsHorizontal className="text-base" />
      </button>
    </div>
  );
}
