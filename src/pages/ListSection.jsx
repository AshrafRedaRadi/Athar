import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoLayersOutline, IoLibraryOutline } from "react-icons/io5";
import { IoChevronBack } from "react-icons/io5";
import Navbar from "../components/Navbar";
import { booksService } from "../services/booksService";
import logo from "../assets/logo.png";
import user from "../assets/user.png";

// ─────────────────────────────────────────────
//  ListSection Page
//  Route: /library/:bookId/sections
// ─────────────────────────────────────────────
export default function ListSection() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [bookTitle, setBookTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      if (!bookId) { setIsLoading(false); return; }
      try {
        setIsLoading(true);
        setError(null);
        const [sectionsData, booksData] = await Promise.all([
          booksService.getBookSections(bookId),
          booksService.getBooks().catch(() => []),
        ]);

        const book = booksData.find((b) => String(b.id) === String(bookId));
        setBookTitle(book?.title || "");
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
      } catch (err) {
        console.error("Error loading sections:", err.message);
        setError("تعذَّر تحميل الأقسام، يرجى المحاولة لاحقاً.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [bookId]);

  const handleSectionClick = (section) => {
    navigate(`/library/${bookId}/${section.id}`);
  };

  // ── Skeleton placeholders while loading ──────────────────────────────────
  const SkeletonCard = () => (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-5 flex flex-col gap-3 animate-pulse">
      <div className="w-1/3 h-3 bg-base-300 rounded" />
      <div className="w-2/3 h-5 bg-base-300 rounded" />
      <div className="w-full h-3 bg-base-300 rounded" />
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200">
      {/* ── Page content ── */}
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        {/* ── Top bar ── */}
        <Navbar activePage="library" />

        {/* ── Breadcrumb / back link ── */}
        <div className="flex items-center gap-2 mb-6 text-sm font-2 text-base-content/60">
          <button
            onClick={() => navigate("/library")}
            className="flex items-center gap-1 hover:text-cyan-700 transition-colors"
          >
            <IoLibraryOutline className="text-base" />
            <span>المكتبة</span>
          </button>
          <IoChevronBack className="text-xs" />
          <span className="text-base-content/90 font-medium line-clamp-1">
            {bookTitle || "أقسام الكتاب"}
          </span>
        </div>

        {/* ── Page title ── */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <IoLayersOutline className="text-3xl text-cyan-600" />
            <h1 className="font-1 font-bold text-3xl text-base-content">أقسام الكتاب</h1>
          </div>
          {bookTitle && (
            <p className="font-2 text-base-content/60 text-sm">{bookTitle}</p>
          )}
        </header>

        {/* ── Content ── */}
        {isLoading ? (
          /* Skeleton grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : error ? (
          /* Error alert */
          <div role="alert" className="alert alert-error font-2">
            <span>{error}</span>
          </div>
        ) : sections.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <IoLayersOutline className="text-6xl text-base-content/20" />
            <p className="font-2 text-base-content/60 text-lg max-w-md">
              لا توجد أقسام لهذا الكتاب
            </p>
          </div>
        ) : (
          /* Sections grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section, idx) => (
              <button
                key={section.id ?? idx}
                onClick={() => handleSectionClick(section)}
                className="card bg-base-100 border border-base-200 shadow-md hover:shadow-xl
                           transition-all duration-300 hover:-translate-y-1 text-start w-full p-0"
                aria-label={section.title || section.name}
              >
                <div className="card-body p-5 gap-2">
                  {/* Section number badge */}
                  <span className="badge badge-sm bg-cyan-700/10 text-cyan-800 dark:text-cyan-300 border-cyan-700/20 font-2 mb-1">
                    القسم {idx + 1}
                  </span>

                  {/* Section title */}
                  <h2 className="card-title font-1 font-bold text-base text-base-content leading-snug">
                    {section.title || section.name || `القسم ${idx + 1}`}
                  </h2>

                  {/* Hadith count if available */}
                  {section.hadithCount != null && (
                    <p className="font-2 text-xs text-base-content/50">
                      {section.hadithCount} حديث
                    </p>
                  )}

                  {/* Description if available */}
                  {section.description && (
                    <p className="font-2 text-sm text-base-content/70 line-clamp-2">
                      {section.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
