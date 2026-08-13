import { useState, useEffect } from "react";
import Navbar from "../components/shared/Navbar";
import Stat from "../components/home/Stat";
import Progress from "../components/home/Progress";
import Tasks from "../components/home/Tasks";
import { useAuth } from "../context/AuthContext";
import { dashboardService } from "../services/dashboardService";
import { hadithsService } from "../services/hadithsService";
import { activityService, computeCurrentStreak } from "../services/activityService";

function Home() {
  const { isAuthenticated } = useAuth();

  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);
  const [realMemorizedCount, setRealMemorizedCount] = useState(null);

  useEffect(() => {
    async function loadDashboardSummary() {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 1-indexed

        // Fetch dashboard summary and activity calendar in parallel
        const [data, calendarResult] = await Promise.all([
          dashboardService.getSummary(),
          activityService.getCalendar(year, month),
        ]);

        console.log("🏠 [Home Component Dashboard Summary Data]:", data);
        setSummaryData(data);
        setCalendarDays(calendarResult);
      } catch (err) {
        console.warn("Could not fetch dashboard summary from API:", err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardSummary();
  }, [isAuthenticated]);

  // Fetch real status-2 (fully memorized) hadith count once the last book is known
  useEffect(() => {
    if (!summaryData) return;
    const unwrap = (d) =>
      d?.data && typeof d.data === "object" && !Array.isArray(d.data) ? d.data : d;
    const sd = unwrap(summaryData);
    const book =
      sd?.lastOpenedBook ||
      sd?.lastBook ||
      sd?.book ||
      summaryData?.lastOpenedBook ||
      summaryData?.lastBook ||
      null;
    const bookId = book?.id ?? book?.bookId ?? sd?.currentBookId ?? sd?.bookId ?? null;
    if (!bookId) return;

    hadithsService
      .getHadithProgress(bookId)
      .then((progressList) => {
        if (!Array.isArray(progressList)) return;
        const count = progressList.filter(
          (p) => (p.status ?? p.Status ?? p.progressStatus ?? p.ProgressStatus) === 2
        ).length;
        setRealMemorizedCount(count);
      })
      .catch((err) => {
        console.warn("Could not fetch hadith progress list:", err.message);
      });
  }, [summaryData]);

  // Helper for case-insensitive property lookup across multiple objects
  const getProp = (obj, ...keys) => {
    if (!obj || typeof obj !== "object") return undefined;
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) return obj[key];
      const lowerKey = key.toLowerCase();
      const foundKey = Object.keys(obj).find((k) => k.toLowerCase() === lowerKey);
      if (foundKey && obj[foundKey] !== undefined && obj[foundKey] !== null) {
        return obj[foundKey];
      }
    }
    return undefined;
  };

  // Unwrap summaryData if data property exists
  const actualData =
    summaryData?.data && typeof summaryData.data === "object" && !Array.isArray(summaryData.data)
      ? summaryData.data
      : summaryData;

  const overallProgress =
    getProp(actualData, "overallProgress", "progress", "overall") ||
    getProp(summaryData, "overallProgress", "progress", "overall") ||
    null;

  const lastOpenedBook =
    getProp(actualData, "lastOpenedBook", "lastBook", "book") ||
    getProp(summaryData, "lastOpenedBook", "lastBook", "book") ||
    null;

  const memorizedHadithCount =
    getProp(overallProgress, "memorizedHadithCount", "memorizedHadithsCount", "totalMemorizedHadiths", "memorizedCount", "totalMemorized") ??
    getProp(actualData, "memorizedHadithCount", "memorizedHadithsCount", "totalMemorizedHadiths", "memorizedCount", "totalMemorized") ??
    getProp(summaryData, "memorizedHadithCount", "memorizedHadithsCount", "totalMemorizedHadiths", "memorizedCount", "totalMemorized") ??
    getProp(lastOpenedBook, "memorizedHadithCount", "memorizedHadithsCount", "memorizedCount", "hadithCount") ??
    0;

  const rawProgress =
    getProp(overallProgress, "percentage", "progressPercentage", "progressRatio", "progress", "completionPercentage") ??
    getProp(lastOpenedBook, "percentage", "progressPercentage", "progressRatio", "progress", "completionPercentage") ??
    getProp(actualData, "progressPercentage", "progress", "percentage") ??
    getProp(summaryData, "progressPercentage", "progress") ??
    0;

  const progressPercentage = Math.min(Math.max(Number(rawProgress) || 0, 0), 100);

  const inProgressHadithCount =
    getProp(overallProgress, "inProgressHadithCount", "inProgressCount", "inProgressHadithsCount", "inProgressHadiths") ??
    getProp(actualData, "inProgressHadithCount", "inProgressCount", "inProgressHadithsCount", "inProgressHadiths") ??
    getProp(summaryData?.data, "inProgressHadithCount", "inProgressCount") ??
    getProp(summaryData, "inProgressHadithCount", "inProgressCount") ??
    getProp(lastOpenedBook, "inProgressHadithCount", "inProgressCount") ??
    0;

  const daysStreak =
    calendarDays && typeof calendarDays.currentStreak === "number"
      ? calendarDays.currentStreak
      : computeCurrentStreak(calendarDays?.dates ?? calendarDays ?? []);

  const accuracyRate =
    getProp(actualData, "accuracyRate", "accuracyPercentage", "accuracy", "rate") ??
    getProp(summaryData, "accuracyRate", "accuracy") ??
    0;

  const currentBookTitle =
    getProp(lastOpenedBook, "title", "name", "bookTitle") ??
    getProp(actualData, "currentBookTitle", "title", "name") ??
    getProp(summaryData, "currentBookTitle", "title") ??
    "لم يتم فتح أي كتاب بعد";

  const currentBookId =
    getProp(lastOpenedBook, "id", "bookId") ??
    getProp(actualData, "currentBookId", "bookId", "id") ??
    null;

  const resumeHadithId =
    getProp(lastOpenedBook, "resumeHadithId", "lastHadithId", "lastOpenedHadithId", "hadithId") ??
    getProp(actualData, "resumeHadithId", "lastHadithId", "lastOpenedHadithId") ??
    null;

  const resumeSectionId =
    getProp(lastOpenedBook, "resumeSectionId", "lastSectionId", "lastOpenedSectionId", "sectionId") ??
    getProp(actualData, "resumeSectionId", "lastSectionId", "sectionId") ??
    0;

  const totalHadiths =
    getProp(overallProgress, "totalHadithCount", "totalHadithsCount", "totalHadiths", "hadithsCount", "hadithCount") ??
    getProp(actualData, "totalHadithCount", "totalHadithsCount", "totalHadiths", "hadithsCount", "hadithCount") ??
    getProp(summaryData?.data, "totalHadithCount", "totalHadithsCount") ??
    getProp(summaryData, "totalHadithCount", "totalHadithsCount") ??
    getProp(lastOpenedBook, "totalHadithCount", "totalHadiths", "hadithsCount") ??
    40;

  return (
    <div className="min-h-screen bg-base-200">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        {/* Unified Navbar */}
        <Navbar activePage="home" />

        {/* ── Authenticated User Main Home Content ── */}
        {isLoading ? (
          <div className="space-y-6 mt-8 animate-pulse">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
              <div className="h-24 bg-base-100 rounded-2xl" />
              <div className="h-24 bg-base-100 rounded-2xl" />
              <div className="h-24 bg-base-100 rounded-2xl" />
            </div>
            <div className="h-32 bg-base-100 rounded-2xl" />
            <div className="h-44 bg-base-100 rounded-2xl" />
          </div>
        ) : (
          <>
            <Stat
              days={daysStreak}
              hadith={realMemorizedCount ?? memorizedHadithCount}
              inProgressHadithCount={inProgressHadithCount}
              accuracy={accuracyRate}
            />
            <Progress
              title={currentBookTitle}
              progress={progressPercentage}
              bookId={currentBookId}
              inProgressHadithCount={inProgressHadithCount}
              memorizedHadithCount={realMemorizedCount ?? memorizedHadithCount}
              totalHadiths={totalHadiths}
              resumeHadithId={resumeHadithId}
              resumeSectionId={resumeSectionId}
            />
            <Tasks summary={summaryData} />
          </>
        )}
      </main>
    </div>
  );
}

export default Home;