import React, { useState, useRef } from 'react';
import { IoTimeOutline } from 'react-icons/io5';

const AdvancedSettings = () => {
  const [strictOrder, setStrictOrder] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [startTime, setStartTime] = useState("05:30");
  const timeInputRef = useRef(null);

  const handleCardClick = () => {
    if (timeInputRef.current) {
      try {
        if (typeof timeInputRef.current.showPicker === 'function') {
          timeInputRef.current.showPicker();
        } else {
          timeInputRef.current.focus();
        }
      } catch (err) {
        timeInputRef.current.focus();
      }
    }
  };

  return (
    <div className="bg-base-100 dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-base-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.09)] transition-all duration-300 w-full h-full flex flex-col justify-between space-y-4 font-2" dir="rtl">
      <style>{`
        .toggle,
        .toggle:checked {
          --tglbg: #ffffff !important;
        }
        .toggle::before,
        .toggle::after {
          background-color: #ffffff !important;
        }
      `}</style>

      <div>
        <div className="flex items-center justify-start gap-2.5 text-base-content font-bold font-1 text-lg mb-4">
          <span className="text-xl text-cyan-700 dark:text-cyan-400">⚙️</span>
          <span>الإعدادات المتقدمة</span>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div dir="rtl" className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-base-200/40 rounded-xl border border-base-200/60 cursor-pointer" onClick={() => setStrictOrder((prev) => !prev)}>
            <div className="text-right">
              <h4 className="font-bold text-base-content text-sm">ترتيب صارم</h4>
              <p className="text-xs text-base-content/60 mt-0.5">منع تجاوز الأحاديث غير المحفوظة</p>
            </div>
            <input
              type="checkbox"
              checked={strictOrder}
              onChange={(e) => setStrictOrder(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="toggle bg-base-300 border-base-300 checked:bg-cyan-700 checked:border-cyan-700 transition-colors duration-200 cursor-pointer shrink-0"
            />
          </div>

          <div dir="rtl" className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-base-200/40 rounded-xl border border-base-200/60 cursor-pointer" onClick={() => setNotifications((prev) => !prev)}>
            <div className="text-right">
              <h4 className="font-bold text-base-content text-sm">الإشعارات</h4>
              <p className="text-xs text-base-content/60 mt-0.5">تفعيل التذكير اليومي للورد</p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="toggle bg-base-300 border-base-300 checked:bg-cyan-700 checked:border-cyan-700 transition-colors duration-200 cursor-pointer shrink-0"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-base-200/80 space-y-2">
        <label className="block text-right font-bold text-base-content text-sm">
          وقت الابتداء (التذكير)
        </label>

        <div
          onClick={handleCardClick}
          className="relative overflow-hidden bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/70 dark:border-cyan-900/40 rounded-xl p-2.5 sm:p-3 flex items-center justify-between shadow-xs hover:border-cyan-400 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center gap-2 z-10">
            <span className="badge badge-sm bg-cyan-700 text-white border-none font-2 text-[11px] px-2 py-1">
              يومياً
            </span>
            <input
              ref={timeInputRef}
              className="font-2 font-bold text-sm sm:text-base text-base-content tracking-wider dir-ltr bg-transparent outline-none cursor-pointer px-1 py-0.5 rounded-lg hover:bg-base-100/50 transition-colors [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-lg shrink-0 z-10">
            <IoTimeOutline />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;