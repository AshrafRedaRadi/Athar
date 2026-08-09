import React from "react";
import { HiPlus } from "react-icons/hi";

/**
 * AddContentCard - Dashed border card with (+) icon for adding new matn/book.
 * Matches the design mockup in user requirements.
 */
export default function AddContentCard({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group min-h-[260px] rounded-2xl border-2 border-dashed border-cyan-600/30 hover:border-cyan-600 bg-base-100/50 hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20 p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 w-full text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs">
        <HiPlus className="text-3xl" />
      </div>
      <span className="font-1 font-bold text-lg text-base-content/80 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
        إضافة متن جديد
      </span>
    </button>
  );
}
