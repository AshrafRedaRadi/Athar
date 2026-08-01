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
} from "react-icons/io5";
import Navbar from "../components/Navbar";
import GuestLoginModal from "../components/auth/GuestLoginModal";
import { hadithsService } from "../services/hadithsService";
import { booksService } from "../services/booksService";
import { useAuth } from "../context/AuthContext";
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
          {hadith.hadithNumber}
        </span>
        <span className={`badge font-2 ${cfg.badgeClass} ${isSingleColumn ? "badge-sm" : "badge-xs"}`}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {/* Title */}
      <p className={`font-1 font-bold text-base-content leading-snug my-auto ${isSingleColumn ? "text-sm" : "text-xs line-clamp-2"}`}>
        {hadith.title || hadith.hadithNumber}
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
  const { isGuest } = useAuth();

  // sectionId "0" means the book has no sections → fetch all hadiths without sectionId filter
  const effectiveSectionId = sectionId === "0" ? null : sectionId;

  const [hadiths, setHadiths] = useState([]);
  const [bookTitle, setBookTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  // Mobile layout switcher state ("1" card or "2" cards per row, persisted in localStorage)
  const [mobileColumns, setMobileColumns] = useState(() => {
    return localStorage.getItem("athar_mobile_hadith_cols") || "2";
  });

  const handleMobileColumnsChange = (cols) => {
    setMobileColumns(cols);
    localStorage.setItem("athar_mobile_hadith_cols", cols);
  };

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
    if (isGuest) {
      setIsGuestModalOpen(true);
      return;
    }
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
            {/* Results count & Mobile View Mode Toggle Radio Buttons */}
            <div className="flex items-center justify-between mb-4 gap-2 font-2 text-sm text-base-content/50">
              <p>
                {isLoading
                  ? "جاري استحضار الأحاديث الشريفة ..."
                  : hadiths.length > 0
                    ? `يتوفر ${hadiths.length} حديثاً`
                    : "لم نجد أحاديث مطابقة"}
              </p>

              {/* Mobile Columns Radio Toggle (1 card vs 2 cards per row) */}
              <div
                className="flex items-center gap-1 sm:hidden bg-base-100 p-1 rounded-xl border border-base-200 shadow-xs"
                role="radiogroup"
                aria-label="عرض الكروت في الموبايل"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={mobileColumns === "1"}
                  onClick={() => handleMobileColumnsChange("1")}
                  className={`btn btn-xs rounded-lg gap-1 transition-all ${mobileColumns === "1"
                    ? "bg-cyan-700 text-white border-none shadow-xs"
                    : "btn-ghost text-base-content/60 hover:text-base-content"
                    }`}
                  title="عرض كرت واحد في الصف"
                  aria-label="عرض كرت واحد في الصف"
                >
                  <IoListOutline className="text-sm" />
                  <span className="text-[10px]">1</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={mobileColumns === "2"}
                  onClick={() => handleMobileColumnsChange("2")}
                  className={`btn btn-xs rounded-lg gap-1 transition-all ${mobileColumns === "2"
                    ? "bg-cyan-700 text-white border-none shadow-xs"
                    : "btn-ghost text-base-content/60 hover:text-base-content"
                    }`}
                  title="عرض كرتين في الصف"
                  aria-label="عرض كرتين في الصف"
                >
                  <IoGridOutline className="text-sm" />
                  <span className="text-[10px]">2</span>
                </button>
              </div>
            </div>

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
                              className={`btn btn-xs sm:btn-sm rounded-full font-2 px-10 ${ACTION_CLASS[status]}`}
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

            {/* ── Mobile card list (below sm) — Dynamic 1 or 2 cards per row ── */}
            <div
              className={`grid ${mobileColumns === "1" ? "grid-cols-1 gap-3" : "grid-cols-2 gap-2.5"
                } sm:hidden transition-all duration-300`}
            >
              {isLoading ? (
                [1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="card bg-base-100 border border-base-200 shadow-sm p-3 flex flex-col gap-2 animate-pulse rounded-2xl"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-1/3 bg-base-300 rounded" />
                      <div className="h-3 w-1/3 bg-base-300 rounded" />
                    </div>
                    <div className="h-4 w-full bg-base-300 rounded mt-1" />
                    <div className="h-3 w-2/3 bg-base-300 rounded" />
                    <div className="h-6 w-full bg-base-300 rounded-full mt-2" />
                  </div>
                ))
              ) : hadiths.length === 0 ? (
                <div
                  className={`${mobileColumns === "1" ? "" : "col-span-2"
                    } flex flex-col items-center py-16 gap-4 text-center`}
                >
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
                      isSingleColumn={mobileColumns === "1"}
                      onAction={handleAction}
                    />
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ── Guest Login Modal ── */}
        <GuestLoginModal
          isOpen={isGuestModalOpen}
          onClose={() => setIsGuestModalOpen(false)}
          title="تسجيل الدخول لبدء الحفظ"
          message="بدء حفظ أو مراجعة هذا الحديث والتسميع بالصوت يتطلب تسجيل الدخول إلى حسابك."
        />

      </main>
    </div>
  );
}
