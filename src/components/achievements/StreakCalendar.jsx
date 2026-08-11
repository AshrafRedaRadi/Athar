import React, { useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

/**
 * StreakCalendar component matching the exact Duolingo Streak Calendar visual style.
 * Features:
 * - Continuous light orange background pill track (bg-orange-100/90) matching the solid orange milestone circles (bg-orange-500)
 * - Solid orange circles for streak start/end milestone days
 * - Cyan blue drop-pin badge for Today
 * - Vibrant orange numbers inside the active track
 * - Saturday week start (س) & RTL alignment
 * - Month navigation
 *
 * Props:
 *   activeDays {string[]} - array of "YYYY-MM-DD" strings from the activity calendar API
 *   isLoading  {boolean}  - show skeleton while data is being fetched
 */
function StreakCalendar({ activeDays = [], isLoading = false }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Arabic Month Names
  const ARABIC_MONTHS = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ];

  // Abbreviated Day Names starting on Saturday (السبت)
  const DAY_NAMES = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Build a Set for O(1) lookup
  const activeDaysSet = new Set(activeDays);

  // Find first and last active day in the current month view for milestone styling
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const activeDaysThisMonth = activeDays
    .filter((d) => d.startsWith(monthPrefix))
    .sort();
  const streakStartStr = activeDaysThisMonth[0] || null;
  const streakEndStr   = activeDaysThisMonth[activeDaysThisMonth.length - 1] || null;

  // Month navigation
  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Build calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rawFirstDay  = new Date(year, month, 1).getDay();
  const firstDayOfWeek = (rawFirstDay + 1) % 7; // Saturday-start offset

  const calendarCells = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isActive:      activeDaysSet.has(dateStr),
      isToday:       dateStr === todayStr,
      isStreakStart: dateStr === streakStartStr,
      isStreakEnd:   dateStr === streakEndStr,
    });
  }

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  return (
    <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold font-1 text-base-content text-start">
            تقويم السلسلة
          </h2>
          <p className="text-xs text-base-content/50 text-start mt-0.5">
            متابعة أيام الدراسة والمراجعة
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 bg-base-200/60 rounded-full px-3 py-1 border border-base-300/50">
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-full text-base-content/70 hover:text-base-content hover:bg-base-300 transition-colors"
            title="الشهر التالي"
          >
            <IoChevronBack className="text-base" />
          </button>

          <span className="text-xs font-bold text-base-content min-w-[85px] text-center">
            {ARABIC_MONTHS[month]} {year}
          </span>

          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-full text-base-content/70 hover:text-base-content hover:bg-base-300 transition-colors"
            title="الشهر السابق"
          >
            <IoChevronForward className="text-base" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="w-full my-auto">
        {/* Day Name Headers (Saturday to Friday) */}
        <div className="grid grid-cols-7 text-center mb-3">
          {DAY_NAMES.map((name, index) => (
            <span key={index} className="text-xs font-bold text-base-content/40 py-1">
              {name}
            </span>
          ))}
        </div>

        {/* Loading skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-7 gap-y-4 gap-x-0 animate-pulse">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="flex items-center justify-center h-10">
                <div className="w-7 h-7 rounded-full bg-base-300/60" />
              </div>
            ))}
          </div>
        ) : (
          /* Calendar Days Grid */
          <div className="grid grid-cols-7 gap-y-4 gap-x-0">
            {calendarCells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="h-10" />;
              }

              const { dayNumber, isActive, isToday, isStreakStart, isStreakEnd } = cell;

              const colIndex     = index % 7;
              const prevCell     = colIndex > 0 ? calendarCells[index - 1] : null;
              const nextCell     = colIndex < 6 ? calendarCells[index + 1] : null;
              const hasPrevActive = prevCell && prevCell.isActive;
              const hasNextActive = nextCell && nextCell.isActive;

              let trackRounding = "rounded-full";
              if (isActive) {
                if (hasPrevActive && hasNextActive)        trackRounding = "rounded-none";
                else if (hasPrevActive && !hasNextActive)  trackRounding = "rounded-l-full rounded-r-none";
                else if (!hasPrevActive && hasNextActive)  trackRounding = "rounded-r-full rounded-l-none";
              }

              return (
                <div
                  key={cell.dateStr}
                  className="flex items-center justify-center h-10 relative"
                >
                  {/* Continuous Light Orange Background Track */}
                  {isActive && (
                    <div className={`absolute inset-y-0 inset-x-0 streak-track-bg ${trackRounding}`} />
                  )}

                  {isToday ? (
                    /* Today Pin Badge */
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center shadow-md text-sm">
                        {dayNumber}
                      </div>
                      <div className="absolute -bottom-1 w-2.5 h-2.5 bg-cyan-500 rotate-45 rounded-xs" />
                    </div>
                  ) : isStreakStart || isStreakEnd ? (
                    /* Solid Orange Circle for Streak Milestones */
                    <div className="relative z-10 w-9 h-9 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shadow-sm text-sm">
                      {dayNumber}
                    </div>
                  ) : isActive ? (
                    /* Active Track Day */
                    <span className="relative z-10 text-orange-500 font-bold text-sm sm:text-base">
                      {dayNumber}
                    </span>
                  ) : (
                    /* Inactive Day */
                    <span className="relative z-10 text-base-content/40 font-bold text-sm sm:text-base hover:bg-base-200/50 w-9 h-9 rounded-full flex items-center justify-center transition-colors">
                      {dayNumber}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Legend */}
      <div className="flex items-center justify-end gap-5 mt-4 pt-3 border-t border-base-200/60 text-xs text-base-content/60">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-orange-500 inline-block shadow-xs" />
          <span>بداية/نهاية السلسلة</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full streak-track-bg border border-orange-300 inline-block" />
          <span>سلسلة متواصلة</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 inline-block shadow-xs" />
          <span>اليوم</span>
        </div>
      </div>
    </div>
  );
}

export default StreakCalendar;
