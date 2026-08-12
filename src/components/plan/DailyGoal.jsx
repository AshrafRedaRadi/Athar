import React, { useState } from 'react';

const DailyGoal = () => {
  const [newAhadith, setNewAhadith] = useState(2);
  const [fixationCount, setFixationCount] = useState(5);
  const [revisionCount, setRevisionCount] = useState(10);

  return (
    <div className="bg-base-100 dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-base-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.09)] transition-all duration-300 w-full h-full flex flex-col justify-between space-y-4 font-2" dir="rtl">
      <div>
        <div className="flex items-center justify-start gap-2.5 text-base-content font-bold font-1 text-lg mb-4">
          <svg className="w-6 h-6 text-cyan-700 dark:text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span>المقدار اليومي</span>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-base-200/40 rounded-xl border border-base-200/60">
            <div className="text-right">
              <h4 className="font-bold text-base-content text-sm">أحاديث جديدة في اليوم</h4>
              <p className="text-xs text-base-content/60 mt-0.5">مقدار الحفظ الجديد</p>
            </div>
            <div className="flex items-center bg-base-100 border border-base-300/60 rounded-xl p-1 gap-1 shrink-0">
              <button 
                onClick={() => setNewAhadith(newAhadith + 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-200/80 hover:bg-cyan-700 hover:text-white rounded-lg flex items-center justify-center font-bold text-base-content transition cursor-pointer text-sm"
              >
                +
              </button>
              <span className="w-7 sm:w-8 text-center font-bold text-base-content text-sm sm:text-base">
                {newAhadith}
              </span>
              <button 
                onClick={() => setNewAhadith(Math.max(0, newAhadith - 1))}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-200/80 hover:bg-cyan-700 hover:text-white rounded-lg flex items-center justify-center font-bold text-base-content transition cursor-pointer text-sm"
              >
                -
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-base-200/40 rounded-xl border border-base-200/60">
            <div className="text-right">
              <h4 className="font-bold text-base-content text-sm">مقدار التثبيت</h4>
              <p className="text-xs text-base-content/60 mt-0.5">تكرار الحفظ الجديد</p>
            </div>
            <div className="flex items-center bg-base-100 border border-base-300/60 rounded-xl p-1 gap-1 shrink-0">
              <button 
                onClick={() => setFixationCount(fixationCount + 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-200/80 hover:bg-cyan-700 hover:text-white rounded-lg flex items-center justify-center font-bold text-base-content transition cursor-pointer text-sm"
              >
                +
              </button>
              <span className="w-7 sm:w-8 text-center font-bold text-base-content text-sm sm:text-base">
                {fixationCount}
              </span>
              <button 
                onClick={() => setFixationCount(Math.max(0, fixationCount - 1))}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-200/80 hover:bg-cyan-700 hover:text-white rounded-lg flex items-center justify-center font-bold text-base-content transition cursor-pointer text-sm"
              >
                -
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-base-200/40 rounded-xl border border-base-200/60">
            <div className="text-right">
              <h4 className="font-bold text-base-content text-sm">مقدار المراجعة في اليوم</h4>
              <p className="text-xs text-base-content/60 mt-0.5">مراجعة ما سبق حفظه</p>
            </div>
            <div className="flex items-center bg-base-100 border border-base-300/60 rounded-xl p-1 gap-1 shrink-0">
              <button 
                onClick={() => setRevisionCount(revisionCount + 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-200/80 hover:bg-cyan-700 hover:text-white rounded-lg flex items-center justify-center font-bold text-base-content transition cursor-pointer text-sm"
              >
                +
              </button>
              <span className="w-7 sm:w-8 text-center font-bold text-base-content text-sm sm:text-base">
                {revisionCount}
              </span>
              <button 
                onClick={() => setRevisionCount(Math.max(0, revisionCount - 1))}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-base-200/80 hover:bg-cyan-700 hover:text-white rounded-lg flex items-center justify-center font-bold text-base-content transition cursor-pointer text-sm"
              >
                -
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyGoal;