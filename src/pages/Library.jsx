import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { IoBookOutline } from "react-icons/io5";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import Navbar from "../components/shared/Navbar";
import CategoryFilters from "../components/shared/CategoryFilters";
import Card from "../components/library/Card";
import { booksService } from "../services/booksService";
import { useTheme } from "../hooks/useTheme";

// ─────────────────────────────────────────────
//  Static mock fallback data (in case API is offline)
// ─────────────────────────────────────────────
const MOCK_CATEGORIES = [
  { id: 1, label: "الكل" },
  { id: 2, label: "الحديث" },
  { id: 3, label: "العقيدة" },
  { id: 4, label: "الفقه" },
  { id: 5, label: "اللغة العربية" },
  { id: 6, label: "التفسير" },
];

// ─────────────────────────────────────────────
//  Library Page
// ─────────────────────────────────────────────
export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch books from real Backend API ──
  useEffect(() => {
    async function loadBooks() {
      try {
        setIsLoading(true);
        const data = await booksService.getBooks();
        setBooks(data || []);
      } catch (err) {
        console.error("Error fetching books from backend API:", err.message);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadBooks();
  }, []);

  // ── Global theme (shared across all pages via ThemeContext) ──
  const { isDark, toggleTheme } = useTheme();

  const navigate = useNavigate();

  // ── Smart navigation: check sections before deciding which page to go to ──
  const handleBookClick = async (book) => {
    try {
      const sections = await booksService.getBookSections(book.id);
      if (Array.isArray(sections) && sections.length > 1) {
        // Multiple sections → show section chooser
        navigate(`/library/${book.id}/sections`);
      } else if (Array.isArray(sections) && sections.length === 1) {
        // Exactly one section → go directly to hadith list for that section
        navigate(`/library/${book.id}/${sections[0].id}`);
      } else {
        // No sections → sectionId=0 means "fetch all hadiths for this book"
        navigate(`/library/${book.id}/0`);
      }
    } catch (err) {
      console.warn("Could not check book sections, navigating to default view:", err.message);
      navigate(`/library/${book.id}/0`);
    }
  };

  // ── Client-side filter: category & search query ──
  const filteredBooks = books.filter((b) => {
    const matchesCategory =
      activeCategory === "الكل" || b.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ── Skeleton placeholders while loading ──
  const SkeletonCard = () => (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 flex flex-col gap-3 animate-pulse">
      <div className="w-full h-40 bg-base-300 rounded-xl" />
      <div className="w-3/4 h-4 bg-base-300 rounded" />
      <div className="w-1/2 h-3 bg-base-300 rounded" />
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200">
      {/* ── Page content ── */}
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        {/* ── Top bar ── */}
        <Navbar activePage="library" />

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col sm:flex-row gap-3 my-6">
          <div className="relative flex-1">
            <FiSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/40 text-lg pointer-events-none" />
            <input
              id="library-search-input"
              type="text"
              placeholder="ابحث في المتون والكتب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pr-10 pl-4 font-2 text-sm bg-base-100 border-base-300 focus:border-cyan-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              id="library-filter-btn"
              className="btn btn-outline border-base-300 text-base-content/70 hover:text-cyan-700 hover:border-cyan-700 font-2 gap-2"
              aria-label="تصفية متقدمة"
            >
              <HiOutlineAdjustmentsHorizontal className="text-lg" />
              <span className="hidden sm:inline">تصفية</span>
            </button>
          </div>
        </div>

        {/* ── Category pills ── */}
        <div className="mb-6">
          <CategoryFilters
            categories={MOCK_CATEGORIES}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

        {/* ── Book Cards Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBooks.map((book) => (
              <Card
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                level={book.level}
                category={book.category}
                coverImage={book.coverImage}
                description={book.description}
                onClick={() => handleBookClick(book)}
                onAdd={(e) => {
                  e.stopPropagation();
                  console.log("Adding book:", book.title);
                }}
              />
            ))}
          </div>
        ) : (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <IoBookOutline className="text-6xl text-base-content/20" />
            <p className="font-2 text-base-content/60 text-lg max-w-md">
              لم نجد متوناً مطابقة لخيارات البحث الحالية، يمكنك مراجعة الكلمات أو إعادة التصفح
            </p>
            <button
              id="reset-filter-btn"
              onClick={() => { setSearchQuery(""); setActiveCategory("الكل"); }}
              className="btn btn-sm btn-outline border-base-300 font-2"
            >
              عرض جميع الكتب
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
