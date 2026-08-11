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
    <div className="bg-base-100 p-6 rounded-3xl shadow-sm border border-base-300 w-full max-w-sm space-y-5 font-2" dir="rtl">
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

      <div className="flex items-center justify-start gap-2 text-base-content font-bold font-1 text-lg">
        <span className="text-xl text-cyan-600 dark:text-cyan-400">⚙️</span>
        <span>الإعدادات المتقدمة</span>
      </div>

      <div dir='ltr' className="flex items-center justify-between cursor-pointer" onClick={() => setStrictOrder((prev) => !prev)}>
        <input
          type="checkbox"
          checked={strictOrder}
          onChange={(e) => setStrictOrder(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="toggle bg-base-300 border-base-300 checked:bg-cyan-700 checked:border-cyan-700 transition-colors duration-200 cursor-pointer"
        />
        <div className="text-right">
          <h4 className="font-semibold text-base-content text-sm">ترتيب صارم</h4>
          <p className="text-xs text-base-content/60">منع تجاوز الأحاديث غير المحفوظة</p>
        </div>
      </div>

      <div dir='ltr' className="flex items-center justify-between cursor-pointer" onClick={() => setNotifications((prev) => !prev)}>
        <input
          type="checkbox"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="toggle bg-base-300 border-base-300 checked:bg-cyan-700 checked:border-cyan-700 transition-colors duration-200 cursor-pointer"
        />
        <div className="text-right">
          <h4 className="font-semibold text-base-content text-sm">الإشعارات</h4>
          <p className="text-xs text-base-content/60">تفعيل التذكير اليومي للورد</p>
        </div>
      </div>

      <hr className="border-base-200" />

      <div className="space-y-2">
        <label className="block text-right font-semibold text-base-content text-sm">
          وقت الابتداء (التذكير)
        </label>

        <div
          onClick={handleCardClick}
          className="relative overflow-hidden bg-gradient-to-r from-cyan-700/10 via-base-200 to-base-200 border border-cyan-700/30 dark:border-cyan-500/30 rounded-2xl p-3.5 flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-300 group focus-within:ring-2 focus-within:ring-cyan-600/40 focus-within:border-cyan-600 cursor-pointer"
        >
          <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-600/10 rounded-full blur-xl pointer-events-none -z-0" />

          <div className="w-10 h-10 rounded-xl bg-cyan-700/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xl shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300 z-10">
            <IoTimeOutline />
          </div>

          <div className="flex items-center gap-2 z-10">
            <input
              ref={timeInputRef}
              className="font-2 font-bold text-base text-base-content tracking-wider dir-ltr bg-transparent outline-none cursor-pointer px-2 py-1 rounded-lg hover:bg-base-100/50 transition-colors [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <span className="badge badge-sm bg-cyan-700/70 text-cyan-800 dark:text-cyan-300 border-cyan-700/20 font-2 text-[11px]">
              يومياً
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdvancedSettings;