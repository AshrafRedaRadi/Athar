import React, { useState, useEffect } from 'react';
import { HiOutlineSparkles, HiCheck } from 'react-icons/hi2';

const STORAGE_KEY = "athar_hadith_font";

export const FONTS_CONFIG = [
  {
    id: "DigitalKhatt",
    name: "خط ترتيل الرقمي",
    subtitle: "رسم حديث فائق الوضوح (المستخدم في ترتيل)",
    fontClass: "font-digitalkhatt",
    badge: "ترتيل AI",
    badgeColor: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  },
  {
    id: "UthmanicHafs",
    name: "خط مصحف المدينة",
    subtitle: "الرسم العثماني المعتمد لمجمع الملك فهد",
    fontClass: "font-uthmanic",
    badge: "مصحف المدينة",
    badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  {
    id: "Amiri",
    name: "خط أميري",
    subtitle: "خط النسخ الكلاسيكي التراثي",
    fontClass: "font-amiri",
    badge: "نسخ أصيل",
    badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
];

export function applyHadithFont(fontId) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-hadith-font", fontId);
    document.body.setAttribute("data-hadith-font", fontId);
    localStorage.setItem(STORAGE_KEY, fontId);
    window.dispatchEvent(new CustomEvent("athar_hadith_font_changed", { detail: { fontId } }));
  }
}

export function getInitialHadithFont() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
  }
  return "DigitalKhatt";
}

export default function HadithFontSwitcher() {
  const [selectedFont, setSelectedFont] = useState(getInitialHadithFont);

  useEffect(() => {
    applyHadithFont(selectedFont);
  }, [selectedFont]);

  const handleSelect = (fontId) => {
    setSelectedFont(fontId);
    applyHadithFont(fontId);
  };

  const currentConfig = FONTS_CONFIG.find((f) => f.id === selectedFont) || FONTS_CONFIG[0];

  return (
    <div className="space-y-4">
      {/* 3 Font Options Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {FONTS_CONFIG.map((f) => {
          const isSelected = selectedFont === f.id;
          return (
            <div
              key={f.id}
              onClick={() => handleSelect(f.id)}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs select-none ${
                isSelected
                  ? "bg-cyan-50/70 dark:bg-cyan-950/40 border-cyan-600 dark:border-cyan-500 ring-2 ring-cyan-500/20 shadow-md"
                  : "bg-base-100 dark:bg-slate-800/80 border-base-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-base-200/50"
              }`}
            >
              {/* Header with Title and Selected Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-base-content">
                      {f.name}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0">
                        <HiCheck className="text-xs" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-base-content/60 mt-0.5 font-normal">
                    {f.subtitle}
                  </p>
                </div>
              </div>

              {/* Tag / Badge */}
              <div className="mt-2 flex items-center justify-start">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${f.badgeColor}`}>
                  {f.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Preview Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-base-200/50 dark:bg-slate-800/50 border border-base-300 dark:border-slate-700/80 shadow-inner">
        <div className="flex items-center justify-between text-xs text-base-content/60 mb-2 border-b border-base-300/60 dark:border-slate-700/60 pb-2">
          <span className="flex items-center gap-1.5 font-semibold">
            <HiOutlineSparkles className="text-cyan-600 dark:text-cyan-400 text-sm" />
            معاينة نص الحديث ({currentConfig.name}):
          </span>
          <span className="badge badge-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 font-mono">
            {selectedFont}
          </span>
        </div>

        <p className={`text-center text-lg sm:text-2xl leading-[2.4] text-base-content py-2 font-normal whitespace-pre-wrap ${currentConfig.fontClass}`}>
          «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»
        </p>
      </div>
    </div>
  );
}
