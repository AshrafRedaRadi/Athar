import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  IoListOutline,
  IoLibraryOutline,
  IoLayersOutline,
  IoChevronBack,
  IoPlayOutline,
  IoRefreshOutline,
  IoBookmarkOutline,
} from "react-icons/io5";
import Navbar from "../components/Navbar";
import { hadithsService } from "../services/hadithsService";
import { booksService } from "../services/booksService";
import logo from "../assets/logo.png";
import user from "../assets/user.png";

// ─────────────────────────────────────────────
//  Memorization status helpers
//  (UI-only mock — replace with real user data)
// ─────────────────────────────────────────────

/** Possible memorization statuses */
const STATUS = {
  MEMORIZED: "memorized",       // محفوظ
  IN_PROGRESS: "in_progress",   // قيد الحفظ
  NOT_STARTED: "not_started",   // لم يبدأ الحفظ
};

/** Random mock status for demo (replace with real user data API) */
function getMockStatus(hadithId) {
  const statuses = [STATUS.NOT_STARTED, STATUS.IN_PROGRESS, STATUS.MEMORIZED];
  return statuses[hadithId % 3];
}

/** DaisyUI badge config per status */
const STATUS_CONFIG = {
  [STATUS.MEMORIZED]: {
    label: "محفوظ",
    badgeClass: "badge-success",
    icon: "✅",
  },
  [STATUS.IN_PROGRESS]: {
    label: "قيد الحفظ",
    badgeClass: "badge-warning",
    icon: "🟡",
  },
  [STATUS.NOT_STARTED]: {
    label: "لم يبدأ الحفظ",
    badgeClass: "badge-ghost border-base-300",
    icon: "⚪",
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
//  Mobile Hadith Card (shown below sm breakpoint)
// ─────────────────────────────────────────────
function HadithMobileCard({ hadith, status, onAction }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 flex flex-col gap-2" dir="rtl">
      {/* Header: number + badge */}
      <div className="flex items-center justify-between">
        <span className="font-2 text-xs text-base-content/50">
          {hadith.hadithNumber}
        </span>
        <span className={`badge badge-sm font-2 ${cfg.badgeClass}`}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {/* Title */}
      <p className="font-1 text-sm font-bold text-base-content leading-snug">
        {hadith.title || hadith.hadithNumber}
      </p>

      {/* Narrator */}
      {hadith.narrator && (
        <p className="font-2 text-xs text-base-content/50">
          عن: {hadith.narrator}
        </p>
      )}

      {/* Action button */}
      <button
        onClick={() => onAction(hadith)}
        className={`btn btn-sm rounded-full font-2 mt-1 ${ACTION_CLASS[status]}`}
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

  // sectionId "0" means the book has no sections → fetch all hadiths without sectionId filter
  const effectiveSectionId = sectionId === "0" ? null : sectionId;

  const [hadiths, setHadiths] = useState([]);
  const [bookTitle, setBookTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      if (!bookId) { setIsLoading(false); return; }
      try {
        setIsLoading(true);
        setError(null);
        const [hadithsData, booksData] = await Promise.all([
          hadithsService.getHadithsByBook(bookId, effectiveSectionId),
          booksService.getBooks().catch(() => []),
        ]);

        const book = booksData.find((b) => String(b.id) === String(bookId));
        setBookTitle(book?.title || "");
        setHadiths(Array.isArray(hadithsData) ? hadithsData : []);
      } catch (err) {
        console.error("Error loading hadiths:", err.message);
        setError("تعذَّر تحميل الأحاديث، يرجى المحاولة لاحقاً.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [bookId, sectionId]);

  /** Navigate to the Study page for a specific hadith */
  const handleAction = (hadith) => {
    navigate(`/library/${bookId}/${sectionId}/${hadith.id}`);
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
          <button
            onClick={() => navigate(`/library/${bookId}/sections`)}
            className="flex items-center gap-1 hover:text-cyan-700 transition-colors"
          >
            <IoLayersOutline className="text-base" />
            <span>الأقسام</span>
          </button>
          <IoChevronBack className="text-xs" />
          <span className="text-base-content/90 font-medium">
            {bookTitle || "فهرس الأحاديث"}
          </span>
        </div>

        {/* ── Page title ── */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <IoListOutline className="text-3xl text-cyan-600" />
            <h1 className="font-1 font-bold text-3xl text-base-content">
              فهرس الأحاديث
            </h1>
          </div>
          {bookTitle && (
            <p className="font-2 text-base-content/60 text-sm">{bookTitle}</p>
          )}
        </header>

        {/* ── Content ── */}
        {error ? (
          <div role="alert" className="alert alert-error font-2">
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="font-2 text-sm text-base-content/50 mb-4">
              {isLoading
                ? "جاري استحضار الأحاديث الشريفة ..."
                : hadiths.length > 0
                ? `يتوفر ${hadiths.length} حديثاً`
                : "لم نجد أحاديث مطابقة"}
            </p>

            {/* ── Desktop table (sm and above) ── */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-base-200 bg-base-100 shadow-sm">
              <table className="table table-zebra font-2 w-full">
                {/* Head */}
                <thead>
                  <tr className="bg-base-200 text-base-content/70 text-xs">
                    <th className="text-center w-10">#</th>
                    <th>رقم الحديث</th>
                    <th className="hidden md:table-cell">العنوان</th>
                    <th>حالة الحفظ</th>
                    <th className="text-center">الإجراء</th>
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
                      const status = getMockStatus(hadith.id ?? idx);
                      const cfg = STATUS_CONFIG[status];
                      return (
                        <tr
                          key={hadith.id ?? idx}
                          className="hover:bg-base-200/60 transition-colors"
                        >
                          {/* Row number */}
                          <td className="text-center font-2 text-xs text-base-content/50">
                            {idx + 1}
                          </td>

                          {/* Hadith number */}
                          <td>
                            <span className="font-2 font-semibold text-sm text-cyan-700">
                              {hadith.hadithNumber}
                            </span>
                          </td>

                          {/* Title (md+) */}
                          <td className="hidden md:table-cell">
                            <span className="font-2 text-sm text-base-content/80 line-clamp-1">
                              {hadith.title || "—"}
                            </span>
                          </td>

                          {/* Status badge */}
                          <td>
                            <span className={`badge badge-sm font-2 ${cfg.badgeClass}`}>
                              {cfg.icon} {cfg.label}
                            </span>
                          </td>

                          {/* Action button */}
                          <td className="text-center">
                            <button
                              onClick={() => handleAction(hadith)}
                              className={`btn btn-xs sm:btn-sm rounded-full font-2 ${ACTION_CLASS[status]}`}
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

            {/* ── Mobile card list (below sm) ── */}
            <div className="flex flex-col gap-3 sm:hidden">
              {isLoading ? (
                [1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="card bg-base-100 border border-base-200 shadow-sm p-4 flex flex-col gap-3 animate-pulse"
                  >
                    <div className="h-3 w-1/3 bg-base-300 rounded" />
                    <div className="h-5 w-2/3 bg-base-300 rounded" />
                    <div className="h-8 w-24 bg-base-300 rounded-full" />
                  </div>
                ))
              ) : hadiths.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-4 text-center">
                  <IoListOutline className="text-5xl text-base-content/20" />
                  <p className="font-2 text-base-content/50">لا توجد أحاديث في هذا القسم</p>
                </div>
              ) : (
                hadiths.map((hadith, idx) => {
                  const status = getMockStatus(hadith.id ?? idx);
                  return (
                    <HadithMobileCard
                      key={hadith.id ?? idx}
                      hadith={hadith}
                      status={status}
                      onAction={handleAction}
                    />
                  );
                })
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
