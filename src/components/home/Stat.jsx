import React from "react";
import { GiOpenBook } from "react-icons/gi";
import { FaFire, FaPencilAlt } from "react-icons/fa";

export default function Stat(props) {
  return (
    <div dir="rtl" className="mt-4 sm:mt-8 md:mt-16">
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">

        {/* Days */}
        <div className="bg-base-200 rounded-2xl shadow-xs p-3 sm:p-5 md:p-6 flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-right gap-2 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <FaFire className="text-orange-500 text-lg sm:text-xl md:text-2xl" />
          </div>

          <div className="text-center md:text-right">
            <p className="text-[11px] sm:text-xs md:text-sm text-base-content/90 font-2">سلسلة الأيام</p>
            <h2 className="text-base sm:text-2xl md:text-3xl font-bold font-1">{props.days} <span className="text-xs sm:text-base font-normal">يوم</span></h2>
          </div>
        </div>

        {/* Hadith */}
        <div className="bg-base-200 rounded-2xl shadow-xs p-3 sm:p-5 md:p-6 flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-right gap-2 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
            <GiOpenBook className="text-cyan-700 text-lg sm:text-xl md:text-2xl" />
          </div>

          <div className="text-center md:text-right">
            <p className="text-[11px] sm:text-xs md:text-sm text-base-content/90 font-2">الأحاديث المحفوظة</p>
            <h2 className="text-base sm:text-2xl md:text-3xl font-bold font-1">{props.hadith} <span className="text-xs sm:text-base font-normal">حديث</span></h2>
          </div>
        </div>

        {/* In-Progress Hadith */}
        <div className="bg-base-200 rounded-2xl shadow-xs p-3 sm:p-5 md:p-6 flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-right gap-2 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <FaPencilAlt className="text-green-700 text-lg sm:text-xl md:text-2xl" />
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
