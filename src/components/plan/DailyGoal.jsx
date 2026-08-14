import React, { useState, useEffect } from 'react';
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";
import { FiPlus, FiMinus } from "react-icons/fi";

const STORAGE_KEY = "athar_daily_goals";

const DailyGoal = ({ onChange }) => {
  const [newAhadith, setNewAhadith] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.newAhadith ?? 2;
      }
    } catch {}
    return 2;
  });

  const [revisionCount, setRevisionCount] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.revisionCount ?? 5;
      }
    } catch {}
    return 5;
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ newAhadith, revisionCount })
      );
      window.dispatchEvent(
        new CustomEvent("athar_daily_goals_changed", {
          detail: { newAhadith, revisionCount }
        })
      );
      if (onChange) onChange({ newAhadith, revisionCount });
    } catch {}
  }, [newAhadith, revisionCount, onChange]);

  return (
    <div className="bg-base-100 dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-base-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 w-full h-full flex flex-col justify-between space-y-4 font-2" dir="rtl">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-base-200/70 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-base-content font-bold font-1 text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
              <HiOutlineAdjustmentsVertical className="w-5 h-5 shrink-0" />
            </div>
            <span>المقدار اليومي</span>
          </div>
          <span className="badge badge-sm bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-bold border-0 px-2.5 py-1">
            مخصص
          </span>
        </div>

        {/* Goal Items */}
        <div className="space-y-3 sm:space-y-4">
          {/* 1. New Memorization Goal */}
          <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 bg-base-100 dark:bg-slate-800/80 rounded-2xl border border-base-200 dark:border-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_14px_rgba(6,182,212,0.12)] transition-shadow">
            <div className="text-right">
              <h4 className="font-bold text-base-content text-sm sm:text-base">مقدار الحفظ اليومي</h4>
              <p className="text-xs text-base-content/60 mt-0.5">أحاديث جديدة في اليوم</p>
            </div>
            <div className="flex items-center bg-base-200/60 dark:bg-slate-900 border border-base-300/80 dark:border-slate-700 rounded-xl p-1 gap-1 shrink-0 shadow-xs">
              <button 
                onClick={() => setNewAhadith((prev) => prev + 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-100 dark:bg-slate-800 hover:bg-cyan-700 hover:text-white dark:hover:bg-cyan-600 rounded-lg flex items-center justify-center font-bold text-base-content transition active:scale-95 cursor-pointer text-sm shadow-xs"
                aria-label="زيادة مقدار الحفظ"
              >
                <FiPlus className="text-sm" />
              </button>
              <span className="w-7 sm:w-8 text-center font-bold font-mono text-base-content text-sm sm:text-base">
                {newAhadith}
              </span>
              <button 
                onClick={() => setNewAhadith((prev) => Math.max(1, prev - 1))}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-100 dark:bg-slate-800 hover:bg-cyan-700 hover:text-white dark:hover:bg-cyan-600 rounded-lg flex items-center justify-center font-bold text-base-content transition active:scale-95 cursor-pointer text-sm shadow-xs"
                aria-label="إنقاص مقدار الحفظ"
              >
                <FiMinus className="text-sm" />
              </button>
            </div>
          </div>

          {/* 2. Daily Revision Goal */}
          <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 bg-base-100 dark:bg-slate-800/80 rounded-2xl border border-base-200 dark:border-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_14px_rgba(6,182,212,0.12)] transition-shadow">
            <div className="text-right">
              <h4 className="font-bold text-base-content text-sm sm:text-base">مقدار المراجعة اليومية</h4>
              <p className="text-xs text-base-content/60 mt-0.5">مراجعة وتكرار ما سبق حفظه</p>
            </div>
            <div className="flex items-center bg-base-200/60 dark:bg-slate-900 border border-base-300/80 dark:border-slate-700 rounded-xl p-1 gap-1 shrink-0 shadow-xs">
              <button 
                onClick={() => setRevisionCount((prev) => prev + 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-100 dark:bg-slate-800 hover:bg-cyan-700 hover:text-white dark:hover:bg-cyan-600 rounded-lg flex items-center justify-center font-bold text-base-content transition active:scale-95 cursor-pointer text-sm shadow-xs"
                aria-label="زيادة مقدار المراجعة"
              >
                <FiPlus className="text-sm" />
              </button>
              <span className="w-7 sm:w-8 text-center font-mono font-bold text-base-content text-sm sm:text-base">
                {revisionCount}
              </span>
              <button 
                onClick={() => setRevisionCount((prev) => Math.max(1, prev - 1))}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-100 dark:bg-slate-800 hover:bg-cyan-700 hover:text-white dark:hover:bg-cyan-600 rounded-lg flex items-center justify-center font-bold text-base-content transition active:scale-95 cursor-pointer text-sm shadow-xs"
                aria-label="إنقاص مقدار المراجعة"
              >
                <FiMinus className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="pt-2 border-t border-base-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-base-content/70">
        <span>إجمالي الورد اليومي:</span>
        <span className="font-bold text-cyan-700 dark:text-cyan-400 font-mono text-sm">
          {newAhadith + revisionCount} أحاديث
        </span>
      </div>
    </div>
  );
};

export default DailyGoal;