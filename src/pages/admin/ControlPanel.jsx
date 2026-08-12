import React from "react";
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

/**
 * Admin Control Panel Page (لوحة التحكم).
 * Uses unified Navbar & AdminSidebar.
 * Route: /admin/controlpanel
 */
function ControlPanel() {
  // Static KPI Cards Data
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
      value: "1,240",
      change: "+12%",
      changeType: "increase",
      icon: <HiOutlineAcademicCap className="text-2xl text-cyan-800" />,
      iconBg: "bg-cyan-100",
    },
    {
      id: "books",
      title: "الكتب والمتون",
      value: "45",
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

  // Static Activity Feed Items
  const activities = [
    {
      id: 1,
      user: "فاطمة علي",
      action: "سجلت كمعلمة",
      time: "منذ ساعتين",
      avatarBg: "bg-cyan-600 text-white",
      icon: <HiOutlineUsers className="text-lg" />,
    },
    {
      id: 2,
      user: "أحمد محمد",
      action: "أضاف متناً جديداً",
      time: "منذ 4 ساعات",
      avatarBg: "bg-amber-600 text-white",
      icon: <HiOutlineDocumentText className="text-lg" />,
    },
    {
      id: 3,
      user: "",
      action: 'تم اعتماد حلقة "النور" الجديدة',
      time: "14:30",
      avatarBg: "bg-teal-100 text-teal-700 border border-teal-300",
      icon: <HiOutlineCheck className="text-lg" />,
    },
    {
      id: 4,
      user: "عمر محمود",
      action: "قام بتحديث إعدادات النظام",
      time: "09:15",
      avatarBg: "bg-slate-200 text-slate-700",
      icon: <HiOutlineCog className="text-lg" />,
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
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-base-200">
        <h1 className="text-2xl md:text-3xl font-bold font-1 text-base-content">
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
                className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                عرض الكل
              </button>
            </div>

            {/* Activity List */}
            <div className="space-y-5">
              {activities.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between pb-4 border-b border-base-200 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.avatarBg}`}
                    >
                      {item.icon}
                    </div>
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
              ))}
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
