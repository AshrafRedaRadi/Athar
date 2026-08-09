import React from 'react';

const QuickActions = () => {
  return (
    <div 
      className="w-full font-sans md:bg-[#35829D] md:text-white md:p-5 md:rounded-2xl md:space-y-4 md:shadow-md" 
      dir="rtl"
    >
      <h3 className="hidden md:block text-right text-base font-semibold">
        إجراءات سريعة
      </h3>

      <div className="flex flex-row md:flex-col gap-3 w-full">
        
        <button
          className="flex-1 w-full bg-[#35829D] text-white md:bg-white md:text-[#35829D] font-medium py-3 px-5 rounded-full md:rounded-xl flex items-center justify-center gap-2 hover:opacity-90 md:hover:bg-gray-100 transition-all shadow-sm"
        >
          {/* أيقونة (+) */}
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          <span className="whitespace-nowrap">إضافة حديث</span>
        </button>

        <button
          className="flex-1 w-full bg-[#EBF3F6] text-[#35829D] md:bg-transparent md:border md:border-white/40 md:text-white font-medium py-3 px-5 rounded-full md:rounded-xl flex items-center justify-center gap-2 hover:bg-[#dcebf0] md:hover:bg-white/10 transition-all"
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