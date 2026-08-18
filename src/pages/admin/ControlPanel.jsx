import React, { useState, useEffect } from "react";
import {
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineViewGrid,
  HiOutlineDownload,
  HiOutlineCheck,
  HiOutlineDocumentText,
  HiOutlineCog
} from "react-icons/hi";
import { HiOutlineChartBar } from "react-icons/hi2";
import Navbar from "../../components/shared/Navbar";
import Pagination from "../../components/shared/Pagination";
import { usersService } from "../../services/usersService";
import { booksService } from "../../services/booksService";
import {
  auditService,
  describeAuditEntry,
  describeActor,
  ACTIVITY_CATEGORIES,
  DATE_RANGES,
  daysAgoIso,
} from "../../services/auditService";
import { apiFetch } from "../../api/client";

const ACTION_AVATAR_STYLE = {
  Registered: "bg-cyan-100 text-cyan-800 border border-cyan-200",
  RoleChanged: "bg-cyan-700 text-white",
  UserActivated: "bg-emerald-600 text-white",
  UserDeactivated: "bg-red-600 text-white",
  Created: "bg-emerald-600 text-white",
  Updated: "bg-amber-600 text-white",
  SoftDeleted: "bg-red-600 text-white",
  Restored: "bg-violet-600 text-white",
};

const ACTION_ICON = {
  Registered: <HiOutlineUsers className="text-lg" />,
  RoleChanged: <HiOutlineUsers className="text-lg" />,
  UserActivated: <HiOutlineCheck className="text-lg" />,
  UserDeactivated: <HiOutlineUsers className="text-lg" />,
  Created: <HiOutlineBookOpen className="text-lg" />,
  Updated: <HiOutlineDocumentText className="text-lg" />,
  SoftDeleted: <HiOutlineDocumentText className="text-lg" />,
  Restored: <HiOutlineDocumentText className="text-lg" />,
};

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
// Enough rows to fill the panel without turning the dashboard into a log reader.
const ACTIVITY_PAGE_SIZE = 8;

function ControlPanel() {
  const [studentsCount, setStudentsCount] = useState(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  const [booksCount, setBooksCount] = useState(null);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  // Avatars are matched to audit rows by email, so the user list is kept for the feed.
  const [knownUsers, setKnownUsers] = useState([]);

  // Feed controls. Held apart from the statistics above so changing a filter refetches the
  // activity list alone rather than the whole dashboard.
  const [category, setCategory] = useState(ACTIVITY_CATEGORIES[0]);
  const [rangeId, setRangeId] = useState("7");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(0);
  const [activityTotalCount, setActivityTotalCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      setIsLoadingStudents(true);
      setIsLoadingBooks(true);

      try {
        const [overviewRes, users] = await Promise.all([
          apiFetch("/api/Admin/overview").catch((err) => {
            console.warn("Could not fetch /api/Admin/overview:", err);
            return null;
          }),
          usersService.getUsers().catch((err) => {
            console.warn("Could not fetch users for activity list:", err);
            return [];
          }),
        ]);

        setKnownUsers(Array.isArray(users) ? users : []);

        if (overviewRes) {
          const overviewData = overviewRes.data || overviewRes;
          if (typeof overviewData.studentsCount === "number") {
            setStudentsCount(overviewData.studentsCount);
          }
          if (typeof overviewData.matnCount === "number") {
            setBooksCount(overviewData.matnCount);
          }
        } else {
          // Fallback if overview endpoint fails
          const [students, books] = await Promise.all([
            usersService.getStudentsCount(),
            booksService.getExplanationBooksCount(),
          ]);
          setStudentsCount(students);
          setBooksCount(books);
        }

      } catch (err) {
        console.warn("Could not load control panel stats:", err);
      } finally {
        setIsLoadingStudents(false);
        setIsLoadingBooks(false);
      }
    }

    loadStats();
  }, []);

  // Changing a filter starts again at the first page; adjusted during render so the fetch
  // below never runs once against a page the new result set does not have.
  const [appliedKey, setAppliedKey] = useState("");
  const filterKey = `${category.id}|${rangeId}|${customFrom}|${customTo}`;
  if (appliedKey !== filterKey) {
    setAppliedKey(filterKey);
    setActivityPage(1);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      setIsLoadingActivities(true);
      try {
        const range = DATE_RANGES.find((item) => item.id === rangeId);
        const from = range?.days
          ? daysAgoIso(range.days)
          : customFrom
            ? new Date(`${customFrom}T00:00:00`).toISOString()
            : "";
        // Inclusive of the chosen end date, which a reader expects but a raw midnight cut off.
        const to = !range?.days && customTo
          ? new Date(`${customTo}T23:59:59`).toISOString()
          : "";

        const page = await auditService.getAuditLogs({
          page: activityPage,
          pageSize: ACTIVITY_PAGE_SIZE,
          ...category.filters,
          from,
          to,
        });

        if (cancelled) return;

        const avatarByEmail = new Map(
          knownUsers.filter((u) => u.email).map((u) => [u.email.toLowerCase(), u.avatar])
        );

        // Each row reads "{actor} {what they did}", with the wording chosen by action and
        // entity type in auditService — Arabic agreement makes composing it here fragile.
        setActivities(
          page.items.map((entry) => ({
            id: entry.id,
            user: describeActor(entry),
            action: describeAuditEntry(entry),
            time: formatTimeAgo(entry.occurredAtUtc) || "مؤخراً",
            // The audit record deliberately keeps no link to the account, so a picture is a
            // best-effort match on email and simply absent once the user is gone.
            avatar: entry.actorEmail ? avatarByEmail.get(entry.actorEmail.toLowerCase()) : undefined,
            avatarBg: ACTION_AVATAR_STYLE[entry.action] || "bg-cyan-100 text-cyan-800 border border-cyan-200",
            icon: ACTION_ICON[entry.action] || <HiOutlineDocumentText className="text-lg" />,
          }))
        );
        setActivityTotalPages(page.totalPages || 0);
        setActivityTotalCount(page.totalCount || 0);
      } catch (err) {
        console.warn("Could not fetch audit activity:", err);
        if (!cancelled) setActivities([]);
      } finally {
        if (!cancelled) setIsLoadingActivities(false);
      }
    }

    loadActivity();
    return () => { cancelled = true; };
  }, [category, rangeId, customFrom, customTo, activityPage, knownUsers]);

  // KPI Cards Data (matching Stat.jsx circular icon & layout)
  const statsData = [
    /*
    {
      id: "teachers",
      title: "المعلمون",
      value: "120",
      icon: <HiOutlineUsers className="text-cyan-700 dark:text-cyan-400 text-base sm:text-lg md:text-xl" />,
      iconBg: "bg-cyan-100 dark:bg-cyan-950/40",
    },
    */
    {
      id: "students",
      title: "الطلاب",
      value: isLoadingStudents ? "..." : (studentsCount !== null ? studentsCount.toLocaleString('en-US') : "0"),
      icon: <HiOutlineAcademicCap className="text-teal-700 dark:text-teal-400 text-base sm:text-lg md:text-xl" />,
      iconBg: "bg-teal-100 dark:bg-teal-950/40",
    },
    {
      id: "books",
      title: "الكتب والمتون",
      value: isLoadingBooks ? "..." : (booksCount !== null ? booksCount.toLocaleString('en-US') : "0"),
      icon: <HiOutlineBookOpen className="text-amber-700 dark:text-amber-400 text-base sm:text-lg md:text-xl" />,
      iconBg: "bg-amber-100 dark:bg-amber-950/40",
    },
    /*
    {
      id: "sessions",
      title: "الحلقات النشطة",
      value: "320",
      icon: <HiOutlineViewGrid className="text-indigo-700 dark:text-indigo-400 text-base sm:text-lg md:text-xl" />,
      iconBg: "bg-indigo-100 dark:bg-indigo-950/40",
    },
    */
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
        <header className="flex items-center mb-4 pb-2 border-b border-base-200 mt-4 sm:mt-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-1 text-base-content">
            نظرة عامة
          </h1>
        </header>

        {/* KPI Cards Grid (Adjusted to 2 columns so remaining cards take up available space) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {statsData.map((stat) => (
            <div
              key={stat.id}
              className="bg-base-100 dark:bg-base-100 border border-base-300/60 rounded-xl sm:rounded-2xl shadow-xs p-3.5 sm:p-4 md:p-5 flex items-center justify-start text-right gap-3 md:gap-4 min-w-0 hover:shadow-md transition-shadow relative"
            >
              {/* Circular Icon */}
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 ${stat.iconBg}`}
              >
                {stat.icon}
              </div>

              {/* Label & Value */}
              <div className="text-right min-w-0 flex-1 truncate">
                <p className="text-xs sm:text-sm text-base-content/90 font-2 leading-tight truncate">
                  {stat.title}
                </p>
                <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold font-1 text-base-content mt-0.5 truncate">
                  {stat.value}
                </h2>
              </div>
            </div>
          ))}
        </section>

        {/* Main Content Grid: Activity Feed & Chart Area */}
        <section className="grid grid-cols-1 gap-6">
          {/* Recent Activities */}
          <div className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold font-1 text-base-content">
                  آخر النشاطات
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={category.id}
                    onChange={(e) =>
                      setCategory(
                        ACTIVITY_CATEGORIES.find((item) => item.id === e.target.value) ||
                          ACTIVITY_CATEGORIES[0]
                      )
                    }
                    className="select select-xs sm:select-sm rounded-xl font-2 text-xs"
                    aria-label="تصفية حسب النوع"
                  >
                    {ACTIVITY_CATEGORIES.map((item) => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </select>

                  <select
                    value={rangeId}
                    onChange={(e) => setRangeId(e.target.value)}
                    className="select select-xs sm:select-sm rounded-xl font-2 text-xs"
                    aria-label="تصفية حسب التاريخ"
                  >
                    {DATE_RANGES.map((item) => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {rangeId === "custom" && (
                <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-base-200">
                  <label className="text-xs text-base-content/60 font-2">من</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="input input-xs sm:input-sm rounded-xl font-2 text-xs"
                  />
                  <label className="text-xs text-base-content/60 font-2">إلى</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="input input-xs sm:input-sm rounded-xl font-2 text-xs"
                  />
                </div>
              )}

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

              {activityTotalCount > 0 && (
                <div className="mt-5">
                  <Pagination
                    page={activityPage}
                    totalPages={activityTotalPages}
                    totalCount={activityTotalCount}
                    pageSize={ACTIVITY_PAGE_SIZE}
                    onChange={setActivityPage}
                    itemNoun="سجل"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Weekly Memorization Stats / Chart Placeholder (Commented out) */}
          {/*
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

            <div className="flex-1 min-h-[300px] border-2 border-dashed border-base-300 rounded-2xl flex flex-col items-center justify-center p-8 bg-base-200/40 text-base-content/40">
              <HiOutlineChartBar className="text-4xl mb-3 opacity-60" />
              <p className="text-sm font-medium">مساحة الرسم البياني التفاعلي</p>
            </div>
          </div>
          */}
        </section>
      </main>
    </div>
  );
}

export default ControlPanel;
