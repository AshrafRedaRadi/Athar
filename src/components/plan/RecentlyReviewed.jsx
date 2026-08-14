import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowPath, HiOutlineArrowLeft, HiOutlineBookOpen } from "react-icons/hi2";
import { IoPlaySharp } from "react-icons/io5";
import { hadithsService } from '../../services/hadithsService';
import { booksService } from '../../services/booksService';

export default function RecentlyReviewed({ onSelectHadith }) {
  const navigate = useNavigate();
  const [hadiths, setHadiths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        // 1. Fetch books to get active book id
        const books = await booksService.getBooks().catch(() => []);
        const activeBookId = books[0]?.id || 1;

        // 2. Fetch all hadiths and progress from backend API
        const [hadithsList, progressList] = await Promise.all([
          hadithsService.getHadithsByBook(activeBookId).catch(() => []),
          hadithsService.getHadithProgress(activeBookId).catch(() => []),
        ]);

        // Map progress by hadithId
        const progressMap = {};
        if (Array.isArray(progressList)) {
          progressList.forEach((p) => {
            const hId = p.hadithId ?? p.id;
            if (hId != null) {
              progressMap[hId] = p;
            }
          });
        }

        // Also check local review history
        let localReviewHistory = {};
        try {
          localReviewHistory = JSON.parse(localStorage.getItem("athar_hadith_reviews") || "{}");
        } catch {}

        // Filter hadiths:
        // Status === 2 (Memorized) AND reviewed at least once after memorization
        const reviewedHadiths = [];

        if (Array.isArray(hadithsList) && hadithsList.length > 0) {
          hadithsList.forEach((h) => {
            const p = progressMap[h.id];
            const isMemorized = p?.status === 2 || p?.status === "Memorized" || p?.isMemorized;
            const reviewCount = Number(p?.reviewCount ?? p?.timesReviewed ?? p?.repetitionCount ?? localReviewHistory[h.id]?.count ?? 0);
            const lastReviewed = p?.lastReviewedAt || localReviewHistory[h.id]?.lastReviewedAt;
            const hasBeenReviewed = reviewCount >= 1 || !!lastReviewed;

            if (isMemorized && hasBeenReviewed) {
              reviewedHadiths.push({
                ...h,
                bookId: activeBookId,
                sectionId: h.hadithSectionId || 0,
                reviewCount,
                lastReviewedAt: lastReviewed || p?.updatedAt || null,
              });
            }
          });
        }

        // Sort: OLDEST reviewed at TOP -> LATEST reviewed at BOTTOM (بحيث يكون اخر حديث راجعه من الأسفل)
        reviewedHadiths.sort((a, b) => {
          if (a.lastReviewedAt && b.lastReviewedAt) {
            return new Date(a.lastReviewedAt) - new Date(b.lastReviewedAt);
          }
          return (a.order || a.id) - (b.order || b.id);
        });

        if (isMounted) {
          setHadiths(reviewedHadiths);
        }
      } catch (err) {
        console.error("Error loading recently reviewed from backend:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenStudy = (item) => {
    if (onSelectHadith) {
      onSelectHadith(item);
    } else {
      navigate(`/library/${item.bookId || 1}/${item.sectionId || 0}/${item.id}`);
    }
  };

  return (
    <div className="bg-base-100 dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-base-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 w-full h-full flex flex-col justify-between space-y-4 font-2" dir="rtl">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-base-200/70 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-base-content font-bold font-1 text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shadow-xs">
              <HiOutlineArrowPath className="w-5 h-5 shrink-0" />
            </div>
            <span>آخر ما تمت مراجعته</span>
          </div>
          <span className="badge badge-sm bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200/60 dark:border-cyan-800/60 px-2 py-0.5 text-[11px]">
            المستحق أولاً
          </span>
        </div>

        {/* Hadith List (Oldest reviewed at top -> Newest reviewed at bottom) */}
        <div className="space-y-2.5 max-h-[260px] sm:max-h-[290px] overflow-y-auto pl-1 pr-0.5 [scrollbar-width:thin]">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-base-content/50">
              <span className="loading loading-spinner loading-md text-cyan-600"></span>
              <span className="text-xs">جاري تحميل سجل المراجعات من الخادم...</span>
            </div>
          ) : hadiths.length === 0 ? (
            <div className="py-10 text-center px-4 bg-base-200/20 dark:bg-slate-800/30 rounded-2xl border border-dashed border-base-300 dark:border-slate-800">
              <HiOutlineBookOpen className="text-3xl text-cyan-500 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-bold text-base-content">لا توجد أحاديث مراجعة بعد</p>
              <p className="text-[11px] text-base-content/60 mt-1">الأحاديث التي تُراجعها بعد الحفظ ستظهر هنا مرتبة حسب موعد مراجعتها</p>
            </div>
          ) : (
            hadiths.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => handleOpenStudy(item)}
                className="group p-3 sm:p-3.5 bg-base-100 dark:bg-slate-800/80 hover:bg-cyan-50/70 dark:hover:bg-cyan-950/40 rounded-2xl border border-base-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_14px_rgba(6,182,212,0.14)]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold font-mono text-xs flex items-center justify-center shrink-0 border border-cyan-500/20 shadow-xs">
                    {item.order || item.id}
                  </div>
                  <div className="text-right truncate">
                    <h4 className="font-bold text-xs sm:text-sm text-base-content group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors truncate">
                      {item.hadithNumber || item.title}
                    </h4>
                    {item.title && item.title !== item.hadithNumber && (
                      <p className="text-[11px] text-base-content/70 truncate mt-0.5 font-medium">
                        {item.title}
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
                  className="px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-700 hover:text-white dark:bg-cyan-950/60 dark:hover:bg-cyan-600 dark:hover:text-white text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all duration-200 shadow-xs active:scale-95"
                  title="بدء مراجعة الحديث"
                >
                  <IoPlaySharp className="text-xs shrink-0" />
                  <span className="hidden sm:inline">مراجعة</span>
                  <HiOutlineArrowLeft className="text-xs group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-base-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-base-content/70">
        <span>جاهز للمراجعة:</span>
        <span className="font-bold text-cyan-700 dark:text-cyan-400 font-mono text-sm">
          {hadiths.length} أحاديث
        </span>
      </div>
    </div>
  );
}
