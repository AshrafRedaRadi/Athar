import React, { useState, useEffect } from "react";
import { HiOutlineMap, HiCheck } from "react-icons/hi";
import { IoSparklesOutline, IoFlameOutline } from "react-icons/io5";

const STORAGE_KEY = "athar_daily_goals";

// Indexed by Date#getDay(): 0 is Sunday, 6 is Saturday.
const WEEKDAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// Shown while the week is still loading, so the row does not collapse to nothing.
const PLACEHOLDER_WEEK = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

/**
 * "2026-08-15" as a local Date.
 *
 * Split by hand rather than handed to `new Date(...)`, which reads a bare ISO date as UTC
 * and so reports the previous weekday for anyone west of Greenwich — the exact kind of
 * off-by-one this component is being fixed to stop making.
 */
function parsePlanDate(value) {
  if (typeof value !== "string") return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export default function DaysTarget({ weekData = [], goals: propGoals }) {
  const [goals, setGoals] = useState(() => {
    if (propGoals) return propGoals;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { newHadithsPerDay: 2, reviewsPerDay: 3 };
  });

  // Synchronize with propGoals whenever parent updates
  useEffect(() => {
    if (propGoals) {
      setGoals(propGoals);
    }
  }, [propGoals]);

  // Synchronize with changes in DailyGoal component custom event
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

  const currentNewCount = Number(
    propGoals?.newHadithsPerDay ??
    propGoals?.newAhadith ??
    goals?.newHadithsPerDay ??
    goals?.newAhadith ??
    2
  );
  const currentRevCount = Number(
    propGoals?.reviewsPerDay ??
    propGoals?.revisionCount ??
    goals?.reviewsPerDay ??
    goals?.revisionCount ??
    3
  );

  // The server sends the week السبت → الجمعة, beginning again each Saturday, and marks which
  // cell is today using the account's own time zone. Every cell is therefore read from its
  // own date and status rather than from its position in the array and the browser clock:
  // those two disagreed, and each day's figures were being drawn under another day's name.
  const days = Array.isArray(weekData) ? weekData : [];

  const weekDays = days.length > 0
    ? days.map((backendDay, idx) => {
        const date = parsePlanDate(backendDay?.date);
        const status = String(backendDay?.status || "").toLowerCase();

        const isToday = status === "current";
        const isUpcoming = status === "upcoming";
        const outsidePlan = status === "notapplicable";

        // A day the plan has not reached carries no snapshot, so its targets come back as
        // zero. The plan's own settings are the honest thing to show for it; a past day
        // genuinely had the targets it reports.
        const hTarget = backendDay?.newTarget > 0
          ? backendDay.newTarget
          : (isToday || isUpcoming ? currentNewCount : 0);
        const rTarget = backendDay?.reviewTarget > 0
          ? backendDay.reviewTarget
          : (isToday || isUpcoming ? currentRevCount : 0);

        let target;
        if (outsidePlan) target = "قبل بدء الخطة";
        else if (status === "rest") target = "يوم راحة 🌿";
        else target = `حفظ ${hTarget} • مراجعة ${rTarget}`;

        return {
          key: backendDay?.date || `day-${idx}`,
          day: date ? WEEKDAY_NAMES[date.getDay()] : "",
          number: idx + 1,
          isToday,
          // A day before the plan began is neither achieved nor missed; it was never part
          // of the plan, and showing it as a tick claimed credit that was never earned.
          status: outsidePlan ? "notApplicable" : status,
          target,
        };
      })
    : PLACEHOLDER_WEEK.map((name, idx) => ({
        key: `placeholder-${idx}`,
        day: name,
        number: idx + 1,
        isToday: false,
        status: "upcoming",
        target: "",
      }));

  const currentWeekIndex = weekDays.findIndex((day) => day.isToday);

  const completedCount = weekDays.filter((d) => d.status === "completed").length;
  // Progress line length in percentage from right to current day index
  const progressLinePercent = currentWeekIndex <= 0 ? 0 : Math.min(86, (currentWeekIndex / 6) * 86);
  const progressPercent = Math.round(((completedCount + (currentWeekIndex >= 0 ? 1 : 0)) / 7) * 100);

  return (
    <div
      className="w-full bg-base-100 dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-md border border-base-300/80 dark:border-slate-800 p-5 sm:p-7 font-2 text-base-content transition-all duration-300 relative overflow-hidden"
      dir="rtl"
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-base-200/80 dark:border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-700/10 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-2xl shrink-0 shadow-xs border border-cyan-700/20">
            <HiOutlineMap />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-1 font-bold text-lg sm:text-xl text-base-content">
                خارطة الطريق الأسبوعية
              </h3>
              <span className="badge badge-sm bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 font-bold border-0 px-2.5 py-0.5 rounded-lg text-xs">
                الأسبوع الحالي
              </span>
            </div>
            <p className="text-xs sm:text-sm text-base-content/60 font-normal mt-0.5 font-2">
              متابعة الإنجاز اليومي والمسار الأسبوعي للحفظ والمراجعة
            </p>
          </div>
        </div>

        {/* Progress & Today Badge */}
        <div className="flex items-center gap-2 bg-cyan-50/80 dark:bg-cyan-950/50 border border-cyan-200/70 dark:border-cyan-800/60 px-4 py-2 rounded-2xl self-start sm:self-center shadow-xs">
          <IoSparklesOutline className="text-cyan-700 dark:text-cyan-400 text-lg shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-cyan-900 dark:text-cyan-200 font-2">
            اليوم: <span className="text-cyan-700 dark:text-cyan-300 underline font-bold">{currentWeekIndex >= 0 ? weekDays[currentWeekIndex].day : "—"}</span>
          </span>
        </div>
      </div>

      {/* Modern Horizontal Timeline */}
      <div className="w-full overflow-x-auto pb-4 pt-2 [scrollbar-width:thin] relative z-10">
        <div className="min-w-[760px] px-4 relative py-3">
          {/* Background Connecting Line (behind all circles) */}
          <div className="absolute top-[38px] left-[7%] right-[7%] h-1.5 bg-base-200 dark:bg-slate-800 rounded-full z-0 pointer-events-none" />

          {/* Active Progress Line */}
          {progressLinePercent > 0 && (
            <div
              className="absolute top-[38px] right-[7%] h-1.5 bg-gradient-to-l from-cyan-600 via-cyan-500 to-teal-400 rounded-full transition-all duration-700 z-0 pointer-events-none shadow-sm shadow-cyan-500/30"
              style={{ width: `${progressLinePercent}%` }}
            />
          )}

          <div className="grid grid-cols-7 gap-2 relative z-10 text-center">
            {weekDays.map((item) => {
              const isToday = item.isToday;
              const isCompleted = item.status === "completed";
              const isMissed = item.status === "missed";
              const isOutsidePlan = item.status === "notApplicable";

              return (
                <div
                  key={item.key}
                  className={`flex flex-col items-center group transition-all duration-300 ${
                    isToday ? "scale-105" : ""
                  }`}
                >
                  {/* Node Circle */}
                  <div
                    className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-sm transition-all duration-300 relative z-10 shadow-sm ${
                      isToday
                        ? "bg-gradient-to-tr from-cyan-700 to-cyan-500 text-white ring-4 ring-cyan-500/30 shadow-lg shadow-cyan-700/30 scale-105 font-extrabold"
                        : isCompleted
                        ? "bg-cyan-700 text-white shadow-cyan-700/20 border-2 border-cyan-600"
                        : isMissed
                        ? "bg-amber-500 text-white border-2 border-amber-600 shadow-xs"
                        : isOutsidePlan
                        ? "bg-base-200/40 dark:bg-slate-800/40 text-base-content/30 border-2 border-dashed border-base-300/60 dark:border-slate-700/60"
                        : "bg-base-100 dark:bg-slate-800/90 text-base-content/70 border-2 border-base-300/80 dark:border-slate-700 group-hover:border-cyan-600/50 group-hover:scale-105"
                    }`}
                  >
                    {isCompleted ? (
                      <HiCheck className="text-2xl stroke-[2]" />
                    ) : (
                      <span className="font-mono text-base font-bold">
                        {item.number}
                      </span>
                    )}

                    {isToday && (
                      <span className="text-[9px] font-bold text-cyan-100 tracking-tight leading-none mt-0.5">
                        اليوم
                      </span>
                    )}
                  </div>

                  {/* Day Name */}
                  <span
                    className={`text-xs sm:text-sm font-bold mt-3 transition-colors ${
                      isToday
                        ? "text-cyan-700 dark:text-cyan-400 font-extrabold"
                        : isCompleted
                        ? "text-base-content font-bold"
                        : isOutsidePlan
                        ? "text-base-content/40 font-medium"
                        : "text-base-content/80 font-medium"
                    }`}
                  >
                    {item.day}
                  </span>

                  {/* Target Badge / Note (Fully Visible & Non-Truncated) */}
                  <div className="mt-1.5 w-full flex justify-center">
                    <span
                      className={`text-[10px] sm:text-xs whitespace-nowrap inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg font-medium transition-all ${
                        isToday
                          ? "bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-300/50 dark:border-cyan-800/60 shadow-xs"
                          : isCompleted
                          ? "bg-base-200/80 dark:bg-slate-800 text-base-content/80 font-medium"
                          : "bg-base-200/50 dark:bg-slate-800/50 text-base-content/70 font-normal"
                      }`}
                    >
                      {item.target}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}