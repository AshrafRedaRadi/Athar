import Navbar from '../components/shared/Navbar';
import ProgressCard from '../components/plan/ProgressCard';
import QuickActions from '../components/plan/QuickActions';
import DaysTarget from '../components/plan/DaysTarget';
import AdvancedSettings from '../components/plan/AdvancedSettings';
import DailyGoal from '../components/plan/DailyGoal';
import SelectedTrack from '../components/plan/SelectedTrack';

export default function Plan() {
  return (
    <div className="min-h-screen bg-base-200">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        <Navbar activePage="review" />

        <header className="text-right mb-6 px-1 mt-6">
          <h1 className="text-xl sm:text-2xl font-1 font-bold text-base-content mb-1">
            إدارة خطة الحفظ والمراجعة
          </h1>
          <p className="text-xs sm:text-sm font-2 text-base-content/60 leading-relaxed">
            تحكم في مسارك التعليمي وتابع تقدمك اليومي بمرونة وفعالية
          </p>
        </header>

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
      
          <div className="col-span-1 lg:col-span-3 order-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch w-full">
            <SelectedTrack />
            <DailyGoal />
            <AdvancedSettings />
          </div>

        </div>

        <div className="mt-6 flex justify-start px-1 mb-6">
          <button className="w-full sm:w-auto bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-2 font-semibold shadow-md transition active:scale-95 cursor-pointer">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>حفظ تغييرات الخطة</span>
          </button>
        </div>
      </main>
    </div>
  );
}