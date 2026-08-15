import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineCalendar } from "react-icons/hi";
import { HiCheckBadge } from "react-icons/hi2";
import Navbar from '../components/shared/Navbar';
import DaysTarget from '../components/plan/DaysTarget';
import DailyGoal from '../components/plan/DailyGoal';
import DueReviewsToday from '../components/plan/DueReviewsToday';
import RecentlyReviewed from '../components/plan/RecentlyReviewed';
import RecentlyMemorized from '../components/plan/RecentlyMemorized';
import PlanOnboardingModal from '../components/plan/PlanOnboardingModal';
import { studyPlanService } from '../services/studyPlanService';

export default function Plan() {
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTimeOnboarding, setIsFirstTimeOnboarding] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeGoals, setActiveGoals] = useState({
    newHadithsPerDay: 2,
    reviewsPerDay: 3,
  });

  const loadPlanData = useCallback(async () => {
    try {
      setIsLoading(true);
      // 1. Initialize today's session
      await studyPlanService.initializeToday();
      // 2. Fetch complete overview
      const data = await studyPlanService.getOverview();
      if (data) {
        setOverview(data);
        if (data.settings && (data.settings.newHadithsPerDay > 0 || data.settings.reviewsPerDay > 0)) {
          setActiveGoals({
            newHadithsPerDay: data.settings.newHadithsPerDay,
            reviewsPerDay: data.settings.reviewsPerDay,
          });
        } else {
          // If user has no active saved settings in backend, launch required onboarding
          setIsFirstTimeOnboarding(true);
          setShowOnboarding(true);
        }
      } else {
        setIsFirstTimeOnboarding(true);
        setShowOnboarding(true);
      }
    } catch (err) {
      console.warn("Could not load study plan overview:", err);
      setIsFirstTimeOnboarding(true);
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlanData();
  }, [loadPlanData]);

  const handleGoalsChange = (newGoals) => {
    setActiveGoals((prev) => ({
      ...prev,
      ...newGoals,
    }));
  };

  const handleConfirmOnboarding = async (chosenGoals) => {
    setIsSaving(true);
    try {
      // 1. Save directly to backend
      await studyPlanService.updatePlanSettings({
        newHadithsPerDay: chosenGoals.newHadithsPerDay,
        reviewsPerDay: chosenGoals.reviewsPerDay,
      });

      // 2. Initialize today's session with newly configured targets
      await studyPlanService.initializeToday();

      // 3. Refresh live overview
      const data = await studyPlanService.getOverview();
      if (data) {
        setOverview(data);
      }

      setActiveGoals(chosenGoals);
      localStorage.setItem("athar_plan_onboarded", "true");
      localStorage.setItem(
        "athar_daily_goals",
        JSON.stringify({
          newAhadith: chosenGoals.newHadithsPerDay,
          revisionCount: chosenGoals.reviewsPerDay,
        })
      );
      window.dispatchEvent(
        new CustomEvent("athar_daily_goals_changed", {
          detail: {
            newHadithsPerDay: chosenGoals.newHadithsPerDay,
            reviewsPerDay: chosenGoals.reviewsPerDay,
            newAhadith: chosenGoals.newHadithsPerDay,
            revisionCount: chosenGoals.reviewsPerDay,
          },
        })
      );

      setShowOnboarding(false);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
    } catch (err) {
      console.error("Failed to save study plan settings from onboarding:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      await studyPlanService.updatePlanSettings({
        newHadithsPerDay: activeGoals.newHadithsPerDay,
        reviewsPerDay: activeGoals.reviewsPerDay,
      });

      // Refresh overview data
      const data = await studyPlanService.getOverview();
      if (data) {
        setOverview(data);
      }

      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3500);
    } catch (err) {
      console.error("Failed to save study plan settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 relative">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        <Navbar activePage="review" />

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start mt-4 sm:mt-6 mb-5">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-1 text-base-content">
              إدارة خطة الحفظ والمراجعة
            </h1>
            <p className="text-sm md:text-base text-base-content/60 font-normal">
              تحكم في مسارك التعليمي وتابع تقدمك اليومي بمرونة وفعالية
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsFirstTimeOnboarding(false);
              setShowOnboarding(true);
            }}
            className="self-start sm:self-center px-3.5 py-2 rounded-2xl bg-base-100 dark:bg-slate-900 border border-base-300 dark:border-slate-800 text-cyan-700 dark:text-cyan-400 font-2 text-xs sm:text-sm font-bold shadow-xs hover:border-cyan-500 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
            title="إعادة تشغيل مرشد إعداد الخطة"
          >
            <span>مرشد إعداد الخطة ✨</span>
          </button>
        </header>

        {/* Weekly Roadmap Section (Connected to active goals) */}
        <div className="mb-6">
          <DaysTarget weekData={overview?.week} goals={activeGoals} />
        </div>

        {/* Main Plan Sections Container */}
        <div className="mt-6 space-y-6">
          {/* Section: خطة الحفظ والمراجعة اليومية (مع زر حفظ التغييرات مدمج في رأس البطاقة) */}
          <div className="w-full">
            <DailyGoal
              settings={overview?.settings}
              onChange={handleGoalsChange}
              onSave={handleSavePlan}
              isSaving={isSaving}
            />
          </div>

          {/* 3 Columns Responsive Grid for the 3 Hadith Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            {/* 1. ما يجب مراجعته اليوم */}
            <div className="w-full h-full">
              <DueReviewsToday
                dueReviews={overview?.dueReviews}
              />
            </div>

            {/* 2. آخر ما تمت مراجعته */}
            <div className="w-full h-full">
              <RecentlyReviewed
                items={overview?.recentlyReviewed || []}
              />
            </div>

            {/* 3. ما تم حفظه (بانتظار المراجعة) */}
            <div className="w-full h-full">
              <RecentlyMemorized
                items={overview?.recentlyMemorizedNotReviewed || []}
              />
            </div>
          </div>
        </div>

        {/* Success Notification Toast */}
        {showSuccessToast && (
          <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[94vw] animate-bounceIn">
            <div className="bg-cyan-950/95 dark:bg-cyan-900/95 backdrop-blur-md text-white px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl shadow-2xl border border-cyan-400/50 flex items-center gap-2.5 sm:gap-3 font-2 text-xs sm:text-base font-bold whitespace-nowrap">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/30 border border-cyan-400/40 flex items-center justify-center shrink-0">
                <HiCheckBadge className="text-cyan-300 text-lg sm:text-xl" />
              </div>
              <span className="whitespace-nowrap">تم حفظ إعدادات الخطة بنجاح!</span>
            </div>
          </div>
        )}

        {/* Plan Onboarding Wizard Modal */}
        <PlanOnboardingModal
          isOpen={showOnboarding}
          canClose={!isFirstTimeOnboarding}
          onClose={() => setShowOnboarding(false)}
          onConfirm={handleConfirmOnboarding}
          isSaving={isSaving}
        />

      </main>
    </div>
  );
}