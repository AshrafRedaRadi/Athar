import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BiNotepad } from "react-icons/bi";
import { IoMdTime } from "react-icons/io";
import { FaPlay } from "react-icons/fa";
import {
  HiCheck,
  HiOutlineBookOpen,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
} from "react-icons/hi2";

const STORAGE_KEY = "athar_daily_goals";

export default function DashboardTasks({
  summary,
  planOverview,
  bookId = 1,
  resumeHadithId = 1,
  resumeSectionId = 0,
  bookTitle = "الأربعين النووية",
}) {
  const navigate = useNavigate();

  // Local storage fallback for daily goals
  const [localGoals, setLocalGoals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { newAhadith: 2, revisionCount: 3 };
  });

  useEffect(() => {
    const handleGoalsChanged = (e) => {
      if (e.detail) {
        setLocalGoals(e.detail);
      }
    };
    window.addEventListener("athar_daily_goals_changed", handleGoalsChanged);
    return () => window.removeEventListener("athar_daily_goals_changed", handleGoalsChanged);
  }, []);

  // 1. Due Reviews Data
  const dueReviews = planOverview?.dueReviews || summary?.dueReviews || null;
  const rawCandidates = Array.isArray(dueReviews?.candidates) ? dueReviews.candidates : [];
  const dueTarget = dueReviews?.target ?? (rawCandidates.length > 0 ? rawCandidates.length : 0);
  const dueCompleted = dueReviews?.completed ?? 0;
  const dueRemaining = dueReviews?.remaining ?? Math.max(0, dueTarget - dueCompleted);

  // Get active candidate
  const firstCandidate = rawCandidates.length > 0 ? rawCandidates[0] : null;
  const activeReviewBookTitle = firstCandidate?.bookTitle || bookTitle || "الأربعين النووية";
  const activeReviewHadithCount = rawCandidates.length > 0 ? rawCandidates.length : dueRemaining;

  // 2. Today's Tasks Targets & Progress
  const newTarget = Number(
    planOverview?.settings?.newHadithsPerDay ??
    localGoals?.newHadithsPerDay ??
    localGoals?.newAhadith ??
    2
  );
  const revTarget = Number(
    planOverview?.settings?.reviewsPerDay ??
    localGoals?.reviewsPerDay ??
    localGoals?.revisionCount ??
    3
  );

  // Completed counts for today
  const newCompleted = Number(
    planOverview?.todayNewMemorizedCount ??
    planOverview?.newCompleted ??
    0
  );
  const revCompleted = Number(
    dueReviews?.completed ??
    planOverview?.todayReviewsCount ??
    planOverview?.reviewsCompleted ??
    0
  );

  const isNewDone = newTarget > 0 && newCompleted >= newTarget;
  const isRevDone = revTarget > 0 && revCompleted >= revTarget;

  const newPercent = newTarget > 0 ? Math.min(100, Math.round((newCompleted / newTarget) * 100)) : 0;
  const revPercent = revTarget > 0 ? Math.min(100, Math.round((revCompleted / revTarget) * 100)) : 0;

  // Navigation handlers
  const handleStartMemorize = () => {
    if (bookId && resumeHadithId) {
      navigate(`/library/${bookId}/${resumeSectionId || 0}/${resumeHadithId}`);
    } else {
      navigate(`/library/${bookId || 1}/0/1`);
    }
  };

  const handleStartReview = () => {
    if (firstCandidate) {
      const bId = firstCandidate.bookId || bookId || 1;
      const sId = firstCandidate.sectionId || 0;
      const hId = firstCandidate.hadithId || firstCandidate.id || 1;
      navigate(`/library/${bId}/${sId}/${hId}`);
    } else {
      navigate("/plan");
    }
  };

  return (
    <div dir="rtl" className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6 font-2">

      {/* ── 1. المراجعات المستحقة (Due Reviews) ── */}
      <div className="bg-base-100 dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-base-200 dark:border-slate-800 shadow-sm p-4 sm:p-4.5 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-base-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg shrink-0 shadow-xs border border-amber-500/20">
                <IoMdTime />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold font-1 text-base-content leading-tight">
                  المراجعات المستحقة
                </h2>
                <p className="text-[10px] sm:text-[11px] text-base-content/60 font-normal">
                  تثبيت ما تم حفظه وفق جدول المراجعة
                </p>
              </div>
            </div>

            {dueRemaining > 0 ? (
              <span className="badge badge-xs sm:badge-sm bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs">
                متبقي {dueRemaining}
              </span>
            ) : dueCompleted > 0 ? (
              <span className="badge badge-xs sm:badge-sm bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs">
                مكتمل اليوم ✓
              </span>
            ) : null}
          </div>

          {/* Content */}
          <div className="mt-3">
            {activeReviewHadithCount > 0 ? (
              <div className="bg-base-200/60 dark:bg-slate-800/70 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 border border-base-300/60 dark:border-slate-700 shadow-xs">
                <div className="min-w-0 text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <h3 className="font-bold text-xs sm:text-sm text-base-content truncate">
                      {activeReviewBookTitle}
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-base-content/60 mt-0.5 font-normal font-mono">
                    {activeReviewHadithCount === 1
                      ? "حديث واحد مستحق للمراجعة"
                      : `${activeReviewHadithCount} أحاديث مستحقة للمراجعة اليوم`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartReview}
                  className="btn btn-xs sm:btn-sm bg-cyan-700 hover:bg-cyan-800 text-white font-2 border-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                >
                  ابدأ المراجعة
                </button>
              </div>
            ) : dueCompleted > 0 ? (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-3 sm:p-3.5 flex items-center gap-2.5 border border-emerald-200/60 dark:border-emerald-900/60">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-lg shrink-0">
                  <HiOutlineCheckCircle className="text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                    أحسنت! أتممت جميع مراجعات اليوم 🎉
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">
                    تمت مراجعة {dueCompleted} أحاديث بنجاح
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-base-200/40 dark:bg-slate-800/40 rounded-xl p-3.5 text-center border border-dashed border-base-300 dark:border-slate-800">
                <HiOutlineBookOpen className="text-xl text-base-content/40 mx-auto mb-1" />
                <p className="text-xs font-bold text-base-content/80">
                  لا توجد مراجعات مستحقة اليوم 🌿
                </p>
                <p className="text-[10px] text-base-content/60 mt-0.5">
                  جميع محفوظاتك الحالية مراجَعة ومثبتة
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info link */}
        <div className="mt-2.5 pt-2 border-t border-base-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-base-content/60">
          <span>إدارة خطة المراجعة</span>
          <button
            type="button"
            onClick={() => navigate("/plan")}
            className="text-cyan-700 dark:text-cyan-400 hover:underline font-bold cursor-pointer"
          >
            عرض الخطة ←
          </button>
        </div>
      </div>


      {/* ── 2. مهام اليوم (Today's Tasks) ── */}
      <div className="bg-base-100 dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-base-200 dark:border-slate-800 shadow-sm p-4 sm:p-4.5 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-base-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-700 dark:text-cyan-400 text-lg shrink-0 shadow-xs border border-cyan-700/20">
                <BiNotepad />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold font-1 text-base-content leading-tight">
                  مهام اليوم
                </h2>
                <p className="text-[10px] sm:text-[11px] text-base-content/60 font-normal">
                  أهدافك اليومية للحفظ والمراجعة
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/80 dark:border-cyan-800/80 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold text-cyan-800 dark:text-cyan-300">
              <HiOutlineSparkles className="text-[10px]" />
              <span>المكتمل: {(isNewDone ? 1 : 0) + (isRevDone ? 1 : 0)} / 2</span>
            </div>
          </div>

          {/* Tasks List */}
          <div className="mt-3 space-y-2.5">

            {/* المهمة 1: حفظ الأحاديث الجديدة */}
            <div
              className={`rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-3 border transition-all duration-300 ${
                isNewDone
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/80 shadow-xs"
                  : "bg-base-200/60 dark:bg-slate-800/70 border-base-300/60 dark:border-slate-700 hover:border-cyan-400 dark:hover:border-cyan-700 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Expressive Feature Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all ${
                    isNewDone
                      ? "bg-emerald-500 text-white shadow-xs shadow-emerald-500/30"
                      : "bg-cyan-700/10 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-700/20"
                  }`}
                >
                  {isNewDone ? (
                    <HiCheck className="text-base stroke-[3]" />
                  ) : (
                    <HiOutlineBookOpen className="text-base" />
                  )}
                </div>

                {/* Task Details & Progress Track */}
                <div className="text-right flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isNewDone
                          ? "text-emerald-900 dark:text-emerald-200"
                          : "text-base-content"
                      }`}
                    >
                      {newTarget === 1 ? "حفظ حديث جديد" : `حفظ ${newTarget} أحاديث جديدة`}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold text-base-content/60 shrink-0">
                      {newCompleted} / {newTarget}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-base-300/50 dark:bg-slate-700/60 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isNewDone
                          ? "bg-emerald-500"
                          : "bg-gradient-to-l from-cyan-600 to-teal-400"
                      }`}
                      style={{ width: `${newPercent}%` }}
                    />
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-base-content/60 mt-0.5 font-medium">
                    {isNewDone
                      ? "اكتمل هدف الحفظ اليومي بنجاح 🎉"
                      : newCompleted > 0
                      ? `تم حفظ ${newCompleted} من أصل ${newTarget}`
                      : `مستهدف اليوم: حفظ ${newTarget} أحاديث`}
                  </p>
                </div>
              </div>

              {/* Action Button / Completed Badge */}
              <div className="shrink-0">
                {isNewDone ? (
                  <span className="badge badge-xs sm:badge-sm bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 px-2 py-1 rounded-lg text-[10px] sm:text-xs flex items-center gap-1 shadow-xs">
                    <HiCheck className="text-xs stroke-[3]" />
                    <span>مكتمل</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartMemorize}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-2 text-xs font-bold flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                    title="بدء الحفظ"
                  >
                    <span>{newCompleted > 0 ? "متابعة" : "ابدأ"}</span>
                    <FaPlay className="text-[9px] ml-0.5" />
                  </button>
                )}
              </div>
            </div>


            {/* المهمة 2: مراجعة الأحاديث المقررة */}
            <div
              className={`rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-3 border transition-all duration-300 ${
                isRevDone
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/80 shadow-xs"
                  : "bg-base-200/60 dark:bg-slate-800/70 border-base-300/60 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-700 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Expressive Feature Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all ${
                    isRevDone
                      ? "bg-emerald-500 text-white shadow-xs shadow-emerald-500/30"
                      : "bg-amber-500/10 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {isRevDone ? (
                    <HiCheck className="text-base stroke-[3]" />
                  ) : (
                    <HiOutlineArrowPath className="text-base" />
                  )}
                </div>

                {/* Task Details & Progress Track */}
                <div className="text-right flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isRevDone
                          ? "text-emerald-900 dark:text-emerald-200"
                          : "text-base-content"
                      }`}
                    >
                      {revTarget === 1 ? "مراجعة حديث واحد" : `مراجعة ${revTarget} أحاديث`}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold text-base-content/60 shrink-0">
                      {revCompleted} / {revTarget}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-base-300/50 dark:bg-slate-700/60 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isRevDone
                          ? "bg-emerald-500"
                          : "bg-gradient-to-l from-amber-500 to-orange-400"
                      }`}
                      style={{ width: `${revPercent}%` }}
                    />
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-base-content/60 mt-0.5 font-medium">
                    {isRevDone
                      ? "اكتمل هدف المراجعة اليومي بنجاح 🎉"
                      : revCompleted > 0
                      ? `تمت مراجعة ${revCompleted} من أصل ${revTarget}`
                      : `مستهدف اليوم: مراجعة ${revTarget} أحاديث`}
                  </p>
                </div>
              </div>

              {/* Action Button / Completed Badge */}
              <div className="shrink-0">
                {isRevDone ? (
                  <span className="badge badge-xs sm:badge-sm bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 px-2 py-1 rounded-lg text-[10px] sm:text-xs flex items-center gap-1 shadow-xs">
                    <HiCheck className="text-xs stroke-[3]" />
                    <span>مكتمل</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartReview}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-2 text-xs font-bold flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                    title="بدء المراجعة"
                  >
                    <span>{revCompleted > 0 ? "متابعة" : "ابدأ"}</span>
                    <FaPlay className="text-[9px] ml-0.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer info link */}
        <div className="mt-2.5 pt-2 border-t border-base-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-base-content/60">
          <span>تعديل المقدار اليومي</span>
          <button
            type="button"
            onClick={() => navigate("/plan")}
            className="text-cyan-700 dark:text-cyan-400 hover:underline font-bold cursor-pointer"
          >
            تعديل الخطة ←
          </button>
        </div>
      </div>

    </div>
  );
}
