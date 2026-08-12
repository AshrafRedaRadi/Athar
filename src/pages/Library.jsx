import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { IoBookOutline } from "react-icons/io5";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import Navbar from "../components/shared/Navbar";
import CategoryFilters from "../components/shared/CategoryFilters";
import Card from "../components/library/Card";
import GuestLoginModal from "../components/auth/GuestLoginModal";
import { booksService } from "../services/booksService";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../context/AuthContext";

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
  const { isGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

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
    if (isGuest) {
      setIsGuestModalOpen(true);
      return;
    }
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
    } catch {
      navigate(`/library/${book.id}/0`);
    }
  };

  // Client-side filter on books list (only display visible books to public users)
  const filteredBooks = books.filter((book) => {
    const isVisible = book.status !== "مخفي";
    const matchesSearch = (book.title || "").includes(searchQuery) || (book.author || "").includes(searchQuery);
    const matchesCategory = activeCategory === "الكل" || book.category === activeCategory;
    return isVisible && matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-base-200">
      {/* ── Page content ── */}
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">

        {/* ── Unified Navbar with Search Slot ── */}
        <Navbar
          activePage="library"
          searchSlot={
            <label className="input input-bordered flex items-center gap-2 w-full max-w-xl mx-auto font-2 bg-base-100 shadow-sm text-sm">
              <FiSearch className="text-base-content/40 text-lg shrink-0" />
              <input
                id="library-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في المكتبة ..."
                className="grow"
                aria-label="بحث في المكتبة"
              />
            </label>
          }
        />

        {/* ── Page title ── */}
        <header className="text-center mb-8 mt-4 sm:mt-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <IoBookOutline className="text-3xl text-cyan-700 dark:text-cyan-400" />
            <h1 className="font-1 font-bold text-2xl sm:text-3xl text-base-content">
              مكتبة المتون
            </h1>
          </div>
          <p className="font-2 text-base-content/60 text-sm">
            تصفح واختر من مجموعة واسعة من المتون العلمية والأحاديث النبوية
            لحفظها ومراجعتها
          </p>
        </header>

        {/* ── Category filter tabs (Shared Component) ── */}
        <CategoryFilters
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          categories={MOCK_CATEGORIES}
        />

        {/* ── Books grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card bg-base-100 h-64 animate-pulse border border-base-200 rounded-2xl p-4 flex flex-col justify-between">
                <div className="w-full h-32 bg-base-300 rounded-xl mb-3" />
                <div className="w-3/4 h-4 bg-base-300 rounded mb-2" />
                <div className="w-1/2 h-3 bg-base-300 rounded" />
              </div>
            ))}
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
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
                  if (isGuest) {
                    setIsGuestModalOpen(true);
                  } else {
                    console.log("Adding book:", book.title);
                  }
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

        {/* ── Guest Login Modal ── */}
        <GuestLoginModal
          isOpen={isGuestModalOpen}
          onClose={() => setIsGuestModalOpen(false)}
          title="تسجيل الدخول فتح الكتب"
          message="تصفح وحفظ هذا المتن يتطلب تسجيل الدخول إلى حسابك."
        />

      </main>
    </div>
  );
}
