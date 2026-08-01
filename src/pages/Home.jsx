import { useNavigate } from "react-router-dom";
import { IoLogInOutline, IoPersonAddOutline, IoBookOutline, IoMicOutline, IoStatsChartOutline } from "react-icons/io5";
import { BsStars } from "react-icons/bs";
import Navbar from "../components/Navbar";
import Stat from "../components/Stat";
import Progress from "../components/Progress";
import Tasks from "../components/Tasks";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { isGuest, logout } = useAuth();
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    logout();
    navigate("/login");
  };

  const handleSignupRedirect = () => {
    logout();
    navigate("/signup");
  };

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
            <Stat days={12} hadith={145} accuracy={92} />
            <Progress title="الأربعين النووية" progress={100} />
            <Tasks />
          </>
        )}

        <br className="block md:hidden" />
        <br className="block md:hidden" />
      </main>
    </div>
  );
}

export default Home;