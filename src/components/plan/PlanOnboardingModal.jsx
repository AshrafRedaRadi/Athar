import React, { useState } from "react";
import {
  HiOutlineSparkles,
  HiOutlineBookOpen,
  HiOutlineArrowPath,
  HiCheck,
  HiOutlineCheckBadge,
  HiOutlineLightBulb,
} from "react-icons/hi2";
import { FiPlus, FiMinus } from "react-icons/fi";
import { IoFlameOutline, IoSparkles } from "react-icons/io5";

// Preset Configurations
const PRESETS = [
  {
    id: "easy",
    title: "خطة ميسرة",
    badge: "موصى بها للبداية 🌟",
    badgeColor: "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    newHadiths: 1,
    reviews: 2,
    time: "15 دقيقة يومياً",
    desc: "حديث واحد جديد مع مراجعة حديثين لتثبيت سلس ومستمر بدون ضغط",
  },
  {
    id: "balanced",
    title: "خطة متوازنة",
    badge: "الخيار الأفضل 🚀",
    badgeColor: "bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800",
    newHadiths: 2,
    reviews: 3,
    time: "25 دقيقة يومياً",
    desc: "توازن مثالي بين سرعة الحفظ وقوة تثبيت المحفوظات السابقة",
  },
  {
    id: "intensive",
    title: "خطة مكثفة",
    badge: "لأصحاب الهمم 🔥",
    badgeColor: "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    newHadiths: 3,
    reviews: 5,
    time: "40 دقيقة يومياً",
    desc: "إنجاز متسارع لكتب ومتون الحديث مع مراجعة مكثفة للتثبيت",
  },
];

export default function PlanOnboardingModal({ isOpen, onConfirm, isSaving = false }) {
  const [selectedPreset, setSelectedPreset] = useState("balanced");
  const [newHadiths, setNewHadiths] = useState(2);
  const [reviewsCount, setReviewsCount] = useState(3);

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    setNewHadiths(preset.newHadiths);
    setReviewsCount(preset.reviews);
  };

  const handleCustomChange = (type, delta) => {
    setSelectedPreset("custom");
    if (type === "new") {
      setNewHadiths((prev) => Math.max(0, Math.min(10, prev + delta)));
    } else {
      setReviewsCount((prev) => Math.max(0, Math.min(50, prev + delta)));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newHadiths === 0 && reviewsCount === 0) return;
    onConfirm({
      newHadithsPerDay: newHadiths,
      reviewsPerDay: reviewsCount,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md transition-all duration-300 animate-fadeIn"
      dir="rtl"
    >
      <div
        className="bg-base-100 dark:bg-slate-900 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl border border-base-300 dark:border-slate-800 p-4 sm:p-6 font-2 text-base-content relative animate-cardIn [scrollbar-width:thin]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ── 1. Welcome Header ── */}
        <div className="text-center relative z-10">
          <h2 className="text-lg sm:text-2xl font-bold font-1 text-base-content">
            مرحباً بك في خطة أثر الذكية 🌿
          </h2>
          <p className="text-xs sm:text-sm text-base-content/70 font-normal mt-1 max-w-lg mx-auto">
            لتبدأ رحلتك المباركة في حفظ ومراجعة سنة النبي ﷺ، اختر الورد اليومي الأنسب لوقتك لبدء جدولتك التلقائية:
          </p>
        </div>

        {/* ── 2. Presets Selection (3 Smart Options) ── */}
        <div className="mt-4 space-y-2.5 relative z-10">
          <label className="text-xs sm:text-sm font-bold text-base-content flex items-center gap-1.5">
            <HiOutlineSparkles className="text-cyan-600 dark:text-cyan-400" />
            <span>اختر نمط الخطة المقترح:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESETS.map((p) => {
              const isSelected = selectedPreset === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none relative ${
                    isSelected
                      ? "bg-cyan-50/80 dark:bg-cyan-950/50 border-cyan-600 dark:border-cyan-500 ring-2 ring-cyan-500/20 shadow-md scale-[1.02]"
                      : "bg-base-200/50 dark:bg-slate-800/70 border-base-300/80 dark:border-slate-700 hover:border-cyan-400 dark:hover:border-cyan-700 hover:bg-base-200/80"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <h4 className="font-bold text-sm text-base-content font-1">
                        {p.title}
                      </h4>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-cyan-700 text-white flex items-center justify-center text-xs shrink-0">
                          <HiCheck />
                        </div>
                      )}
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-block mt-0.5 ${p.badgeColor}`}>
                      {p.badge}
                    </span>

                    <p className="text-[11px] text-base-content/70 mt-2 leading-relaxed font-normal">
                      {p.desc}
                    </p>
                  </div>

                  {/* Target details footer */}
                  <div className="mt-3.5 pt-2.5 border-t border-base-300/60 dark:border-slate-700/60 font-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300 whitespace-nowrap">
                        حفظ {p.newHadiths} • مراجعة {p.reviews}
                      </span>
                      <span className="text-[10px] font-medium text-base-content/60 whitespace-nowrap bg-base-300/40 dark:bg-slate-700/40 px-1.5 py-0.5 rounded-md">
                        {p.time}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. Fine-tuning Custom Counters ── */}
        <div className="mt-3.5 p-3.5 rounded-2xl bg-base-200/50 dark:bg-slate-800/60 border border-base-300/70 dark:border-slate-700 relative z-10">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-base-300/60 dark:border-slate-700/60">
            <span className="text-xs sm:text-sm font-bold text-base-content flex items-center gap-1.5">
              <span>تخصيص يدوي دقيق للأرقام:</span>
            </span>
            <span className="text-[11px] font-2 text-cyan-700 dark:text-cyan-400 font-bold">
              حفظ {newHadiths} • مراجعة {reviewsCount} أحاديث
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* New Hadiths Counter */}
            <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-base-100 dark:bg-slate-900 rounded-xl border border-base-300/60 dark:border-slate-700 shadow-2xs">
              <div className="text-right">
                <span className="font-bold text-xs sm:text-sm text-base-content block">مقدار الحفظ اليومي</span>
                <span className="text-[10px] text-base-content/60 font-normal">أحاديث جديدة (0 – 10)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCustomChange("new", -1)}
                  disabled={newHadiths <= 0 || (newHadiths === 1 && reviewsCount === 0)}
                  className="w-7 h-7 rounded-lg bg-base-200 dark:bg-slate-800 hover:bg-base-300 text-base-content flex items-center justify-center text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                >
                  <FiMinus />
                </button>
                <span className="w-6 text-center font-mono font-bold text-base text-cyan-700 dark:text-cyan-400">
                  {newHadiths}
                </span>
                <button
                  type="button"
                  onClick={() => handleCustomChange("new", 1)}
                  disabled={newHadiths >= 10}
                  className="w-7 h-7 rounded-lg bg-base-200 dark:bg-slate-800 hover:bg-base-300 text-base-content flex items-center justify-center text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Reviews Counter */}
            <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-base-100 dark:bg-slate-900 rounded-xl border border-base-300/60 dark:border-slate-700 shadow-2xs">
              <div className="text-right">
                <span className="font-bold text-xs sm:text-sm text-base-content block">مقدار المراجعة اليومية</span>
                <span className="text-[10px] text-base-content/60 font-normal">مراجعة المحفوظ (0 – 50)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCustomChange("rev", -1)}
                  disabled={reviewsCount <= 0 || (reviewsCount === 1 && newHadiths === 0)}
                  className="w-7 h-7 rounded-lg bg-base-200 dark:bg-slate-800 hover:bg-base-300 text-base-content flex items-center justify-center text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                >
                  <FiMinus />
                </button>
                <span className="w-6 text-center font-mono font-bold text-base text-amber-600 dark:text-amber-400">
                  {reviewsCount}
                </span>
                <button
                  type="button"
                  onClick={() => handleCustomChange("rev", 1)}
                  disabled={reviewsCount >= 50}
                  className="w-7 h-7 rounded-lg bg-base-200 dark:bg-slate-800 hover:bg-base-300 text-base-content flex items-center justify-center text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Prophetic Motivation Note ── */}
        <div className="mt-3 p-2.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-200/70 dark:border-cyan-800/60 flex items-start gap-2 text-xs text-cyan-900 dark:text-cyan-200">
          <HiOutlineLightBulb className="text-cyan-700 dark:text-cyan-400 text-base shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px] sm:text-xs">
            <span className="font-bold">توجيه نبوي:</span> «أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ». الالتزام بحفظ حديث أو حديثين يومياً يجعلك تختم الأربعين النووية وتتقنها كاملة في أسابيع قليلة!
          </p>
        </div>

        {/* ── 5. Submit Button ── */}
        <div className="mt-4 pt-2.5 border-t border-base-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || (newHadiths === 0 && reviewsCount === 0)}
            className="w-full py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-700 to-cyan-600 hover:from-cyan-800 hover:to-cyan-700 text-white font-2 text-sm sm:text-base font-bold shadow-lg shadow-cyan-700/25 hover:shadow-cyan-700/40 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                <span>جاري تفعيل وبدء الخطة في السيرفر...</span>
              </>
            ) : (
              <>
                <HiOutlineCheckBadge className="text-xl" />
                <span>تأكيد وبدء الخطة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
