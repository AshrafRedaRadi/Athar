import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCalendarDays, HiOutlineArrowLeft, HiOutlineBookOpen, HiOutlineCheckCircle } from "react-icons/hi2";
import { IoPlaySharp } from "react-icons/io5";

export default function DueReviewsToday({ dueReviews, bookId = 1, onSelectHadith }) {
  const navigate = useNavigate();

  const target = dueReviews?.target ?? 0;
  const completed = dueReviews?.completed ?? 0;
  const remaining = dueReviews?.remaining ?? Math.max(0, target - completed);
  const rawCandidates = Array.isArray(dueReviews?.candidates) ? dueReviews.candidates : [];

  // Sort candidates: Oldest reviewed at TOP -> Most recently reviewed at BOTTOM
  const candidates = [...rawCandidates].sort((a, b) => {
    const dateA = a.lastReviewedAtUtc || a.lastReviewedAt || a.memorizedAtUtc || 0;
    const dateB = b.lastReviewedAtUtc || b.lastReviewedAt || b.memorizedAtUtc || 0;
    if (dateA && dateB) {
      return new Date(dateA) - new Date(dateB);
    }
    return (a.hadithId || a.id || 0) - (b.hadithId || b.id || 0);
  });

  const handleOpenStudy = (item) => {
    const hId = item.hadithId ?? item.id;
    if (onSelectHadith) {
      onSelectHadith(item);
    } else {
      navigate(`/library/${item.bookId || bookId || 1}/${item.sectionId || 0}/${hId}`);
    }
  };

  return (
    <div className="bg-base-100 dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-base-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 w-full h-full flex flex-col justify-between space-y-4 font-2" dir="rtl">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-base-200/70 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-base-content font-bold font-1 text-base sm:text-lg min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs shrink-0">
              <HiOutlineCalendarDays className="w-5 h-5 shrink-0" />
            </div>
            <span className="truncate">ما يجب مراجعته اليوم</span>
          </div>
          <span className="badge badge-sm bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200/60 dark:border-amber-800/60 px-2.5 py-1 text-[11px] whitespace-nowrap shrink-0 inline-flex items-center gap-1">
            {remaining === 0 ? "اكتمل الورد اليومي" : `متبقي ${remaining}`}
          </span>
        </div>

        {/* Hadith List */}
        <div className="space-y-2.5 max-h-[260px] sm:max-h-[290px] overflow-y-auto pl-1 pr-0.5 [scrollbar-width:thin]">
          {candidates.length === 0 ? (
            <div className="py-10 text-center px-4 bg-base-200/20 dark:bg-slate-800/30 rounded-2xl border border-dashed border-base-300 dark:border-slate-800">
              {completed >= target && target > 0 ? (
                <>
                  <HiOutlineCheckCircle className="text-3xl text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold text-base-content">أحسنت! أتممت مراجعات اليوم كاملة 🎉</p>
                  <p className="text-[11px] text-base-content/60 mt-1">يمكنك الاستمرار في المراجعة الإضافية من قائمة آخر ما تمت مراجعته</p>
                </>
              ) : (
                <>
                  <HiOutlineBookOpen className="text-3xl text-amber-500 mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-bold text-base-content">لا توجد مراجعات مستحقة اليوم</p>
                  <p className="text-[11px] text-base-content/60 mt-1">الأحاديث المستحقة للمراجعة وفق خطتك ستظهر هنا تلقائياً</p>
                </>
              )}
            </div>
          ) : (
            candidates.map((item, index) => {
              const hId = item.hadithId ?? item.id;
              return (
                <div
                  key={hId || index}
                  onClick={() => handleOpenStudy(item)}
                  className="group p-3 sm:p-3.5 bg-base-100 dark:bg-slate-800/80 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 rounded-2xl border border-base-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_14px_rgba(245,158,11,0.14)]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold font-mono text-xs flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
                      {item.order || hId}
                    </div>
                    <div className="text-right truncate">
                      <h4 className="font-bold text-xs sm:text-sm text-base-content group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">
                        {item.title || item.hadithNumber || `الحديث ${hId}`}
                      </h4>
                      {item.bookTitle && (
                        <p className="text-[11px] text-base-content/70 truncate mt-0.5 font-medium">
                          {item.bookTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenStudy(item);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-600 hover:text-white dark:bg-amber-950/60 dark:hover:bg-amber-600 dark:hover:text-white text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all duration-200 shadow-xs active:scale-95"
                    title="بدء مراجعة الحديث"
                  >
                    <IoPlaySharp className="text-xs shrink-0" />
                    <span className="hidden sm:inline">مراجعة</span>
                    <HiOutlineArrowLeft className="text-xs group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-base-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-base-content/70">
        <span>إنجاز مراجعات اليوم:</span>
        <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-sm">
          {completed} / {target} أحاديث
        </span>
      </div>
    </div>
  );
}