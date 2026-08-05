import React from 'react';

const AdvancedSettings = () => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm space-y-5 font-sans" dir="rtl">
      
      {/* العنوان الرئيسي مع الأيقونة */}
      <div className="flex items-center justify-start gap-2 text-gray-900 font-bold text-lg">
        <span>الإعدادات المتقدمة</span>
        <span className="text-xl text-[#077187]">⚙️</span>
      </div>

      {/* الخيار الأول: ترتيب صارم */}
      <div className="flex items-center justify-between">
        <input 
          type="checkbox" 
          defaultChecked 
          className="toggle toggle-info bg-[#077187] checked:bg-[#077187] border-[#077187]" 
        />
        <div className="text-right">
          <h4 className="font-semibold text-gray-900 text-sm">ترتيب صارم</h4>
          <p className="text-xs text-gray-400">منع تجاوز الأحاديث غير المحفوظة</p>
        </div>
      </div>

      {/* الخيار الثاني: الإشعارات */}
      <div className="flex items-center justify-between">
        <input 
          type="checkbox" 
          defaultChecked 
          className="toggle toggle-info bg-[#077187] checked:bg-[#077187] border-[#077187]" 
        />
        <div className="text-right">
          <h4 className="font-semibold text-gray-900 text-sm">الإشعارات</h4>
          <p className="text-xs text-gray-400">تفعيل التذكير اليومي للورد</p>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* حقل وقت الابتداء (التذكير) */}
      <div className="space-y-2">
        <label className="block text-right font-semibold text-gray-900 text-sm">
          وقت الابتداء (التذكير)
        </label>
        
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl p-3 text-gray-700">
          <span className="font-medium dir-ltr text-sm">05:30 AM</span>
          
          {/* أيقونة الساعة */}
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

    </div>
  );
};

export default AdvancedSettings;