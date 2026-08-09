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
 */
function StreakCalendar() {
  const [viewDate, setViewDate] = useState(new Date(2026, 7, 1)); // Default to August 2026

  // Arabic Month Names
  const ARABIC_MONTHS = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  // Abbreviated Day Names starting on Saturday (السبت)
  const DAY_NAMES = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];

  // Mock Active Days matching the screenshot streak pattern (Days 2 to 15)
  const activeDaysSet = new Set([
    "2026-08-02", // Streak Start (Solid Orange Circle)
    "2026-08-03",
    "2026-08-04",
    "2026-08-05",
    "2026-08-06",
    "2026-08-07",
    "2026-08-08",
    "2026-08-09",
    "2026-08-10",
    "2026-08-11",
    "2026-08-12", // Today (Cyan Badge)
    "2026-08-13",
    "2026-08-14",
    "2026-08-15", // Streak End (Solid Orange Circle)
  ]);

  // Special milestone days for distinct styling matching Duolingo screenshot
  const streakStartStr = "2026-08-02";
  const streakEndStr = "2026-08-15";
  const todayStr = "2026-08-12";

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Helper functions for month navigation
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Calculate calendar layout
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Saturday-based first day offset: JS getDay() returns 0 for Sunday, 6 for Saturday.
  const rawFirstDay = new Date(year, month, 1).getDay();
  const firstDayOfWeek = (rawFirstDay + 1) % 7;

  // Build grid days array (length will be multiple of 7)
  const calendarCells = [];

  // Padding cells before day 1
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }

  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dayFormatted = String(d).padStart(2, "0");
    const monthFormatted = String(month + 1).padStart(2, "0");
    const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;

    const isActive = activeDaysSet.has(dateStr);
    const isToday = dateStr === todayStr;
    const isStreakStart = dateStr === streakStartStr;
    const isStreakEnd = dateStr === streakEndStr;

    calendarCells.push({
      dayNumber: d,
      dateStr,
      isActive,
      isToday,
      isStreakStart,
      isStreakEnd,
    });
  }

  // Pad remaining cells of last row
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
            <span
              key={index}
              className="text-xs font-bold text-base-content/40 py-1"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-y-4 gap-x-0">
          {calendarCells.map((cell, index) => {
            if (!cell) {
              return <div key={`empty-${index}`} className="h-10" />;
            }

            const { dayNumber, isActive, isToday, isStreakStart, isStreakEnd } = cell;

            // Row-level track calculations for continuous Duolingo capsule track
            const colIndex = index % 7; // 0 (Saturday/Right) to 6 (Friday/Left) in RTL
            const prevCell = colIndex > 0 ? calendarCells[index - 1] : null;
            const nextCell = colIndex < 6 ? calendarCells[index + 1] : null;

            const hasPrevActive = prevCell && prevCell.isActive;
            const hasNextActive = nextCell && nextCell.isActive;

            // Track background rounding logic per cell in RTL layout
            let trackRounding = "rounded-full";
            if (isActive) {
              if (hasPrevActive && hasNextActive) {
                trackRounding = "rounded-none";
              } else if (hasPrevActive && !hasNextActive) {
                trackRounding = "rounded-l-full rounded-r-none";
              } else if (!hasPrevActive && hasNextActive) {
                trackRounding = "rounded-r-full rounded-l-none";
              }
            }

            return (
              <div
                key={cell.dateStr}
                className="flex items-center justify-center h-10 relative"
              >
                {/* Continuous Light Orange Background Track for active streak days */}
                {isActive && (
                  <div
                    className={`absolute inset-y-0 inset-x-0 streak-track-bg ${trackRounding}`}
                  />
                )}

                {/* Day Content Rendering */}
                {isToday ? (
                  /* Today Pin Badge (Cyan Circle with Pin Tail) */
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center shadow-md text-sm">
                      {dayNumber}
                    </div>
                    {/* Pin tail */}
                    <div className="absolute -bottom-1 w-2.5 h-2.5 bg-cyan-500 rotate-45 rounded-xs" />
                  </div>
                ) : isStreakStart || isStreakEnd ? (
                  /* Solid Orange Circle for Streak Milestones (Start / End) */
                  <div className="relative z-10 w-9 h-9 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shadow-sm text-sm">
                    {dayNumber}
                  </div>
                ) : isActive ? (
                  /* Intermediate Active Track Day (Vibrant Orange Bold Text inside track) */
                  <span className="relative z-10 text-orange-500 font-bold text-sm sm:text-base">
                    {dayNumber}
                  </span>
                ) : (
                  /* Inactive Day outside streak (Grey Number) */
                  <span className="relative z-10 text-base-content/40 font-bold text-sm sm:text-base hover:bg-base-200/50 w-9 h-9 rounded-full flex items-center justify-center transition-colors">
                    {dayNumber}
                  </span>
                )}
              </div>
            );
          })}
        </div>
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
