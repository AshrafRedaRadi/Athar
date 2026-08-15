import React from "react";
import { GiOpenBook } from "react-icons/gi";
import { FaFire, FaPencilAlt } from "react-icons/fa";

export default function Stat(props) {
  return (
    <div dir="rtl" className="mt-4 sm:mt-6">
      <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">

        {/* Days Streak */}
        <div className="bg-base-100 dark:bg-slate-900 border border-base-300/70 dark:border-slate-800 rounded-2xl shadow-xs p-2.5 sm:p-3.5 flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-right gap-2 sm:gap-3 transition-all">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center shrink-0">
            <FaFire className="text-orange-500 text-sm sm:text-base md:text-lg" />
          </div>

          <div className="text-center md:text-right min-w-0">
            <p className="text-[11px] sm:text-xs text-base-content/80 font-2 font-medium truncate">سلسلة الأيام</p>
            <h2 className="text-sm sm:text-lg md:text-xl font-bold font-1 text-base-content">{props.days} <span className="text-[10px] sm:text-xs font-normal">يوم</span></h2>
          </div>
        </div>

        {/* Hadith Memorized */}
        <div className="bg-base-100 dark:bg-slate-900 border border-base-300/70 dark:border-slate-800 rounded-2xl shadow-xs p-2.5 sm:p-3.5 flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-right gap-2 sm:gap-3 transition-all">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-100 dark:bg-cyan-950/40 flex items-center justify-center shrink-0">
            <GiOpenBook className="text-cyan-700 dark:text-cyan-400 text-sm sm:text-base md:text-lg" />
          </div>

          <div className="text-center md:text-right min-w-0">
            <p className="text-[11px] sm:text-xs text-base-content/80 font-2 font-medium truncate">الأحاديث المحفوظة</p>
            <h2 className="text-sm sm:text-lg md:text-xl font-bold font-1 text-base-content">{props.hadith} <span className="text-[10px] sm:text-xs font-normal">حديث</span></h2>
          </div>
        </div>

        {/* In-Progress Hadith */}
        <div className="bg-base-100 dark:bg-slate-900 border border-base-300/70 dark:border-slate-800 rounded-2xl shadow-xs p-2.5 sm:p-3.5 flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-right gap-2 sm:gap-3 transition-all">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
            <FaPencilAlt className="text-emerald-700 dark:text-emerald-400 text-sm sm:text-base md:text-lg" />
          </div>

          <div className="text-center md:text-right min-w-0">
            <p className="text-[11px] sm:text-xs text-base-content/80 font-2 font-medium truncate">الأحاديث قيد الحفظ</p>
            <h2 className="text-sm sm:text-lg md:text-xl font-bold font-1 text-base-content">{props.inProgressHadithCount ?? props.inProgress ?? 0} <span className="text-[10px] sm:text-xs font-normal">حديث</span></h2>
          </div>
        </div>

      </div>
    </div>
  );
}
