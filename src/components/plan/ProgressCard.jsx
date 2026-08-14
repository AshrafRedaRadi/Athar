import React, { useState, useEffect } from 'react';
import { booksService } from '../../services/booksService';
import { hadithsService } from '../../services/hadithsService';
import { activityService, computeCurrentStreak } from '../../services/activityService';
import { dashboardService } from '../../services/dashboardService';

const ProgressCard = (props) => {
  const [data, setData] = useState({
    title: props.title || "مسار الأربعون النووية",
    completedCount: props.completedCount ?? 0,
    totalCount: props.totalCount ?? 42,
    percentage: props.percentage ?? 0,
    streakDaysCount: props.streakDaysCount ?? 0,
  });
  const [isLoading, setIsLoading] = useState(!props.title);

  useEffect(() => {
    // If props are passed explicitly, respect them
    if (props.title && props.completedCount !== undefined) {
      setData({
        title: props.title,
        completedCount: props.completedCount,
        totalCount: props.totalCount || 42,
        percentage: props.percentage ?? Math.round((props.completedCount / (props.totalCount || 42)) * 100),
        streakDaysCount: props.streakDaysCount ?? 0,
      });
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadBackendMetrics() {
      try {
        setIsLoading(true);
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        // Fetch books, progress, activity and dashboard summary concurrently
        const [books, calendarData, summaryData] = await Promise.all([
          booksService.getBooks().catch(() => []),
          activityService.getCalendar(year, month).catch(() => ({ dates: [], currentStreak: null })),
          dashboardService.getSummary().catch(() => null),
        ]);

        const activeBook = books[0] || { id: 1, title: "الأربعون النووية", hadithCount: 42 };
        const activeBookId = activeBook.id || 1;

        const [hadithsList, progressList] = await Promise.all([
          hadithsService.getHadithsByBook(activeBookId).catch(() => []),
          hadithsService.getHadithProgress(activeBookId).catch(() => []),
        ]);

        // Calculate memorized count
        let memorizedCount = 0;
        if (Array.isArray(progressList)) {
          memorizedCount = progressList.filter(
            (p) => p.status === 2 || p.status === "Memorized" || p.isMemorized
          ).length;
        }

        // If dashboard summary has higher or direct memorized count, use it
        const summaryMemorized =
          summaryData?.data?.memorizedHadithCount ??
          summaryData?.memorizedHadithCount ??
          summaryData?.totalMemorized;

        if (summaryMemorized !== undefined && summaryMemorized > memorizedCount) {
          memorizedCount = summaryMemorized;
        }

        const totalHadiths = hadithsList.length > 0 ? hadithsList.length : (activeBook.hadithCount || 42);
        const calculatedPercentage = totalHadiths > 0 ? Math.min(100, Math.round((memorizedCount / totalHadiths) * 100)) : 0;

        // Calculate streak
        const streak =
          calendarData && typeof calendarData.currentStreak === "number"
            ? calendarData.currentStreak
            : computeCurrentStreak(calendarData?.dates ?? calendarData ?? []);

        if (isMounted) {
          setData({
            title: `مسار ${activeBook.title}`,
            completedCount: memorizedCount,
            totalCount: totalHadiths,
            percentage: calculatedPercentage,
            streakDaysCount: streak,
          });
        }
      } catch (err) {
        console.warn("Could not load progress card metrics from backend:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBackendMetrics();
    return () => {
      isMounted = false;
    };
  }, [props.title, props.completedCount, props.totalCount, props.percentage, props.streakDaysCount]);

  const completedText = props.completedText || "لقد أتممت حفظ";
  const itemType = props.itemType || "حديثاً";
  const totalText = props.totalText || "من أصل";
  const totalItemType = props.totalItemType || "حديث";
  const streakTitle = props.streakTitle || "سلسلة الاستمرار";
  const streakDaysText = props.streakDaysText || "أيام متتالية";

  const { title, completedCount, totalCount, percentage, streakDaysCount } = data;

  const radius = 70;
  const strokeWidth = 14;
  const size = (radius + strokeWidth) * 2;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  if (isLoading) {
    return (
      <div 
        className="bg-base-100 dark:bg-slate-900 p-6 sm:p-7 rounded-3xl shadow-sm border border-base-300 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 w-full mx-auto font-2 animate-pulse" 
        dir="ltr"
      >
        <div className="flex-1 space-y-4 text-center sm:text-right w-full">
          <div className="h-6 w-48 bg-base-300 dark:bg-slate-800 rounded-lg mx-auto sm:mr-0" />
          <div className="h-4 w-64 bg-base-200 dark:bg-slate-800/60 rounded-md mx-auto sm:mr-0" />
          <div className="h-12 w-44 bg-base-200 dark:bg-slate-800 rounded-xl mx-auto sm:mr-0" />
        </div>
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-base-200 dark:bg-slate-800 shrink-0" />
      </div>
    );
  }

  return (
    <div 
      className="bg-base-100 dark:bg-slate-900 p-4 sm:p-6 rounded-3xl shadow-sm border border-base-300 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 w-full mx-auto font-2 transition-all duration-300" 
      dir="ltr"
    >
      <div className="flex-1 space-y-4 text-center sm:text-right w-full">
        <h2 className="text-lg sm:text-xl font-bold font-1 text-base-content leading-tight">
          {title}
        </h2>

        <p className="text-xs sm:text-sm font-2 text-base-content/70">
          {completedText} <span className="font-bold text-cyan-700 dark:text-cyan-400 font-mono text-sm sm:text-base">{completedCount}</span> {itemType} {totalText} <span className="font-bold font-mono text-sm sm:text-base">{totalCount}</span> {totalItemType}
        </p>
        
        <div className="inline-flex items-center justify-center sm:justify-start gap-3 bg-base-200/70 dark:bg-slate-800/80 border border-base-300/80 dark:border-slate-700 px-4 py-2.5 sm:py-3 rounded-2xl w-full sm:w-auto shadow-xs">
          <div className="bg-[#FDAF61] p-2.5 sm:p-3 rounded-full flex items-center justify-center shrink-0 shadow-xs">
            <span role="img" aria-label="streak" className="text-white text-base sm:text-lg leading-none">
              🔥
            </span>
          </div>
          
          <div className="flex flex-col text-xs sm:text-sm text-base-content text-right">
            <span className="text-base-content/70 font-medium">{streakTitle}</span>
            <span className="font-bold text-sm sm:text-base font-mono" dir='rtl' >
              {streakDaysCount} {streakDaysText} 
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center shrink-0 w-28 h-28 sm:w-36 sm:h-36">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full -rotate-90"
        >
          {/* the background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-base-200/50 dark:fill-slate-800/50"
          />

          {/* background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none stroke-cyan-100/80 dark:stroke-cyan-950/80"
            strokeWidth={strokeWidth}
          />

          {/* progress stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none stroke-cyan-600 dark:stroke-cyan-400 transition-all duration-700 ease-out"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
          />
        </svg>

        <span className="absolute text-xl sm:text-2xl font-bold font-mono text-cyan-700 dark:text-cyan-400 tracking-tight">
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default ProgressCard;