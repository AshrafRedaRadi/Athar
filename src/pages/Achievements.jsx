import React from "react";
import { FaFire } from "react-icons/fa";
import { HiOutlineLockClosed, HiCheckBadge } from "react-icons/hi2";
import { RiMedalLine } from "react-icons/ri";
import Navbar from "../components/shared/Navbar";
import StreakCalendar from "../components/achievements/StreakCalendar";

/**
 * Achievements Page (إنجازاتك).
 * Displays user streak calendar, days streak counter, mutun memorization progress, and earned badges.
 * Route: /achievements
 */
function Achievements() {
  // Badges Data
  const badges = [
    {
      id: "hafez-40",
      title: "حافظ الأربعين",
      statusText: "مكتمل",
      isUnlocked: true,
      iconType: "cyan-badge",
    },
    {
      id: "motqen",
      title: "المتقن",
      statusText: "مكتمل",
      isUnlocked: true,
      iconType: "bronze-medal",
      tag: "100%",
    },
    {
      id: "khatem-mutun",
      title: "خاتم المتون",
      statusText: "متبقي 7 متون",
      isUnlocked: false,
    },
    {
      id: "rafeeq-quran",
      title: "رفيق القرآن",
      statusText: "غير متوفر بعد",
      isUnlocked: false,
    },
  ];

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
            <StreakCalendar />
          </div>

          {/* Days Streak & Mutun Progress Card (4 cols on lg) */}
          <div className="lg:col-span-4 bg-gradient-to-l from-orange-50/40 via-base-100 to-base-100 border border-base-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full min-h-[280px]">
            <div>
              <div className="flex items-start justify-between">
                {/* Flame Icon Container */}
                <div className="w-12 h-12 rounded-full bg-orange-100/80 border border-orange-200/50 flex items-center justify-center shrink-0 shadow-inner">
                  <FaFire className="text-xl text-orange-500" />
                </div>

                {/* Title and Tagline */}
                <div className="text-end">
                  <h2 className="text-xl font-bold font-1 text-base-content">
                    سلسلة الأيام
                  </h2>
                  <p className="text-xs text-base-content/60 mt-0.5">
                    أنت على خطى ثابتة!
                  </p>
                </div>
              </div>

              {/* Main Streak Counter */}
              <div className="text-start mt-6">
                <span className="text-4xl md:text-5xl font-bold font-1 text-base-content tracking-tight">
                  12
                </span>
                <span className="text-lg font-bold font-1 text-base-content mr-2">
                  يوم متواصل
                </span>
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="mt-6 pt-4 border-t border-base-200/60">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-base-content/50">
                  3 / 10
                </span>
                <span className="font-semibold text-base-content/60">
                  المتون المحفوظة بالكامل
                </span>
              </div>
              {/* Progress bar container */}
              <div className="w-full h-3 bg-base-200 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-cyan-700 rounded-full transition-all duration-500"
                  style={{ width: "30%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Badges (الأوسمة) */}
        <section className="bg-base-100 border border-base-200 rounded-3xl p-6 md:p-8 shadow-sm">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              type="button"
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 transition-colors"
            >
              عرض الكل
            </button>
            <h2 className="text-2xl font-bold font-1 text-base-content">
              الأوسمة
            </h2>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center text-center group transition-transform hover:-translate-y-1"
              >
                {/* Badge Circle Icon */}
                <div className="relative mb-3">
                  {badge.iconType === "cyan-badge" && (
                    <div className="w-24 h-24 rounded-full bg-cyan-700 flex items-center justify-center text-white shadow-lg shadow-cyan-700/20">
                      <HiCheckBadge className="text-5xl" />
                    </div>
                  )}

                  {badge.iconType === "bronze-medal" && (
                    <div className="w-24 h-24 rounded-full bg-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-700/20 relative">
                      <RiMedalLine className="text-4xl" />
                      {badge.tag && (
                        <span className="absolute -bottom-1 text-[10px] font-bold bg-white text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 shadow-sm">
                          {badge.tag}
                        </span>
                      )}
                    </div>
                  )}

                  {!badge.isUnlocked && (
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-base-300 bg-base-200/50 flex items-center justify-center text-base-content/40">
                      <HiOutlineLockClosed className="text-3xl" />
                    </div>
                  )}
                </div>

                {/* Badge Title */}
                <h3 className="font-bold text-base md:text-lg text-base-content mb-1">
                  {badge.title}
                </h3>

                {/* Status Subtitle / Pill Badge */}
                {badge.isUnlocked ? (
                  <span className="px-4 py-1 text-xs font-semibold rounded-full bg-base-200 text-base-content/70 border border-base-300">
                    {badge.statusText}
                  </span>
                ) : (
                  <span className="text-xs text-base-content/40">
                    {badge.statusText}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Achievements;
