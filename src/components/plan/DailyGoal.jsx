import React, { useState, useEffect } from 'react';
import { HiOutlineCalendar, HiCheckBadge } from "react-icons/hi2";
import { FiPlus, FiMinus } from "react-icons/fi";

const STORAGE_KEY = "athar_daily_goals";

export default function DailyGoal({ settings, onChange, onSave, isSaving = false }) {
  const [newHadiths, setNewHadiths] = useState(() => {
    if (settings?.newHadithsPerDay !== undefined) return settings.newHadithsPerDay;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).newAhadith ?? 2;
    } catch {}
    return 2;
  });

  const [reviewsCount, setReviewsCount] = useState(() => {
    if (settings?.reviewsPerDay !== undefined) return settings.reviewsPerDay;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).revisionCount ?? 3;
    } catch {}
    return 3;
  });

  // Sync when settings prop arrives from API
  useEffect(() => {
    if (settings?.newHadithsPerDay !== undefined) {
      setNewHadiths(settings.newHadithsPerDay);
    }
    if (settings?.reviewsPerDay !== undefined) {
      setReviewsCount(settings.reviewsPerDay);
    }
  }, [settings?.newHadithsPerDay, settings?.reviewsPerDay]);

  const handleUpdate = (newH, newR) => {
    // Validation rules: 0-10 for new, 0-50 for reviews, not both 0
    const clampedH = Math.max(0, Math.min(10, newH));
    const clampedR = Math.max(0, Math.min(50, newR));

    if (clampedH === 0 && clampedR === 0) return;

    setNewHadiths(clampedH);
    setReviewsCount(clampedR);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ newAhadith: clampedH, revisionCount: clampedR })
      );
      window.dispatchEvent(
        new CustomEvent("athar_daily_goals_changed", {
          detail: { newAhadith: clampedH, revisionCount: clampedR }
        })
      );
    } catch {}

    if (onChange) {
      onChange({ newHadithsPerDay: clampedH, reviewsPerDay: clampedR });
    }
  };

  return (
    <div className="bg-base-100 dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-base-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 w-full font-2" dir="rtl">
      <div>
        {/* Card Header: 'خطة الحفظ والمراجعة اليومية' on right, 'حفظ التغييرات' on left */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-base-200/70 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold font-1 text-base-content">
            <div className="w-8 h-8 rounded-xl bg-cyan-700/10 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-lg shrink-0 shadow-xs">
              <HiOutlineCalendar className="w-5 h-5 shrink-0" />
            </div>
            <span>خطة الحفظ والمراجعة اليومية</span>
          </div>

          {/* Save Button */}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="px-4 sm:px-5 py-2 rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white font-2 text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer disabled:opacity-60 flex items-center gap-2"
              title="حفظ تعديلات الخطة"
            >
              {isSaving ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <HiCheckBadge className="text-base sm:text-lg" />
              )}
              <span>{isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
            </button>
          )}
        </div>

        {/* 2 Goals Side-by-Side in 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 items-stretch">
          {/* 1. New Memorization Goal */}
          <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 bg-base-100 dark:bg-slate-800/80 rounded-2xl border border-base-200 dark:border-slate-700 shadow-xs">
            <div className="text-right">
              <h4 className="font-bold text-base-content text-sm sm:text-base">مقدار الحفظ اليومي</h4>
              <p className="text-xs text-base-content/60 mt-0.5">أحاديث جديدة (0 – 10)</p>
            </div>
            <div className="flex items-center bg-base-200/60 dark:bg-slate-900 border border-base-300/80 dark:border-slate-700 rounded-xl p-1 gap-1 shrink-0 shadow-xs">
              <button 
                type="button"
                onClick={() => handleUpdate(newHadiths + 1, reviewsCount)}
                disabled={newHadiths >= 10}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-100 dark:bg-slate-800 hover:bg-cyan-700 hover:text-white dark:hover:bg-cyan-600 rounded-lg flex items-center justify-center font-bold text-base-content transition active:scale-95 cursor-pointer text-sm shadow-xs disabled:opacity-40"
                aria-label="زيادة مقدار الحفظ"
              >
                <FiPlus className="text-sm" />
              </button>
              <span className="w-7 sm:w-8 text-center font-bold font-mono text-base-content text-sm sm:text-base">
                {newHadiths}
              </span>
              <button 
                type="button"
                onClick={() => handleUpdate(newHadiths - 1, reviewsCount)}
                disabled={newHadiths <= 0 || (newHadiths === 1 && reviewsCount === 0)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-100 dark:bg-slate-800 hover:bg-cyan-700 hover:text-white dark:hover:bg-cyan-600 rounded-lg flex items-center justify-center font-bold text-base-content transition active:scale-95 cursor-pointer text-sm shadow-xs disabled:opacity-40"
                aria-label="إنقاص مقدار الحفظ"
              >
                <FiMinus className="text-sm" />
              </button>
            </div>
          </div>

          {/* 2. Daily Revision Goal */}
          <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 bg-base-100 dark:bg-slate-800/80 rounded-2xl border border-base-200 dark:border-slate-700 shadow-xs">
            <div className="text-right">
              <h4 className="font-bold text-base-content text-sm sm:text-base">مقدار المراجعة اليومية</h4>
              <p className="text-xs text-base-content/60 mt-0.5">مراجعة ما سبق حفظه (0 – 50)</p>
            </div>
            <div className="flex items-center bg-base-200/60 dark:bg-slate-900 border border-base-300/80 dark:border-slate-700 rounded-xl p-1 gap-1 shrink-0 shadow-xs">
              <button 
                type="button"
                onClick={() => handleUpdate(newHadiths, reviewsCount + 1)}
                disabled={reviewsCount >= 50}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-100 dark:bg-slate-800 hover:bg-cyan-700 hover:text-white dark:hover:bg-cyan-600 rounded-lg flex items-center justify-center font-bold text-base-content transition active:scale-95 cursor-pointer text-sm shadow-xs disabled:opacity-40"
                aria-label="زيادة مقدار المراجعة"
              >
                <FiPlus className="text-sm" />
              </button>
              <span className="w-7 sm:w-8 text-center font-bold font-mono text-base-content text-sm sm:text-base">
                {reviewsCount}
              </span>
              <button 
                type="button"
                onClick={() => handleUpdate(newHadiths, reviewsCount - 1)}
                disabled={reviewsCount <= 0 || (reviewsCount === 1 && newHadiths === 0)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-100 dark:bg-slate-800 hover:bg-cyan-700 hover:text-white dark:hover:bg-cyan-600 rounded-lg flex items-center justify-center font-bold text-base-content transition active:scale-95 cursor-pointer text-sm shadow-xs disabled:opacity-40"
                aria-label="إنقاص مقدار المراجعة"
              >
                <FiMinus className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-base-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-base-content/70">
        <span>إجمالي المستهدف اليومي:</span>
        <span className="font-bold text-cyan-700 dark:text-cyan-400 font-mono text-sm">
          {newHadiths + reviewsCount} أحاديث / يوم
        </span>
      </div>
    </div>
  );
}