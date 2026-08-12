import React from "react";
import { GiOpenBook } from "react-icons/gi";
import { FaFire, FaPencilAlt } from "react-icons/fa";

export default function Stat(props) {
  return (
    <div dir="rtl" className="mt-4 sm:mt-6">
      <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">

        {/* Days */}
        <div className="bg-base-100 dark:bg-slate-900 border border-base-300/60 rounded-2xl shadow-xs p-3.5 sm:p-5 flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-right gap-2 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center shrink-0">
            <FaFire className="text-orange-500 text-base sm:text-lg md:text-xl" />
          </div>

          <div className="text-center md:text-right">
            <p className="text-[11px] sm:text-xs md:text-sm text-base-content/90 font-2">سلسلة الأيام</p>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold font-1">{props.days} <span className="text-xs sm:text-sm font-normal">يوم</span></h2>
          </div>
        </div>

        {/* Hadith */}
        <div className="bg-base-100 dark:bg-slate-900 border border-base-300/60 rounded-2xl shadow-xs p-3.5 sm:p-5 flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-right gap-2 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-cyan-100 dark:bg-cyan-950/40 flex items-center justify-center shrink-0">
            <GiOpenBook className="text-cyan-700 dark:text-cyan-400 text-base sm:text-lg md:text-xl" />
          </div>

          <div className="text-center md:text-right">
            <p className="text-[11px] sm:text-xs md:text-sm text-base-content/90 font-2">الأحاديث المحفوظة</p>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold font-1">{props.hadith} <span className="text-xs sm:text-sm font-normal">حديث</span></h2>
          </div>
        </div>

        {/* In-Progress Hadith */}
        <div className="bg-base-100 dark:bg-slate-900 border border-base-300/60 rounded-2xl shadow-xs p-3.5 sm:p-5 flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-right gap-2 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center shrink-0">
            <FaPencilAlt className="text-green-700 dark:text-green-400 text-base sm:text-lg md:text-xl" />
          </div>

          <div className="text-center md:text-right">
            <p className="text-[11px] sm:text-xs md:text-sm text-base-content/90 font-2">الأحاديث قيد الحفظ</p>
            <h2 className="text-base sm:text-2xl md:text-3xl font-bold font-1">{props.inProgressHadithCount ?? props.inProgress ?? 0} <span className="text-xs sm:text-base font-normal">حديث</span></h2>
          </div>
        </div>

      </div>
    </div>
  );
}
