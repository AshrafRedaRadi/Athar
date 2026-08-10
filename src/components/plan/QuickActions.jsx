import React from 'react';

const QuickActions = () => {
  return (
    <div
      className="bg-base-100 p-6 rounded-3xl shadow-sm border border-base-300 w-full space-y-4 font-2"
      dir="rtl"
    >
      <div className="flex items-center justify-start gap-2 text-base-content font-bold font-1 text-lg mb-1">
        <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3>إجراءات سريعة</h3>
      </div>

      <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full">
        <button
          className="flex-1 w-full bg-cyan-700 hover:bg-cyan-800 text-white font-semibold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          {/* أيقونة (+) */}
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          <span className="whitespace-nowrap">إضافة حديث</span>
        </button>

        <button
          className="flex-1 w-full bg-base-100 !text-cyan-600 border-2 border-cyan-700 hover:bg-cyan-700 hover:!text-white font-semibold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          {/* أيقونة التشغيل/المراجعة */}
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          <span className="whitespace-nowrap">بدء مراجعة</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;