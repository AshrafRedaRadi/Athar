import Navbar from '../components/shared/Navbar';
import ProgressCard from '../components/study/plan/ProgressCard';
import QuickActions from '../components/study/plan/QuickActions';
import DaysTarget from '../components/study/plan/DaysTarget';
import AdvancedSettings from '../components/study/plan/AdvancedSettings';
import DailyGoal from '../components/study/plan/DailyGoal';
import SelectedTrack from '../components/study/plan/SelectedTrack';
export default function plan(){
    return(<>
    <div className="m-4">
        <Navbar/>
    </div>
    <div className=" w-100vw text-right m-4" >
        <h2>ادارة خطة الحفظ و المراجعة</h2>
        <p>تحكم في مسارك التعليمي و تابع تقدمك اليومي بمرونة و فعالية</p>
    </div>
    <div className="w-100vw grid grid-cols-3  gap-4 m-4">
        <div className="col-span-1" >
        <QuickActions/>
        </div>
        <div className="col-span-2 w-full" >
        <ProgressCard/>
        </div>
    </div>
        <DaysTarget/>
        <AdvancedSettings/>
        <DailyGoal/>
        <SelectedTrack/>
    </>
    )
}