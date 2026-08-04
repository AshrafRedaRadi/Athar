import React from "react";
import { GiOpenBook } from "react-icons/gi";
import { FaFire, FaPencilAlt } from "react-icons/fa";

export default function Stat(props) {
  return (
    <div dir="rtl" className="mt-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Days */}
        <div className="bg-base-200 rounded-2xl shadow-sm p-6 flex items-center justify-between">
          <div className="text-right">
            <p className="text-sm text-gray-500">سلسلة الأيام</p>
            <h2 className="text-3xl font-bold">{props.days} يوم</h2>
          </div>

          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
            <FaFire className="text-orange-500 text-2xl" />
          </div>
        </div>

        {/* Hadith */}
        <div className="bg-base-200 rounded-2xl shadow-sm p-6 flex items-center justify-between">
          <div className="text-right">
            <p className="text-sm text-gray-500">الأحاديث المحفوظة</p>
            <h2 className="text-3xl font-bold">{props.hadith} حديث</h2>
          </div>

          <div className="w-14 h-14 rounded-full bg-cyan-100 flex items-center justify-center">
            <GiOpenBook className="text-cyan-700 text-2xl" />
          </div>
        </div>

        {/* In-Progress Hadith */}
        <div className="bg-base-200 rounded-2xl shadow-sm p-6 flex items-center justify-between">
          <div className="text-right">
            <p className="text-sm text-gray-500">الأحاديث قيد الحفظ</p>

            <div className="flex items-center justify-end gap-2 mt-1">
              <h2 className="text-3xl font-bold">{props.inProgressHadithCount ?? props.inProgress ?? 0} حديث</h2>
            </div>
          </div>

          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <FaPencilAlt className="text-green-700 text-2xl" />
          </div>
        </div>

      </div>
    </div>
  );
}
