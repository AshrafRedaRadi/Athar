import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowPath, HiOutlineArrowLeft, HiOutlineBookOpen } from "react-icons/hi2";
import { IoPlaySharp } from "react-icons/io5";

export default function RecentlyReviewed({ items = [], bookId = 1, onSelectHadith }) {
  const navigate = useNavigate();

  // Sort: Oldest review at TOP -> Latest / Newest review at BOTTOM (أحدث مراجعة في الأسفل)
  const hadiths = [...items].sort((a, b) => {
    const dateA = a.lastReviewedAtUtc || a.lastReviewedAt || 0;
    const dateB = b.lastReviewedAtUtc || b.lastReviewedAt || 0;
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
          <div className="flex items-center gap-2.5 text-base-content font-bold font-1 text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-xs">
              <HiOutlineArrowPath className="w-5 h-5 shrink-0" />
            </div>
            <span>آخر ما تمت مراجعته</span>
          </div>
          <span className="badge badge-sm bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200/60 dark:border-cyan-800/60 px-2 py-0.5 text-[11px]">
            {hadiths.length} حديث
          </span>
        </div>

        {/* Hadith List */}
        <div className="space-y-2.5 max-h-[260px] sm:max-h-[290px] overflow-y-auto pl-1 pr-0.5 [scrollbar-width:thin]">
          {hadiths.length === 0 ? (
            <div className="py-10 text-center px-4 bg-base-200/20 dark:bg-slate-800/30 rounded-2xl border border-dashed border-base-300 dark:border-slate-800">
              <HiOutlineBookOpen className="text-3xl text-cyan-500 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-bold text-base-content">لم تتم مراجعة أي أحاديث بعد</p>
              <p className="text-[11px] text-base-content/60 mt-1">الأحاديث التي تقوم بمراجعتها ستظهر هنا لتثبيتها واستذكارها</p>
            </div>
          ) : (
            hadiths.map((item, index) => {
              const hId = item.hadithId ?? item.id;
              return (
                <div
                  key={hId || index}
                  onClick={() => handleOpenStudy(item)}
                  className="group p-3 sm:p-3.5 bg-base-100 dark:bg-slate-800/80 hover:bg-cyan-50/70 dark:hover:bg-cyan-950/40 rounded-2xl border border-base-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_14px_rgba(8,145,178,0.14)]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold font-mono text-xs flex items-center justify-center shrink-0 border border-cyan-500/20 shadow-xs">
                      {item.order || hId}
                    </div>
                    <div className="text-right truncate">
                      <h4 className="font-bold text-xs sm:text-sm text-base-content group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors truncate">
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
                    className="px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-700 hover:text-white dark:bg-cyan-950/60 dark:hover:bg-cyan-600 dark:hover:text-white text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all duration-200 shadow-xs active:scale-95"
                    title="مراجعة الحديث"
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
        <span>إجمالي ما روجع:</span>
        <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono text-sm">
          {hadiths.length} أحاديث
        </span>
      </div>
    </div>
  );
}
