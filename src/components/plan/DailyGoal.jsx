import React, { useState } from 'react';

const DailyGoal = () => {
  const [newAhadith, setNewAhadith] = useState(2);
  const [fixationCount, setFixationCount] = useState(5);
  const [revisionCount, setRevisionCount] = useState(10);

  return (
    <div className="bg-base-100 p-6 rounded-3xl shadow-sm border border-base-300 w-full max-w-md space-y-6 font-2" dir="rtl">
      
      <div className="flex items-center justify-end gap-2 text-base-content font-bold font-1 text-lg">
        <span>المقدار اليومي</span>
        <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </div>

      <div className="space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-base-200 border border-base-300/50 rounded-xl p-1 gap-1">
            <button 
              onClick={() => setNewAhadith(newAhadith + 1)}
              className="w-8 h-8 bg-base-100 rounded-lg flex items-center justify-center font-bold text-base-content shadow-xs hover:bg-base-300 active:scale-95 transition cursor-pointer"
            >
              +
            </button>
            <span className="w-8 text-center font-bold text-base-content text-base">
              {newAhadith}
            </span>
            <button 
              onClick={() => setNewAhadith(Math.max(0, newAhadith - 1))}
              className="w-8 h-8 bg-base-100 rounded-lg flex items-center justify-center font-bold text-base-content shadow-xs hover:bg-base-300 active:scale-95 transition cursor-pointer"
            >
              -
            </button>
          </div>

          <div className="text-right">
            <h4 className="font-bold text-base-content text-sm">أحاديث جديدة في اليوم</h4>
            <p className="text-xs text-base-content/60 mt-0.5">مقدار الحفظ الجديد</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center bg-base-200 border border-base-300/50 rounded-xl p-1 gap-1">
            <button 
              onClick={() => setFixationCount(fixationCount + 1)}
              className="w-8 h-8 bg-base-100 rounded-lg flex items-center justify-center font-bold text-base-content shadow-xs hover:bg-base-300 active:scale-95 transition cursor-pointer"
            >
              +
            </button>
            <span className="w-8 text-center font-bold text-base-content text-base">
              {fixationCount}
            </span>
            <button 
              onClick={() => setFixationCount(Math.max(0, fixationCount - 1))}
              className="w-8 h-8 bg-base-100 rounded-lg flex items-center justify-center font-bold text-base-content shadow-xs hover:bg-base-300 active:scale-95 transition cursor-pointer"
            >
              -
            </button>
          </div>

          <div className="text-right">
            <h4 className="font-bold text-base-content text-sm">مقدار التثبيت</h4>
            <p className="text-xs text-base-content/60 mt-0.5">تكرار الحفظ الجديد</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center bg-base-200 border border-base-300/50 rounded-xl p-1 gap-1">
            <button 
              onClick={() => setRevisionCount(revisionCount + 1)}
              className="w-8 h-8 bg-base-100 rounded-lg flex items-center justify-center font-bold text-base-content shadow-xs hover:bg-base-300 active:scale-95 transition cursor-pointer"
            >
              +
            </button>
            <span className="w-8 text-center font-bold text-base-content text-base">
              {revisionCount}
            </span>
            <button 
              onClick={() => setRevisionCount(Math.max(0, revisionCount - 1))}
              className="w-8 h-8 bg-base-100 rounded-lg flex items-center justify-center font-bold text-base-content shadow-xs hover:bg-base-300 active:scale-95 transition cursor-pointer"
            >
              -
            </button>
          </div>

          <div className="text-right">
            <h4 className="font-bold text-base-content text-sm">مقدار المراجعة في اليوم</h4>
            <p className="text-xs text-base-content/60 mt-0.5">مراجعة ما سبق حفظه</p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DailyGoal;