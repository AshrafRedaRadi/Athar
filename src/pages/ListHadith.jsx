import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  IoListOutline,
  IoGridOutline,
  IoLibraryOutline,
  IoLayersOutline,
  IoChevronBack,
  IoPlayOutline,
  IoRefreshOutline,
  IoBookmarkOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoEllipseOutline,
} from "react-icons/io5";
import Navbar from "../components/shared/Navbar";
import { hadithsService } from "../services/hadithsService";
import { booksService } from "../services/booksService";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import user from "../assets/user.png";

// ─────────────────────────────────────────────
//  Memorization status helpers
//  (UI-only mock — replace with real user data)
// ─────────────────────────────────────────────

/** Possible memorization statuses from API */
// Large enough that ordinary متون arrive in one page, small enough that a big book does not.
const HADITHS_PER_PAGE = 50;

const STATUS = {
  NOT_STARTED: 0, // لم يبدأ الحفظ
  IN_PROGRESS: 1, // قيد الحفظ
  MEMORIZED: 2,   // محفوظ
};

function parseStatus(val) {
  if (val === 2 || val === "Memorized") return STATUS.MEMORIZED;
  if (val === 1 || val === "InProgress") return STATUS.IN_PROGRESS;
  return STATUS.NOT_STARTED;
}

/** DaisyUI badge config per status */
const STATUS_CONFIG = {
  [STATUS.MEMORIZED]: {
    label: "محفوظ",
    badgeClass: "badge-success gap-1",
    icon: <IoCheckmarkCircle className="text-sm shrink-0" />,
  },
  [STATUS.IN_PROGRESS]: {
    label: "قيد الحفظ",
    badgeClass: "badge-warning gap-1",
    icon: <IoTimeOutline className="text-sm shrink-0" />,
  },
  [STATUS.NOT_STARTED]: {
    label: "لم يبدأ الحفظ",
    badgeClass: "badge-ghost border-base-300 gap-1",
    icon: <IoEllipseOutline className="text-sm shrink-0" />,
  },
};

/** Arabic action label per status */
const ACTION_LABEL = {
  [STATUS.MEMORIZED]: "مراجعة",
  [STATUS.IN_PROGRESS]: "متابعة",
  [STATUS.NOT_STARTED]: "ابدأ الحفظ",
};

/** Action button color per status */
const ACTION_CLASS = {
  [STATUS.MEMORIZED]:
    "btn-success text-success-content hover:opacity-90",
  [STATUS.IN_PROGRESS]:
    "btn-warning text-warning-content hover:opacity-90",
  [STATUS.NOT_STARTED]:
    "bg-cyan-700 hover:bg-cyan-800 text-white border-none",
};

// ─────────────────────────────────────────────
//  Skeleton row for loading state
// ─────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td><div className="h-4 w-6 bg-base-300 rounded mx-auto" /></td>
      <td><div className="h-4 w-16 bg-base-300 rounded" /></td>
      <td className="hidden sm:table-cell"><div className="h-4 w-28 bg-base-300 rounded" /></td>
      <td><div className="h-5 w-16 bg-base-300 rounded-full" /></td>
      <td><div className="h-8 w-20 bg-base-300 rounded-full" /></td>
    </tr>
  );
}

// ─────────────────────────────────────────────
//  Mobile Hadith Card (supports 1 or 2 columns layout)
// ─────────────────────────────────────────────
function HadithMobileCard({ hadith, status, isSingleColumn = false, onAction }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div
      className={`card bg-base-100 border border-base-200 shadow-sm flex flex-col justify-between h-full rounded-2xl transition-all duration-300 ${isSingleColumn ? "p-4 gap-2.5" : "p-3.5 gap-2"
        }`}
      dir="rtl"
    >
      {/* Header: number + badge */}
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <span className={`font-2 text-base-content/60 font-semibold truncate ${isSingleColumn ? "text-xs" : "text-[11px]"}`}>
          {hadith.hadithLabel}
        </span>
        <span className={`badge font-2 ${cfg.badgeClass} ${isSingleColumn ? "badge-sm" : "badge-xs"}`}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {/* Title */}
      <p className={`font-1 font-bold text-base-content leading-snug my-auto ${isSingleColumn ? "text-sm" : "text-xs line-clamp-2"}`}>
        {hadith.title || hadith.hadithLabel}
      </p>

      {/* Narrator */}
      {hadith.narrator && (
        <p className={`font-2 text-base-content/50 ${isSingleColumn ? "text-xs" : "text-[10px] line-clamp-1"}`}>
          عن: {hadith.narrator}
        </p>
      )}

      {/* Action button */}
      <button
        onClick={() => onAction(hadith)}
        className={`btn rounded-full font-2 mt-1 w-full ${isSingleColumn ? "btn-sm text-xs" : "btn-xs text-[11px]"
          } ${ACTION_CLASS[status]}`}
      >
        {ACTION_LABEL[status]}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
//  ListHadith Page
//  Route: /library/:bookId/sections/:sectionId
// ─────────────────────────────────────────────
export default function ListHadith() {
  const { bookId, sectionId } = useParams();
  const navigate = useNavigate();

  const effectiveSectionId = sectionId === "0" ? null : sectionId;

  const [hadiths, setHadiths] = useState([]);
  const [bookTitle, setBookTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // The path down to this section, so opening its hadiths does not collapse the trail
  // back to the book name.
  const [trail, setTrail] = useState([]);

  // Paged, so opening a section in a large book never transfers the whole book.
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Moving to a different section starts over at the first page. Adjusted during render
  // rather than in an effect, so the fetch below never runs once against a stale page.
  const [pagedSection, setPagedSection] = useState(sectionId);
  if (pagedSection !== sectionId) {
    setPagedSection(sectionId);
    setPageNumber(1);
  }

  const [progressMap, setProgressMap] = useState({});

  // View Mode state: 'cards' by default on mobile size (<640px) or 'table' on desktop, persisted in localStorage
  const [viewMode, setViewMode] = useState(() => {
    const savedMode = localStorage.getItem("athar_hadith_view_mode");
    if (savedMode) return savedMode;
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      return "cards";
    }
    return "table";
  });

  // Mobile cards column layout switcher: "1" or "2" cards per row on mobile
  const [mobileColumns, setMobileColumns] = useState(() => {
    return localStorage.getItem("athar_mobile_hadith_cols") || "2";
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("athar_hadith_view_mode", mode);
  };

  const handleMobileColumnsChange = (cols) => {
    setMobileColumns(cols);
    localStorage.setItem("athar_mobile_hadith_cols", cols);
  };

  const getHadithStatus = (hadithId) => {
    if (hadithId != null && progressMap[hadithId] !== undefined) {
      return progressMap[hadithId];
    }
    return STATUS.NOT_STARTED;
  };

  useEffect(() => {
    async function load() {
      if (!bookId) { setIsLoading(false); return; }
      try {
        setIsLoading(true);
        setError(null);
        const [page, booksData, progressData, sectionTrail] = await Promise.all([
          hadithsService.getHadithsPaged(bookId, effectiveSectionId, pageNumber, HADITHS_PER_PAGE),
          booksService.getBooks().catch(() => []),
          hadithsService.getHadithProgress(bookId).catch(() => []),
          effectiveSectionId
            ? booksService.getSectionTrail(effectiveSectionId).catch(() => [])
            : Promise.resolve([]),
        ]);

        const book = booksData.find((b) => String(b.id) === String(bookId));
        setBookTitle(book?.title || "");
        setTrail(sectionTrail);
        setHadiths(page.items);
        setTotalPages(page.totalPages || 0);
        setTotalCount(page.totalCount || 0);

        const pMap = {};
        if (Array.isArray(progressData)) {
          progressData.forEach((item) => {
            const hId = item.hadithId ?? item.id;
            const st = item.status ?? item.progressStatus ?? 0;
            if (hId != null) {
              pMap[hId] = parseStatus(st);
            }
          });
        }
        setProgressMap(pMap);
      } catch (err) {
        console.error("Error loading hadiths:", err.message);
        setError("تعذَّر تحميل الأحاديث، يرجى المحاولة لاحقاً.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [bookId, sectionId, pageNumber]);

  /** Navigate to the Study page for a specific hadith and update status to 1 (InProgress) if 0 (NotStarted) */
  const handleAction = async (hadith) => {
    const currentStatus = getHadithStatus(hadith.id);
    const targetSection = sectionId || hadith.hadithSectionId || 0;

    // If status is NotStarted (0), update to InProgress (1)
    if (currentStatus === STATUS.NOT_STARTED) {
      setProgressMap((prev) => ({ ...prev, [hadith.id]: STATUS.IN_PROGRESS }));
      hadithsService.updateHadithProgress(hadith.id, STATUS.IN_PROGRESS).catch((err) => {
        console.warn("Could not update hadith progress on server:", err.message);
      });
    }

    navigate(`/library/${bookId}/${targetSection}/${hadith.id}`);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* ── Page content ── */}
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        {/* ── Top bar ── */}
        <Navbar activePage="library" />

        {/* ── Breadcrumb / back links ── */}
        <div className="flex items-center gap-2 mb-6 text-sm font-2 text-base-content/60 flex-wrap">
          <button
            onClick={() => navigate("/library")}
            className="flex items-center gap-1 hover:text-cyan-700 transition-colors"
          >
            <IoLibraryOutline className="text-base" />
            <span>المكتبة</span>
          </button>
          <IoChevronBack className="text-xs" />
          {trail.length > 0 ? (
            <button
              onClick={() => navigate(`/library/${bookId}/sections`)}
              className="flex items-center gap-1 hover:text-cyan-700 transition-colors line-clamp-1"
            >
              <IoLayersOutline className="text-base" />
              <span>{bookTitle || "الأقسام"}</span>
            </button>
          ) : (
            <span className="text-base-content/90 font-medium">
              {bookTitle || "فهرس الأحاديث"}
            </span>
          )}

          {/* The path down to this section, so it does not collapse to the book name. */}
          {trail.map((section, idx) => {
            const isCurrent = idx === trail.length - 1;
            return (
              <span key={section.id} className="flex items-center gap-2">
                <IoChevronBack className="text-xs" />
                {isCurrent ? (
                  <span className="text-base-content/90 font-medium line-clamp-1">
                    {section.name}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(`/library/${bookId}/sections/${section.id}`)}
                    className="hover:text-cyan-700 transition-colors line-clamp-1"
                  >
                    {section.name}
                  </button>
                )}
              </span>
            );
          })}
        </div>

        {/* ── Page title ── */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <IoListOutline className="text-3xl text-cyan-600" />
            <h1 className="font-1 font-bold text-2xl sm:text-3xl text-base-content">
              فهرس {bookTitle}
            </h1>
          </div>
        </header>

        {/* ── Content ── */}
        {error ? (
          <div role="alert" className="alert alert-error font-2">
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* Results count & View Mode Toggle Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-2 font-2 text-sm text-base-content/50 flex-wrap">
              <p>
                {isLoading
                  ? "جاري استحضار الأحاديث الشريفة ..."
                  : hadiths.length > 0
                    ? `يتوفر ${hadiths.length} حديثاً`
                    : "لم نجد أحاديث مطابقة"}
              </p>

              <div className="flex items-center gap-2">
                {/* Mobile Column Sub-Toggle (visible on mobile screens when in Cards mode) */}
                {viewMode === "cards" && (
                  <div
                    className="flex items-center gap-0.5 sm:hidden bg-base-100 p-1 rounded-xl border border-base-200 shadow-xs"
                    role="radiogroup"
                    aria-label="عدد الكروت في الصف للموبايل"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={mobileColumns === "1"}
                      onClick={() => handleMobileColumnsChange("1")}
                      className={`btn btn-xs rounded-lg gap-1 transition-all ${
                        mobileColumns === "1"
                          ? "bg-cyan-700 text-white border-none shadow-xs"
                          : "btn-ghost text-base-content/60 hover:text-base-content"
                      }`}
                      title="عرض كرت واحد في الصف"
                    >
                      <IoListOutline className="text-xs" />
                      <span className="text-[10px]">1</span>
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={mobileColumns === "2"}
                      onClick={() => handleMobileColumnsChange("2")}
                      className={`btn btn-xs rounded-lg gap-1 transition-all ${
                        mobileColumns === "2"
                          ? "bg-cyan-700 text-white border-none shadow-xs"
                          : "btn-ghost text-base-content/60 hover:text-base-content"
                      }`}
                      title="عرض كرتين في الصف"
                    >
                      <IoGridOutline className="text-xs" />
                      <span className="text-[10px]">2</span>
                    </button>
                  </div>
                )}

                {/* View Mode Switcher (Table vs Cards) */}
                <div
                  className="flex items-center gap-1 bg-base-100 p-1 rounded-xl border border-base-200 shadow-xs"
                  role="radiogroup"
                  aria-label="طريقة العرض"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={viewMode === "table"}
                    onClick={() => handleViewModeChange("table")}
                    className={`btn btn-xs rounded-lg gap-1.5 transition-all ${
                      viewMode === "table"
                        ? "bg-cyan-700 text-white border-none shadow-xs"
                        : "btn-ghost text-base-content/60 hover:text-base-content"
                    }`}
                    title="عرض جدول"
                    aria-label="عرض جدول"
                  >
                    <IoListOutline className="text-sm" />
                    <span className="font-2 text-[11px]">جدول</span>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={viewMode === "cards"}
                    onClick={() => handleViewModeChange("cards")}
                    className={`btn btn-xs rounded-lg gap-1.5 transition-all ${
                      viewMode === "cards"
                        ? "bg-cyan-700 text-white border-none shadow-xs"
                        : "btn-ghost text-base-content/60 hover:text-base-content"
                    }`}
                    title="عرض كروت"
                    aria-label="عرض كروت"
                  >
                    <IoGridOutline className="text-sm" />
                    <span className="font-2 text-[11px]">كروت</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── 1. Table View ── */}
            {viewMode === "table" && (
              <div className="overflow-x-auto rounded-2xl border border-base-200 bg-base-100 shadow-sm">
                <table className="table table-zebra font-2 w-full [&_th]:px-2 [&_th]:sm:px-4 [&_td]:px-2 [&_td]:sm:px-4">
                  {/* Head */}
                  <thead>
                    <tr className="bg-base-200 text-base-content/70 text-xs">
                      <th className="text-center w-8 px-1 sm:w-10 sm:px-4">#</th>
                      <th className="whitespace-nowrap">رقم الحديث</th>
                      <th className="hidden md:table-cell">العنوان</th>
                      <th className="whitespace-nowrap">حالة الحفظ</th>
                      <th className="text-center whitespace-nowrap">الإجراء</th>
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody>
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map((n) => <SkeletonRow key={n} />)
                    ) : hadiths.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-base-content/50 font-2">
                          لا توجد أحاديث في هذا القسم
                        </td>
                      </tr>
                    ) : (
                      hadiths.map((hadith, idx) => {
                        const status = getHadithStatus(hadith.id);
                        const cfg = STATUS_CONFIG[status];
                        return (
                          <tr
                            key={hadith.id ?? idx}
                            className="hover:bg-base-200/60 transition-colors"
                          >
                            {/* Row number */}
                            <td className="text-center font-2 text-xs text-base-content/50 px-1 sm:px-4">
                              {idx + 1}
                            </td>

                            {/* Hadith number */}
                            <td className="whitespace-nowrap">
                              <span className="font-2 font-semibold text-xs sm:text-sm text-cyan-700">
                                {hadith.hadithLabel}
                              </span>
                            </td>

                            {/* Title (md+) */}
                            <td className="hidden md:table-cell">
                              <span className="font-2 text-sm text-base-content/80 line-clamp-1">
                                {hadith.title || "—"}
                              </span>
                            </td>

                            {/* Status badge */}
                            <td className="whitespace-nowrap">
                              <span className={`badge badge-xs sm:badge-sm font-2 inline-flex items-center gap-1 whitespace-nowrap ${cfg.badgeClass}`}>
                                {cfg.icon}
                                <span>{cfg.label}</span>
                              </span>
                            </td>

                            {/* Action button */}
                            <td className="text-center whitespace-nowrap">
                              <button
                                onClick={() => handleAction(hadith)}
                                className={`btn btn-xs sm:btn-sm rounded-full font-2 px-3.5 sm:w-32 justify-center whitespace-nowrap shrink-0 ${ACTION_CLASS[status]}`}
                              >
                                {ACTION_LABEL[status]}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── 2. Responsive Cards View (Supports 1 or 2 columns on mobile, up to 4 columns on desktop) ── */}
            {viewMode === "cards" && (
              <div
                className={`grid ${
                  mobileColumns === "1" ? "grid-cols-1 gap-3" : "grid-cols-2 gap-2.5"
                } sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4 transition-all duration-300`}
              >
                {isLoading ? (
                  [1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className="card bg-base-100 border border-base-200 shadow-sm p-4 flex flex-col gap-2.5 animate-pulse rounded-2xl"
                    >
                      <div className="flex justify-between items-center">
                        <div className="h-3 w-1/3 bg-base-300 rounded" />
                        <div className="h-3 w-1/3 bg-base-300 rounded" />
                      </div>
                      <div className="h-4 w-full bg-base-300 rounded mt-1" />
                      <div className="h-3 w-2/3 bg-base-300 rounded" />
                      <div className="h-8 w-full bg-base-300 rounded-full mt-2" />
                    </div>
                  ))
                ) : hadiths.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center py-16 gap-4 text-center">
                    <IoListOutline className="text-5xl text-base-content/20" />
                    <p className="font-2 text-base-content/50">لا توجد أحاديث في هذا القسم</p>
                  </div>
                ) : (
                  hadiths.map((hadith, idx) => {
                    const status = getHadithStatus(hadith.id);
                    return (
                      <HadithMobileCard
                        key={hadith.id ?? idx}
                        hadith={hadith}
                        status={status}
                        isSingleColumn={mobileColumns === "1"}
                        onAction={handleAction}
                      />
                    );
                  })
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8 font-2" dir="rtl">
                <button
                  type="button"
                  onClick={() => setPageNumber((n) => Math.max(1, n - 1))}
                  disabled={pageNumber <= 1}
                  className="btn btn-sm rounded-xl disabled:opacity-40"
                >
                  السابق
                </button>

                <span className="text-sm text-base-content/60">
                  صفحة {pageNumber} من {totalPages} · {totalCount} حديث
                </span>

                <button
                  type="button"
                  onClick={() => setPageNumber((n) => Math.min(totalPages, n + 1))}
                  disabled={pageNumber >= totalPages}
                  className="btn btn-sm rounded-xl disabled:opacity-40"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
