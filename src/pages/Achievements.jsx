import React, { useState, useEffect } from "react";
import { FaFire, FaStar, FaTrophy, FaBookOpen, FaMicrophoneAlt, FaGraduationCap } from "react-icons/fa";
import { HiOutlineLockClosed, HiCheckBadge } from "react-icons/hi2";
import { RiMedalLine } from "react-icons/ri";
import { IoBookOutline, IoFlameOutline } from "react-icons/io5";
import { BsAwardFill } from "react-icons/bs";
import Navbar from "../components/shared/Navbar";
import StreakCalendar from "../components/achievements/StreakCalendar";
import { activityService, computeCurrentStreak } from "../services/activityService";
import { useAuth } from "../context/AuthContext";

// ---------------------------------------------------------------------------
// Icon resolver: maps iconKey strings from the API to React icon components.
// If iconKey looks like an SVG/image path, we render it as an <img>.
// Otherwise we try a key→component map, falling back to a default trophy.
// ---------------------------------------------------------------------------
const ICON_MAP = {
  fire:        FaFire,
  flame:       FaFire,
  book:        FaBookOpen,
  "book-open": FaBookOpen,
  books:       IoBookOutline,
  mic:         FaMicrophoneAlt,
  microphone:  FaMicrophoneAlt,
  medal:       RiMedalLine,
  badge:       HiCheckBadge,
  star:        FaStar,
  trophy:      FaTrophy,
  graduate:    FaGraduationCap,
  award:       BsAwardFill,
};

function BadgeIcon({ iconKey, color, isUnlocked }) {
  if (!isUnlocked) {
    return (
      <div className="w-24 h-24 rounded-full border-2 border-dashed border-base-300 bg-base-200/50 flex items-center justify-center text-base-content/40">
        <HiOutlineLockClosed className="text-3xl" />
      </div>
    );
  }

  const bgColor = color || "#4A90A4";

  // If iconKey looks like a URL / relative path, render as image
  if (iconKey && (iconKey.startsWith("/") || iconKey.startsWith("http") || iconKey.endsWith(".svg") || iconKey.endsWith(".png"))) {
    return (
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        <img
          src={iconKey}
          alt="badge icon"
          className="w-14 h-14 object-contain"
          onError={(e) => {
            // Fallback to default trophy if SVG/image fails to load
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "block";
          }}
        />
        <FaTrophy className="text-white text-3xl hidden" />
      </div>
    );
  }

  // Try the key map, fall back to FaTrophy
  const key     = (iconKey || "").toLowerCase();
  const IconCmp = ICON_MAP[key] || FaTrophy;

  return (
    <div
      className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
      style={{
        backgroundColor: bgColor,
        boxShadow: `0 8px 24px ${bgColor}40`,
      }}
    >
      <IconCmp className="text-white text-4xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single badge card
// ---------------------------------------------------------------------------
function BadgeCard({ badge }) {
  const {
    title,
    description,
    iconKey,
    colorHex,
    isUnlocked,
    progressPercentage = 0,
    currentProgress,
    targetProgress,
  } = badge;

  const pct = Math.min(Math.max(Number(progressPercentage) || 0, 0), 100);

  return (
    <div className="flex flex-col items-center text-center group transition-transform hover:-translate-y-1">
      {/* Badge Icon Circle */}
      <div className="relative mb-3">
        <BadgeIcon iconKey={iconKey} color={colorHex} isUnlocked={isUnlocked} />

        {/* Unlocked checkmark overlay */}
        {isUnlocked && (
          <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm border-2 border-base-100">
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      {/* Badge Title */}
      <h3 className="font-bold text-base md:text-lg text-base-content mb-1 leading-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs text-base-content/55 mb-2 leading-snug max-w-[120px]">
        {description}
      </p>

      {/* Status pill for unlocked */}
      {isUnlocked && (
        <span className="px-4 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">
          مكتمل ✓
        </span>
      )}

      {/* Mini progress bar for locked badges */}
      {!isUnlocked && (
        <div className="w-full max-w-[110px]">
          <div className="flex justify-between text-[10px] text-base-content/40 mb-1">
            <span>{Math.round(pct)}%</span>
            {currentProgress !== undefined && targetProgress !== undefined && (
              <span>{currentProgress}/{targetProgress}</span>
            )}
          </div>
          <div className="w-full h-1.5 bg-base-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-base-content/30 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Achievements Page
// ---------------------------------------------------------------------------
function Achievements() {
  const { isAuthenticated, isGuest } = useAuth();

  const [activeDays, setActiveDays]   = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const [badges, setBadges]             = useState([]);
  const [badgesLoading, setBadgesLoading] = useState(false);

  // Fetch calendar + achievements on mount
  useEffect(() => {
    if (isGuest || !isAuthenticated) return;

    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;

    setCalendarLoading(true);
    activityService
      .getCalendar(year, month)
      .then((days) => setActiveDays(days))
      .finally(() => setCalendarLoading(false));

    setBadgesLoading(true);
    activityService
      .getAchievements()
      .then((data) => setBadges(data))
      .finally(() => setBadgesLoading(false));
  }, [isAuthenticated, isGuest]);

  // Derived streak metrics
  const currentStreak  = computeCurrentStreak(activeDays);
  const now            = new Date();
  const daysInMonth    = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const checkedInCount = activeDays.filter((d) => {
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return d.startsWith(prefix);
  }).length;

  return (
    <div dir="rtl" className="min-h-screen bg-base-100 text-base-content p-4 md:p-8 font-2 pb-24 lg:pb-8">
      {/* Top Navbar */}
      <Navbar activePage="achievements" />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto space-y-8 mt-4">
        {/* Page Header */}
        <header className="text-start space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold font-1 text-cyan-800">
            إنجازاتك
          </h1>
          <p className="text-sm md:text-base text-base-content/60 font-normal">
            تابع تقدمك وحافظ على استمرارية التعلم
          </p>
        </header>

        {/* Top Section Grid (Streak Calendar & Days Streak Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Calendar Component (8 cols on lg) */}
          <div className="lg:col-span-8 h-full">
            <StreakCalendar activeDays={activeDays} isLoading={calendarLoading} />
          </div>

          {/* Days Streak & Monthly Progress Card (4 cols on lg) */}
          <div className="lg:col-span-4 bg-gradient-to-l from-orange-50/40 via-base-100 to-base-100 border border-base-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full min-h-[280px]">
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-full bg-orange-100/80 border border-orange-200/50 flex items-center justify-center shrink-0 shadow-inner">
                  <FaFire className="text-xl text-orange-500" />
                </div>
                <div className="text-end">
                  <h2 className="text-xl font-bold font-1 text-base-content">سلسلة الأيام</h2>
                  <p className="text-xs text-base-content/60 mt-0.5">
                    {currentStreak > 0 ? "أنت على خطى ثابتة!" : "ابدأ سلسلتك اليوم!"}
                  </p>
                </div>
              </div>

              <div className="text-start mt-6">
                {calendarLoading ? (
                  <div className="h-12 w-32 bg-base-300/60 rounded-xl animate-pulse" />
                ) : (
                  <>
                    <span className="text-4xl md:text-5xl font-bold font-1 text-base-content tracking-tight">
                      {currentStreak}
                    </span>
                    <span className="text-lg font-bold font-1 text-base-content mr-2">
                      يوم متواصل
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="mt-6 pt-4 border-t border-base-200/60">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-base-content/50">
                  {calendarLoading ? "..." : `${checkedInCount} / ${daysInMonth}`}
                </span>
                <span className="font-semibold text-base-content/60">أيام الحضور هذا الشهر</span>
              </div>
              <div className="w-full h-3 bg-base-200 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-orange-400 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: calendarLoading ? "0%" : `${Math.round((checkedInCount / daysInMonth) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section (الأوسمة) */}
        <section className="bg-base-100 border border-base-200 rounded-3xl p-6 md:p-8 shadow-sm">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs text-base-content/40 font-semibold">
              {badgesLoading ? "..." : `${badges.length} وسام`}
            </span>
            <h2 className="text-2xl font-bold font-1 text-base-content">الأوسمة</h2>
          </div>

          {/* Loading skeleton */}
          {badgesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                  <div className="w-24 h-24 rounded-full bg-base-300/60" />
                  <div className="h-4 w-20 bg-base-300/60 rounded-full" />
                  <div className="h-3 w-16 bg-base-300/40 rounded-full" />
                </div>
              ))}
            </div>
          ) : badges.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-12 text-base-content/40 gap-3">
              <BsAwardFill className="text-5xl opacity-30" />
              <p className="text-sm font-semibold">لا توجد أوسمة بعد، واصل التقدم!</p>
            </div>
          ) : (
            /* Badges Grid */
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {badges.map((badge) => (
                <BadgeCard key={badge.id ?? badge.code ?? badge.title} badge={badge} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Achievements;
