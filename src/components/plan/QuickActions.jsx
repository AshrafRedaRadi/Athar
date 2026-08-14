import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoFlashOutline, IoPlaySharp, IoBookOutline } from 'react-icons/io5';
import { booksService } from '../../services/booksService';
import { hadithsService } from '../../services/hadithsService';

const QuickActions = () => {
  const navigate = useNavigate();
  const [isNavigatingNew, setIsNavigatingNew] = useState(false);
  const [isNavigatingReview, setIsNavigatingReview] = useState(false);

  // 1. Action: بدء الحفظ (الانتقال إلى صفحة الفهرس)
  const handleStartMemorizing = async () => {
    try {
      setIsNavigatingNew(true);
      const books = await booksService.getBooks().catch(() => []);
      const activeBookId = books[0]?.id || 1;
      navigate(`/library/${activeBookId}/0`);
    } catch (err) {
      console.warn("Could not navigate to index page:", err);
      navigate("/library/1/0");
    } finally {
      setIsNavigatingNew(false);
    }
  };

  // 2. Action: بدء مراجعة (مراجعة الأحاديث المستحقة)
  const handleStartReview = async () => {
    try {
      setIsNavigatingReview(true);
      const books = await booksService.getBooks().catch(() => []);
      const activeBookId = books[0]?.id || 1;

      const [hadithsList, progressList] = await Promise.all([
        hadithsService.getHadithsByBook(activeBookId).catch(() => []),
        hadithsService.getHadithProgress(activeBookId).catch(() => []),
      ]);

      const progressMap = {};
      if (Array.isArray(progressList)) {
        progressList.forEach((p) => {
          const hId = p.hadithId ?? p.id;
          if (hId != null) progressMap[hId] = p;
        });
      }

      let localReviewHistory = {};
      try {
        localReviewHistory = JSON.parse(localStorage.getItem("athar_hadith_reviews") || "{}");
      } catch {}

      const memorizedHadiths = (hadithsList || []).filter((h) => {
        const p = progressMap[h.id];
        return p?.status === 2 || p?.status === "Memorized" || p?.isMemorized;
      });

      if (memorizedHadiths.length > 0) {
        // Sort to find the oldest reviewed hadith (due for review first)
        memorizedHadiths.sort((a, b) => {
          const timeA = progressMap[a.id]?.lastReviewedAt || localReviewHistory[a.id]?.lastReviewedAt || 0;
          const timeB = progressMap[b.id]?.lastReviewedAt || localReviewHistory[b.id]?.lastReviewedAt || 0;
          return new Date(timeA) - new Date(timeB);
        });

        const dueHadith = memorizedHadiths[0];
        navigate(`/library/${activeBookId}/${dueHadith.hadithSectionId || 0}/${dueHadith.id}`);
      } else {
        // If no hadiths memorized yet, start from first hadith
        const first = hadithsList[0];
        if (first) {
          navigate(`/library/${activeBookId}/${first.hadithSectionId || 0}/${first.id}`);
        } else {
          navigate(`/library/${activeBookId}/0`);
        }
      }
    } catch (err) {
      console.warn("Could not start review:", err);
      navigate("/library/1/0/1");
    } finally {
      setIsNavigatingReview(false);
    }
  };

  return (
    <div
      className="bg-base-100 dark:bg-slate-900 p-5 sm:p-6 rounded-3xl shadow-sm border border-base-300 dark:border-slate-800 w-full h-full flex flex-col justify-between space-y-4 font-2 transition-all duration-300"
      dir="rtl"
    >
      <div className="flex items-center justify-start gap-2.5 text-base-content font-bold font-1 text-base sm:text-lg mb-1">
        <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shadow-xs border border-cyan-700/20">
          <IoFlashOutline className="w-5 h-5" />
        </div>
        <h3>إجراءات سريعة</h3>
      </div>

      <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full my-auto">
        {/* Button 1: بدء الحفظ (الانتقال إلى صفحة الفهرس) */}
        <button
          onClick={handleStartMemorizing}
          disabled={isNavigatingNew || isNavigatingReview}
          className="flex-1 w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-3 px-5 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-70 text-sm sm:text-base"
        >
          {isNavigatingNew ? (
            <span className="loading loading-spinner loading-sm shrink-0" />
          ) : (
            <IoBookOutline className="text-lg shrink-0" />
          )}
          <span className="whitespace-nowrap">
            {isNavigatingNew ? "جاري التوجيه..." : "بدء الحفظ"}
          </span>
        </button>

        {/* Button 2: بدء مراجعة */}
        <button
          onClick={handleStartReview}
          disabled={isNavigatingNew || isNavigatingReview}
          className="flex-1 w-full bg-base-100 dark:bg-slate-900 !text-cyan-700 dark:!text-cyan-400 border-2 border-cyan-700/80 dark:border-cyan-500 hover:bg-cyan-700 hover:!text-white dark:hover:bg-cyan-600 dark:hover:!text-white font-bold py-3 px-5 rounded-2xl flex items-center justify-center gap-2.5 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-70 text-sm sm:text-base"
        >
          {isNavigatingReview ? (
            <span className="loading loading-spinner loading-sm shrink-0" />
          ) : (
            <IoPlaySharp className="text-base shrink-0" />
          )}
          <span className="whitespace-nowrap">
            {isNavigatingReview ? "جاري التوجيه..." : "بدء مراجعة"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;