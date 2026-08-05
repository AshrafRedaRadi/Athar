import React, { useState } from 'react';

const DailyGoal = () => {
  // حالة محلية بسيطة لزيادة ونقصان الأرقام بشكل تفاعلي
  const [newAhadith, setNewAhadith] = useState(2);
  const [fixationCount, setFixationCount] = useState(5);
  const [revisionCount, setRevisionCount] = useState(10);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 w-full max-w-md space-y-6 font-sans" dir="rtl">
      
      {/* العنوان الرئيسي مع الأيقونة */}
      <div className="flex items-center justify-end gap-2 text-gray-900 font-bold text-lg">
        <span>المقدار اليومي</span>
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </div>

      {/* الخيارات الثلاثة */}
      <div className="space-y-4">
        
        {/* 1. أحاديث جديدة في اليوم */}
        <div className="flex items-center justify-between">
          {/* عداد الأرقام (الزيادة والنقصان) */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button 
              onClick={() => setNewAhadith(newAhadith + 1)}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition"
            >
              +
            </button>
            <span className="w-8 text-center font-bold text-gray-800 text-base">
              {newAhadith}
            </span>
            <button 
              onClick={() => setNewAhadith(Math.max(0, newAhadith - 1))}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition"
            >
              -
            </button>
          </div>

          {/* النصوص وصف الخيار */}
          <div className="text-right">
            <h4 className="font-bold text-gray-900 text-sm">أحاديث جديدة في اليوم</h4>
            <p className="text-xs text-gray-400 mt-0.5">مقدار الحفظ الجديد</p>
          </div>
        </div>

        {/* 2. مقدار التثبيت */}
        <div className="flex items-center justify-between">
          {/* عداد الأرقام */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button 
              onClick={() => setFixationCount(fixationCount + 1)}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition"
            >
              +
            </button>
            <span className="w-8 text-center font-bold text-gray-800 text-base">
              {fixationCount}
            </span>
            <button 
              onClick={() => setFixationCount(Math.max(0, fixationCount - 1))}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition"
            >
              -
            </button>
          </div>

          {/* النصوص وصف الخيار */}
          <div className="text-right">
            <h4 className="font-bold text-gray-900 text-sm">مقدار التثبيت</h4>
            <p className="text-xs text-gray-400 mt-0.5">تكرار الحفظ الجديد</p>
          </div>
        </div>

        {/* 3. مقدار المراجعة في اليوم */}
        <div className="flex items-center justify-between">
          {/* عداد الأرقام */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button 
              onClick={() => setRevisionCount(revisionCount + 1)}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition"
            >
              +
            </button>
            <span className="w-8 text-center font-bold text-gray-800 text-base">
              {revisionCount}
            </span>
            <button 
              onClick={() => setRevisionCount(Math.max(0, revisionCount - 1))}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition"
            >
              -
            </button>
          </div>

          {/* النصوص وصف الخيار */}
          <div className="text-right">
            <h4 className="font-bold text-gray-900 text-sm">مقدار المراجعة في اليوم</h4>
            <p className="text-xs text-gray-400 mt-0.5">مراجعة ما سبق حفظه</p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DailyGoal;