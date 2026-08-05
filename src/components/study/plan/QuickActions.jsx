import React from 'react';

const QuickActions = () => {
  return (
    <div 
      className="bg-[#35829D] text-white p-5 rounded-2xl w-full  space-y-4 shadow-md font-sans" 
      dir="rtl"
    >
      {/* عنوان الكارت */}
      <h3 className="text-right text-base font-semibold">
        إجراءات سريعة
      </h3>

      {/* الأزرار */}
      <div className="space-y-3">
        {/* الزر الأول (الأبيض) */}
        <button
        
          className="w-full bg-white text-[#35829D] font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-sm"
        >
          {/* أيقونة (+) */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>إضافة حديث</span>
        </button>

        {/* الزر الثاني (الشفاف بإطار) */}
        <button
          
          className="w-full bg-transparent border border-white/40 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
        >
          {/* أيقونة بدء المراجعة */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>بدء مراجعة</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;