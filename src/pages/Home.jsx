import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoLogInOutline, IoPersonAddOutline, IoBookOutline, IoMicOutline, IoStatsChartOutline } from "react-icons/io5";
import { BsStars } from "react-icons/bs";
import Navbar from "../components/shared/Navbar";
import Stat from "../components/home/Stat";
import Progress from "../components/home/Progress";
import Tasks from "../components/home/Tasks";
import { useAuth } from "../context/AuthContext";
import { dashboardService } from "../services/dashboardService";
import { activityService, computeCurrentStreak } from "../services/activityService";

function Home() {
  const { isAuthenticated, isGuest, logout } = useAuth();
  const navigate = useNavigate();

  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    async function loadDashboardSummary() {
      if (isGuest || !isAuthenticated) return;

      try {
        setIsLoading(true);
        const now   = new Date();
        const year  = now.getFullYear();
        const month = now.getMonth() + 1; // 1-indexed

        // Fetch dashboard summary and activity calendar in parallel
        const [data, days] = await Promise.all([
          dashboardService.getSummary(),
          activityService.getCalendar(year, month),
        ]);

        console.log("🏠 [Home Component Dashboard Summary Data]:", data);
        setSummaryData(data);
        setCalendarDays(days);
      } catch (err) {
        console.warn("Could not fetch dashboard summary from API:", err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardSummary();
  }, [isAuthenticated, isGuest]);

  const handleLoginRedirect = () => {
    logout();
    navigate("/login");
  };

  const handleSignupRedirect = () => {
    navigate("/signup");
  };

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

  // Unwrap summaryData if data property exists (e.g. { data: { inProgressHadithCount, ... } })
  const actualData =
    summaryData?.data && typeof summaryData.data === "object" && !Array.isArray(summaryData.data)
      ? summaryData.data
      : summaryData;

  // Extract overallProgress object from summaryData API response
  const overallProgress =
    getProp(actualData, "overallProgress", "progress", "overall") ||
    getProp(summaryData, "overallProgress", "progress", "overall") ||
    null;

  // Extract lastOpenedBook object from summaryData API response
  const lastOpenedBook =
    getProp(actualData, "lastOpenedBook", "lastBook", "book") ||
    getProp(summaryData, "lastOpenedBook", "lastBook", "book") ||
    null;

  // Memorized hadith count from overallProgress, actualData, summaryData, or lastOpenedBook
  const memorizedHadithCount =
    getProp(overallProgress, "memorizedHadithCount", "memorizedHadithsCount", "totalMemorizedHadiths", "memorizedCount", "totalMemorized") ??
    getProp(actualData, "memorizedHadithCount", "memorizedHadithsCount", "totalMemorizedHadiths", "memorizedCount", "totalMemorized") ??
    getProp(summaryData, "memorizedHadithCount", "memorizedHadithsCount", "totalMemorizedHadiths", "memorizedCount", "totalMemorized") ??
    getProp(lastOpenedBook, "memorizedHadithCount", "memorizedHadithsCount", "memorizedCount", "hadithCount") ??
    0;

  // Progress percentage from overallProgress, lastOpenedBook, or actualData/summaryData
  const rawProgress =
    getProp(overallProgress, "percentage", "progressPercentage", "progressRatio", "progress", "completionPercentage") ??
    getProp(lastOpenedBook, "percentage", "progressPercentage", "progressRatio", "progress", "completionPercentage") ??
    getProp(actualData, "progressPercentage", "progress", "percentage") ??
    getProp(summaryData, "progressPercentage", "progress") ??
    0;

  const progressPercentage = Math.min(Math.max(Number(rawProgress) || 0, 0), 100);

  // Extract inProgressHadithCount directly from overallProgress -> inProgressHadithCount
  const inProgressHadithCount =
    getProp(overallProgress, "inProgressHadithCount", "inProgressCount", "inProgressHadithsCount", "inProgressHadiths") ??
    getProp(actualData, "inProgressHadithCount", "inProgressCount", "inProgressHadithsCount", "inProgressHadiths") ??
    getProp(summaryData?.data, "inProgressHadithCount", "inProgressCount") ??
    getProp(summaryData, "inProgressHadithCount", "inProgressCount") ??
    getProp(lastOpenedBook, "inProgressHadithCount", "inProgressCount") ??
    0;

  // Streak — computed from real calendar data (longest consecutive run including today)
  const daysStreak = computeCurrentStreak(calendarDays);
  const accuracyRate =
    getProp(actualData, "accuracyRate", "accuracyPercentage", "accuracy", "rate") ??
    getProp(summaryData, "accuracyRate", "accuracy") ??
    0;

  // Book title, ID, and total hadith count for "أكمل من حيث توقفت"
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

        {isGuest ? (
          /* ── Guest View ── */
          <div className="max-w-3xl mx-auto my-6 space-y-6">
            {/* Main Guest Banner Card */}
            <div className="card bg-gradient-to-br from-cyan-900/10 via-base-100 to-base-100 border border-cyan-700/20 shadow-lg p-6 sm:p-10 rounded-3xl text-center flex flex-col items-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl -z-0 pointer-events-none" />

              {/* Top Badge Icon */}
              <div className="w-16 h-16 rounded-2xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-3xl shadow-sm shrink-0">
                <BsStars />
              </div>

              {/* Title & Description */}
              <div className="space-y-2 max-w-xl">
                <h1 className="font-1 font-bold text-2xl sm:text-3xl text-base-content leading-tight">
                  أهلاً بك في منصة أثر 🌿
                </h1>
                <p className="font-2 text-sm sm:text-base text-base-content/75 leading-relaxed">
                  أنت تتصفح المنصة حالياً كـ <span className="font-semibold text-cyan-700 dark:text-cyan-400">ضيف</span>. سجّل دخولك لتستمتع بجميع المميزات وحفظ المتون وحساب تقدمك اليومي.
                </p>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full my-2 text-start font-2">
                <div className="bg-base-200/70 border border-base-300/60 p-4 rounded-2xl flex flex-col gap-1.5">
                  <IoBookOutline className="text-cyan-700 dark:text-cyan-400 text-2xl" />
                  <h3 className="font-bold text-xs sm:text-sm text-base-content">حفظ المتون والكتب</h3>
                  <p className="text-[11px] text-base-content/60">تصفح الأربعون النووية وصحيح البخاري وغيرها</p>
                </div>

                <div className="bg-base-200/70 border border-base-300/60 p-4 rounded-2xl flex flex-col gap-1.5">
                  <IoMicOutline className="text-cyan-700 dark:text-cyan-400 text-2xl" />
                  <h3 className="font-bold text-xs sm:text-sm text-base-content">التسميع الذكي</h3>
                  <p className="text-[11px] text-base-content/60">تصحيح تلقائي بالذكاء الاصطناعي أثناء التسميع</p>
                </div>

                <div className="bg-base-200/70 border border-base-300/60 p-4 rounded-2xl flex flex-col gap-1.5">
                  <IoStatsChartOutline className="text-cyan-700 dark:text-cyan-400 text-2xl" />
                  <h3 className="font-bold text-xs sm:text-sm text-base-content">متابعة الإحصائيات</h3>
                  <p className="text-[11px] text-base-content/60">قياس نسبة الدقة والالتزام اليومي بحفظ الأحاديث</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md font-2 pt-2">
                <button
                  onClick={handleLoginRedirect}
                  className="btn bg-cyan-700 hover:bg-cyan-800 text-white border-none rounded-xl w-full sm:w-auto px-8 flex items-center justify-center gap-2 shadow-md"
                >
                  <IoLogInOutline className="text-xl" />
                  <span>تسجيل الدخول</span>
                </button>

                <button
                  onClick={handleSignupRedirect}
                  className="btn btn-outline border-cyan-700 text-cyan-700 hover:bg-cyan-700 hover:text-white rounded-xl w-full sm:w-auto px-8 flex items-center justify-center gap-2"
                >
                  <IoPersonAddOutline className="text-lg" />
                  <span>إنشاء حساب جديد</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Authenticated User Main Home Content ── */
          <>
            {isLoading ? (
              <div className="space-y-6 mt-8 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  hadith={memorizedHadithCount}
                  inProgressHadithCount={inProgressHadithCount}
                  accuracy={accuracyRate}
                />
                <Progress
                  title={currentBookTitle}
                  progress={progressPercentage}
                  bookId={currentBookId}
                  inProgressHadithCount={inProgressHadithCount}
                  memorizedHadithCount={memorizedHadithCount}
                  totalHadiths={totalHadiths}
                  resumeHadithId={resumeHadithId}
                  resumeSectionId={resumeSectionId}
                />
                <Tasks summary={summaryData} />
              </>
            )}
          </>
        )}

        <br className="block md:hidden" />
        <br className="block md:hidden" />
      </main>
    </div>
  );
}

export default Home;