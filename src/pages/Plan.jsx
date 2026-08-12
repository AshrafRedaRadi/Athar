import React, { useState } from 'react';
import { HiOutlineCalendar } from "react-icons/hi";
import { HiCheckBadge } from "react-icons/hi2";
import Navbar from '../components/shared/Navbar';
import ProgressCard from '../components/plan/ProgressCard';
import QuickActions from '../components/plan/QuickActions';
import DaysTarget from '../components/plan/DaysTarget';
import AdvancedSettings from '../components/plan/AdvancedSettings';
import DailyGoal from '../components/plan/DailyGoal';
import SelectedTrack from '../components/plan/SelectedTrack';

export default function Plan() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSavePlan = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3500);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-base-200 relative">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        <Navbar activePage="review" />

        <header className="text-start space-y-1 mt-4 sm:mt-6">
          <h1 className="text-3xl font-bold font-1 text-base-content">
            إدارة خطة الحفظ والمراجعة
          </h1>
          <p className="text-sm md:text-base text-base-content/60 font-normal mt-2 mb-5">
            تحكم في مسارك التعليمي وتابع تقدمك اليومي بمرونة وفعالية
          </p>
        </header>

        {/* القسم الأول: المتابعة والإجراءات */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 bg-base-100 p-3 sm:p-5 rounded-3xl shadow-sm border border-base-300">
          <div className="col-span-1 lg:col-span-2 w-full">
            <ProgressCard />
          </div>
          <div className="col-span-1 lg:col-span-1 w-full">
            <QuickActions />
          </div>

          <div className="col-span-1 lg:col-span-3 order-3 w-full my-1">
            <DaysTarget />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 bg-base-100 p-5 sm:p-7 rounded-3xl shadow-sm border border-base-200 mt-6">
          
          <div className="col-span-1 lg:col-span-3 text-lg sm:text-xl font-bold font-1 text-base-content border-b border-base-200/70 pb-3 mb-1 flex items-center gap-2.5">
            <HiOutlineCalendar className="text-2xl text-cyan-700 dark:text-cyan-400 shrink-0" />
            <h3>خطة الحفظ والمراجعة</h3>
          </div>

          <SelectedTrack />
          <DailyGoal />
          <AdvancedSettings />
        </div>

        <div className="mt-6 flex justify-start px-1 mb-6">
          <button
            onClick={handleSavePlan}
            disabled={isSaving}
            className="w-full sm:w-auto bg-cyan-700 hover:bg-cyan-800 text-white px-7 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-2 font-bold shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-sm shrink-0" />
            ) : (
              <svg
                className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            )}
            <span>{isSaving ? "جاري حفظ التغييرات..." : "حفظ تغييرات الخطة"}</span>
          </button>
        </div>

        {/* Success Notification Toast */}
        {showSuccessToast && (
          <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[94vw] animate-bounceIn">
            <div className="bg-cyan-950/95 dark:bg-cyan-900/95 backdrop-blur-md text-white px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl shadow-2xl border border-cyan-400/50 flex items-center gap-2.5 sm:gap-3 font-2 text-xs sm:text-base font-bold whitespace-nowrap">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/30 border border-cyan-400/40 flex items-center justify-center shrink-0">
                <HiCheckBadge className="text-cyan-300 text-lg sm:text-xl" />
              </div>
              <span className="whitespace-nowrap">تم حفظ تغييرات الخطة بنجاح! 🎉</span>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}