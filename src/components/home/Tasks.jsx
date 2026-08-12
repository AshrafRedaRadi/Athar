import React from "react";
import { BiNotepad } from "react-icons/bi";
import { IoMdTime } from "react-icons/io";
import { FaPlay } from "react-icons/fa";

export default function DashboardTasks() {
  return (
    <div dir="rtl" className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

      {/* مراجعات مستحقة */}
      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <IoMdTime className="text-orange-500 text-2xl" />
          </div>

          <h2 className="text-lg font-bold">
            المراجعات المستحقة
          </h2>
        </div>

        <div className="border-b border-base-200 my-5"></div>


        {/* Review card */}
        <div className="bg-base-200 rounded-xl p-5 flex items-center justify-between">

          <div>
            <h3 className="font-medium">
              الأربعين النووية
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              3 أحاديث
            </p>
          </div>


          <button className="btn hover:bg-cyan-800 hover:text-white bg-cyan-600  px-4 py-2 rounded-lg text-sm">
            ابدأ المراجعة
          </button>

        </div>

      </div>



      {/* مهام اليوم */}
      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
            <BiNotepad className="text-cyan-700 text-2xl" />
          </div>

          <h2 className="text-lg font-bold">
            مهام اليوم
          </h2>
        </div>

        <div className="border-b border-base-200 my-5"></div>

        {/* Tasks list */}
        <div className="space-y-[14px]">

          <div className="bg-base-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <input type="checkbox" className="checkbox rounded-md" /> */}
              <span>حفظ حديث جديد</span>
            </div>

            <button className="w-8 h-8 rounded-full bg-cyan-700 text-white flex items-center justify-center text-xs hover:bg-cyan-800">
              <FaPlay />
            </button>
          </div>

          <div className="bg-base-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <input type="checkbox" className="checkbox rounded-md" /> */}
              <span>مراجعة 5 أحاديث</span>
            </div>

            <button className="w-8 h-8 rounded-full bg-cyan-700 text-white flex items-center justify-center text-xs hover:bg-cyan-800">
              <FaPlay />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
