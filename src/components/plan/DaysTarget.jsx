import React from "react";
import { HiOutlineMap, HiCheck } from "react-icons/hi";
import { IoSparklesOutline } from "react-icons/io5";

export default function DaysTarget() {
  const weekDays = [
    { day: "السبت", number: 1, status: "completed", target: "مراجعة 5 أحاديث" },
    { day: "الأحد", number: 2, status: "completed", target: "حفظ حديث جديد" },
    { day: "الإثنين", number: 3, status: "completed", target: "مراجعة قسم الفقه" },
    { day: "الثلاثاء", number: 4, status: "completed", target: "مراجعة 10 أحاديث" },
    { day: "الأربعاء", number: 5, status: "current", target: "هدف اليوم الحفظ" },
    { day: "الخميس", number: 6, status: "upcoming", target: "تسميع شفوي" },
    { day: "الجمعة", number: 7, status: "upcoming", target: "مراجعة عامة" },
  ];

  const completedCount = weekDays.filter((d) => d.status === "completed").length;
  const progressPercent = Math.round((completedCount / weekDays.length) * 100);

  return (
    <div className="w-full bg-base-100 rounded-3xl shadow-xs border border-base-300 p-4 sm:p-6 font-2 text-base-content" dir="rtl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-base-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xl shrink-0">
            <HiOutlineMap className="text-2xl" />
          </div>
          <div>
            <h3 className="font-1 font-bold text-lg text-base-content">
              خارطة الطريق الأسبوعية
            </h3>
            <p className="text-xs text-base-content/60 font-normal mt-0.5">
              متابعة الإنجاز اليومي والمسار الأسبوعي للحفظ والمراجعة
            </p>
          </div>
        </div>

        {/* Progress badge */}
        <div className="flex items-center gap-2 bg-cyan-700/10 border border-cyan-700/20 px-3.5 py-1.5 rounded-2xl self-start sm:self-center">
          <IoSparklesOutline className="text-cyan-700 dark:text-cyan-400 text-base shrink-0" />
          <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300">
            إنجاز الأسبوع: {completedCount} من {weekDays.length} أيام ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Modern Horizontal Interactive Timeline */}
      <div className="w-full overflow-x-auto pb-3 pt-2 scrollbar-thin">
        <div className="min-w-[640px] px-2 relative">
          {/* Connecting line background */}
          <div className="absolute top-[22px] left-[40px] right-[40px] h-1.5 bg-base-200 rounded-full -z-0"></div>
          {/* Active progress line */}
          <div
            className="absolute top-[22px] right-[40px] h-1.5 bg-gradient-to-l from-cyan-700 via-cyan-600 to-emerald-500 rounded-full transition-all duration-500 -z-0"
            style={{ width: `${(completedCount / (weekDays.length - 1)) * 90}%` }}
          ></div>

          <div className="grid grid-cols-7 gap-2 relative z-10 text-center">
            {weekDays.map((item) => {
              const isCompleted = item.status === "completed";
              const isCurrent = item.status === "current";

              return (
                <div key={item.number} className="flex flex-col items-center group cursor-pointer">
                  {/* Node Circle */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-xs ${
                      isCompleted
                        ? "bg-cyan-700 text-white shadow-cyan-700/30 scale-100"
                        : isCurrent
                        ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20 animate-pulse scale-110"
                        : "bg-base-200 text-base-content/60 border border-base-300 group-hover:border-cyan-600/40"
                    }`}
                  >
                    {isCompleted ? (
                      <HiCheck className="text-xl" />
                    ) : (
                      <span>{item.number}</span>
                    )}
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-xs font-bold mt-2.5 transition-colors ${
                      isCurrent
                        ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                        : isCompleted
                        ? "text-cyan-700 dark:text-cyan-400"
                        : "text-base-content/60"
                    }`}
                  >
                    {item.day}
                  </span>

                  {/* Day Target Note */}
                  <span className="text-[10px] text-base-content/50 truncate max-w-[80px] mt-0.5 font-normal">
                    {item.target}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}