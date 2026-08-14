import React, { useState, useEffect } from "react";
import { HiOutlineMap, HiCheck } from "react-icons/hi";
import { IoSparklesOutline } from "react-icons/io5";

const STORAGE_KEY = "athar_daily_goals";

// Arabic week structure starting Saturday (index 0) to Friday (index 6)
const WEEK_DAYS_CONFIG = [
  { dayIndex: 6, name: "السبت", number: 1 },
  { dayIndex: 0, name: "الأحد", number: 2 },
  { dayIndex: 1, name: "الإثنين", number: 3 },
  { dayIndex: 2, name: "الثلاثاء", number: 4 },
  { dayIndex: 3, name: "الأربعاء", number: 5 },
  { dayIndex: 4, name: "الخميس", number: 6 },
  { dayIndex: 5, name: "الجمعة", number: 7 },
];

export default function DaysTarget({ weekData = [] }) {
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { newAhadith: 2, revisionCount: 3 };
  });

  // Synchronize with changes in DailyGoal component
  useEffect(() => {
    const handleGoalsChanged = (e) => {
      if (e.detail) {
        setGoals(e.detail);
      } else {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) setGoals(JSON.parse(saved));
        } catch {}
      }
    };

    window.addEventListener("athar_daily_goals_changed", handleGoalsChanged);
    window.addEventListener("storage", handleGoalsChanged);
    return () => {
      window.removeEventListener("athar_daily_goals_changed", handleGoalsChanged);
      window.removeEventListener("storage", handleGoalsChanged);
    };
  }, []);

  const now = new Date();
  const currentJsDay = now.getDay(); // 0 (Sun) to 6 (Sat)
  const currentWeekIndex = (currentJsDay + 1) % 7; // Map JS day to Sat..Fri

  const newCount = Number(goals.newAhadith ?? goals.newHadithsPerDay ?? 2);
  const revCount = Number(goals.revisionCount ?? goals.reviewsPerDay ?? 3);

  // Map backend week items if provided or construct local week
  const weekDays = WEEK_DAYS_CONFIG.map((item, idx) => {
    let backendDay = null;
    if (Array.isArray(weekData) && weekData.length > 0) {
      // Find matching date or by index
      backendDay = weekData[idx] || null;
    }

    let status = "upcoming";
    let target = "";

    if (backendDay) {
      const rawStatus = (backendDay.status || "").toLowerCase();
      if (rawStatus === "completed") status = "completed";
      else if (rawStatus === "current") status = "current";
      else if (rawStatus === "missed") status = "missed";
      else if (rawStatus === "rest") status = "rest";
      else if (rawStatus === "notapplicable") status = "notapplicable";
      else status = "upcoming";

      const hTarget = backendDay.newTarget ?? newCount;
      const rTarget = backendDay.reviewTarget ?? revCount;
      target = `حفظ ${hTarget} • مراجعة ${rTarget}`;
    } else {
      if (idx < currentWeekIndex) {
        status = "completed";
      } else if (idx === currentWeekIndex) {
        status = "current";
      }
      target = idx === 6 ? `مراجعة وتثبيت (${newCount + revCount})` : `حفظ ${newCount} • مراجعة ${revCount}`;
    }

    return {
      day: item.name,
      number: item.number,
      status,
      target,
    };
  });

  const completedCount = weekDays.filter((d) => d.status === "completed" || d.status === "current").length;
  const progressPercent = Math.round((completedCount / weekDays.length) * 100);

  return (
    <div className="w-full bg-base-100 dark:bg-slate-900 rounded-3xl shadow-sm border border-base-300 dark:border-slate-800 p-4 sm:p-6 font-2 text-base-content transition-all duration-300" dir="rtl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-base-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-700/10 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xl shrink-0 shadow-xs border border-cyan-700/20">
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
        <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/80 px-3.5 py-1.5 rounded-2xl self-start sm:self-center shadow-xs">
          <IoSparklesOutline className="text-cyan-700 dark:text-cyan-400 text-base shrink-0" />
          <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300 font-mono">
            إنجاز الأسبوع: {completedCount} من {weekDays.length} أيام ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Modern Horizontal Interactive Timeline */}
      <div className="w-full overflow-x-auto pb-3 pt-1 [scrollbar-width:thin]">
        <div className="min-w-[640px] px-3 relative py-2">
          {/* Background Connecting Line (behind all circles) */}
          <div className="absolute top-[32px] left-[7%] right-[7%] h-1 bg-base-200 dark:bg-slate-800 rounded-full z-0 pointer-events-none" />
          
          {/* Active Progress Line */}
          <div
            className="absolute top-[32px] right-[7%] h-1 bg-gradient-to-l from-cyan-600 via-cyan-500 to-emerald-500 rounded-full transition-all duration-700 z-0 pointer-events-none"
            style={{ width: `${Math.min(86, Math.max(0, (completedCount / (weekDays.length - 1)) * 86))}%` }}
          />

          <div className="grid grid-cols-7 gap-2 relative z-10 text-center">
            {weekDays.map((item, idx) => {
              const isCompleted = item.status === "completed";
              const isCurrent = item.status === "current";
              const isMissed = item.status === "missed";

              return (
                <div key={item.number || idx} className="flex flex-col items-center group cursor-pointer">
                  {/* Node Circle */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 relative z-10 shadow-sm ${
                      isCompleted
                        ? "bg-cyan-700 text-white shadow-cyan-700/30 scale-100 border-2 border-cyan-600"
                        : isCurrent
                        ? "bg-emerald-600 dark:bg-emerald-500 text-white ring-4 ring-emerald-500/25 scale-110 shadow-lg shadow-emerald-600/30 font-extrabold z-20"
                        : isMissed
                        ? "bg-amber-500 text-white border-2 border-amber-600 shadow-xs"
                        : "bg-base-100 dark:bg-slate-900 text-base-content/70 border-2 border-base-300 dark:border-slate-700 group-hover:border-cyan-600/50 group-hover:scale-105"
                    }`}
                  >
                    {isCompleted ? (
                      <HiCheck className="text-2xl stroke-[1.5]" />
                    ) : (
                      <span className="font-mono text-base">{item.number}</span>
                    )}
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-xs font-bold mt-2.5 transition-colors ${
                      isCurrent
                        ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                        : isCompleted
                        ? "text-cyan-700 dark:text-cyan-400"
                        : "text-base-content/70"
                    }`}
                  >
                    {item.day}
                  </span>

                  {/* Day Target Note */}
                  <span 
                    className={`text-[10px] truncate max-w-[95px] mt-0.5 px-1.5 py-0.5 rounded-md font-medium transition-all ${
                      isCurrent
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/60"
                        : "text-base-content/60"
                    }`}
                    title={item.target}
                  >
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