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


          <button className="btn hover:bg-cyan-300 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-lg text-sm">
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


        {/* Task */}
        <div className="bg-base-200 rounded-xl p-5 border-r-4 border-cyan-600">

          <div className="flex justify-between items-center">

            <h3 className="font-medium">
              تسميع الحديث السابع
            </h3>


            <span className="text-xs text-red-500 bg-red-100 px-3 py-1 rounded-full">
              ينتهي اليوم
            </span>

          </div>


          <p className="text-sm text-gray-500 mt-4">
            الأربعون النووية
          </p>


          <button className="mt-4 btn btn-soft w-full border border-base-300 rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-base-100 transition">
            ابدأ التسميع
            <FaPlay className="text-sm" />
          </button>

        </div>

      </div>

    </div>
  );
}