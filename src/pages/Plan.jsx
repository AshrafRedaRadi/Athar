import Navbar from '../components/shared/Navbar';
import ProgressCard from '../components/plan/ProgressCard';
import QuickActions from '../components/plan/QuickActions';
import DaysTarget from '../components/plan/DaysTarget';
import AdvancedSettings from '../components/plan/AdvancedSettings';
import DailyGoal from '../components/plan/DailyGoal';
import SelectedTrack from '../components/plan/SelectedTrack';

export default function Plan() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] p-3 sm:p-6 font-sans" dir="rtl">
      
      <div className="max-w-7xl mx-auto mb-4 sm:mb-6">
        <Navbar />
      </div>

      <div className="max-w-7xl mx-auto text-right mb-4 sm:mb-6 px-1">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          إدارة خطة الحفظ والمراجعة
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          تحكم في مسارك التعليمي وتابع تقدمك اليومي بمرونة وفعالية
        </p>
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 bg-white sm:bg-[#F7F9FC] p-3 sm:p-4 rounded-3xl shadow-sm border border-gray-100">
        
       
        <div className="col-span-1 lg:col-span-2   w-full">
          <ProgressCard />
        </div>
 <div className="col-span-1 lg:col-span-1   w-full">
          <QuickActions />
        </div>

        
        <div className="col-span-1 lg:col-span-3 order-3 w-full my-2">
          <DaysTarget />
        </div>
    
        <div className="col-span-1 lg:col-span-3 order-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch w-full">
          <SelectedTrack />
          <DailyGoal />
          <AdvancedSettings />
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-6 flex justify-start px-1 mb-6">
        <button className="w-full sm:w-auto bg-[#077187] text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold shadow-md hover:bg-[#05596b] transition active:scale-95">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>حفظ تغييرات الخطة</span>
        </button>
      </div>

    </div>
  );
}