import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  HiOutlineUsers, 
  HiOutlineAcademicCap, 
  HiOutlineBookOpen, 
  HiOutlineViewGrid,
  HiOutlineCalendar,
  HiOutlineDownload,
  HiOutlineCheck,
  HiOutlineDocumentText,
  HiOutlineCog
} from "react-icons/hi";
import { HiOutlineChartBar } from "react-icons/hi2";
import Navbar from "../../components/shared/Navbar";
import { usersService } from "../../services/usersService";
import { booksService } from "../../services/booksService";

function formatTimeAgo(dateInput) {
  if (!dateInput) return "مؤخراً";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "الآن";
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
  return date.toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Admin Control Panel Page (لوحة التحكم).
 * Uses unified Navbar & AdminSidebar.
 * Route: /admin/controlpanel
 */
function ControlPanel() {
  const navigate = useNavigate();
  const [studentsCount, setStudentsCount] = useState(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  const [booksCount, setBooksCount] = useState(null);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setIsLoadingStudents(true);
      setIsLoadingBooks(true);
      setIsLoadingActivities(true);

      try {
        const [students, books, users] = await Promise.all([
          usersService.getStudentsCount(),
          booksService.getExplanationBooksCount(),
          usersService.getUsers(),
        ]);
        setStudentsCount(students);
        setBooksCount(books);

        if (Array.isArray(users) && users.length > 0) {
          // Sort users according to createdAt date ascendingly
          const sorted = [...users].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateA - dateB;
          });

          const formatted = sorted.slice(0, 6).map((u, index) => {
            const roleStr = u.role === "أدمن" ? "قام بالتسجيل كأدمن" : u.role === "معلم" ? "سجل كمعلم" : "انضم كطالب جديد";
            const bg = u.role === "أدمن" ? "bg-cyan-700 text-white" : u.role === "معلم" ? "bg-amber-600 text-white" : "bg-cyan-100 text-cyan-800 border border-cyan-200";
            return {
              id: u.id || index,
              user: u.name || u.email || "مستخدم",
              action: roleStr,
              time: formatTimeAgo(u.createdAt) || u.joinedDate || "مؤخراً",
              avatarBg: bg,
              avatar: u.avatar,
              icon: <HiOutlineUsers className="text-lg" />,
            };
          });
          setActivities(formatted);
        }
      } catch (err) {
        console.warn("Could not load control panel stats:", err);
      } finally {
        setIsLoadingStudents(false);
        setIsLoadingBooks(false);
        setIsLoadingActivities(false);
      }
    }

    loadStats();
  }, []);

  // KPI Cards Data
  const statsData = [
    {
      id: "teachers",
      title: "المعلمون",
      value: "120",
      change: "+5%",
      changeType: "increase",
      icon: <HiOutlineUsers className="text-2xl text-white" />,
      iconBg: "bg-cyan-700",
    },
    {
      id: "students",
      title: "الطلاب",
      value: isLoadingStudents ? "..." : (studentsCount !== null ? studentsCount.toLocaleString('en-US') : "0"),
      change: null,
      changeType: "increase",
      icon: <HiOutlineAcademicCap className="text-2xl text-cyan-800" />,
      iconBg: "bg-cyan-100",
    },
    {
      id: "books",
      title: "الكتب والمتون",
      value: isLoadingBooks ? "..." : (booksCount !== null ? booksCount.toLocaleString('en-US') : "0"),
      change: null,
      icon: <HiOutlineBookOpen className="text-2xl text-amber-800" />,
      iconBg: "bg-amber-100",
    },
    {
      id: "sessions",
      title: "الحلقات النشطة",
      value: "320",
      change: null,
      icon: <HiOutlineViewGrid className="text-2xl text-slate-700" />,
      iconBg: "bg-slate-200",
    },
  ];



  return (
    <div dir="rtl" className="min-h-screen bg-base-200 text-base-content font-2">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        {/* Top Navbar with Admin Dock for Mobile/Tablet */}
        <Navbar
        drawerId="admin-sidebar-drawer"
        activePage="dashboard"
        isAdmin={true}
        showSidebar={true}
        showDock={true}
      />

      {/* Top Bar / Header below Navbar */}
      <header className="flex items-center justify-between mb-4 pb-2 border-b border-base-200 mt-4 sm:mt-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-1 text-base-content">
          نظرة عامة
        </h1>

        {/* Filter / Date selector button */}
        <button
          type="button"
          className="btn btn-outline border-base-300 text-base-content hover:bg-base-200 hover:text-base-content rounded-xl gap-2 font-normal text-sm"
        >
          <HiOutlineCalendar className="text-lg text-base-content/70" />
          <span>هذا الشهر</span>
        </button>
      </header>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statsData.map((stat) => (
          <div
            key={stat.id}
            className="bg-base-100 border border-base-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {/* Icon Circle (Right in RTL) */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${stat.iconBg}`}
              >
                {stat.icon}
              </div>

              {/* Label and Value */}
              <div>
                <p className="text-xs text-base-content/60 font-normal mb-1">
                  {stat.title}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold font-1 text-base-content tracking-tight">
                  {stat.value}
                </h2>
              </div>
            </div>

            {/* Change trend badge (if present, on the left in RTL) */}
            {stat.change && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                {stat.change} ~
              </span>
            )}
          </div>
        ))}
      </section>

      {/* Main Content Grid: Activity Feed & Chart Area */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Activities (4 cols on lg) */}
        <div className="lg:col-span-4 bg-base-100 border border-base-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-1 text-base-content">
                آخر النشاطات
              </h2>
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors cursor-pointer"
              >
                عرض الكل
              </button>
            </div>

            {/* Activity List */}
            <div className="space-y-5">
              {isLoadingActivities ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-base-300/60 shrink-0" />
                    <div className="space-y-1 flex-1">
                      <div className="h-4 w-3/4 bg-base-300/60 rounded" />
                      <div className="h-3 w-1/3 bg-base-300/40 rounded" />
                    </div>
                  </div>
                ))
              ) : activities.length === 0 ? (
                <p className="text-xs text-base-content/50 text-center py-4">لا توجد نشاطات حالياً</p>
              ) : (
                activities.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between pb-4 border-b border-base-200 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.user}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.avatarBg}`}
                        >
                          {item.icon}
                        </div>
                      )}
                      <div className="text-sm">
                        <p className="font-semibold text-base-content">
                          {item.user ? `${item.user} ` : ""}
                          <span className="font-normal text-base-content/80">
                            {item.action}
                          </span>
                        </p>
                        <p className="text-xs text-base-content/50 mt-0.5">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Memorization Stats / Chart Placeholder (8 cols on lg) */}
        <div className="lg:col-span-8 bg-base-100 border border-base-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-1 text-base-content">
              إحصائيات الحفظ الأسبوعية
            </h2>
            <button
              type="button"
              className="btn btn-ghost btn-xs text-cyan-600 hover:bg-cyan-50 font-normal gap-1 rounded-lg"
            >
              <HiOutlineDownload className="text-sm" />
              <span>تصدير</span>
            </button>
          </div>

          {/* Interactive Chart Placeholder Area */}
          <div className="flex-1 min-h-[300px] border-2 border-dashed border-base-300 rounded-2xl flex flex-col items-center justify-center p-8 bg-base-200/40 text-base-content/40">
            <HiOutlineChartBar className="text-4xl mb-3 opacity-60" />
            <p className="text-sm font-medium">مساحة الرسم البياني التفاعلي</p>
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}

export default ControlPanel;
