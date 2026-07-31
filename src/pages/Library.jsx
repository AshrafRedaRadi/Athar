import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { IoBookOutline } from "react-icons/io5";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import Sidebar from "../components/Sidebar";
import Dock from "../components/Dock";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { booksService } from "../services/booksService";
import { useTheme } from "../hooks/useTheme";
import logo from "../assets/logo.png"; // TODO: come from backend / context
import user from "../assets/user.png"; // TODO: come from backend / context

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

/*
const MOCK_BOOKS = [
  { id: 1, title: "متن الآجرومية",         author: "ابن آجروم",             level: "مبتدئ",  category: "اللغة العربية" },
  { id: 2, title: "صحيح البخاري",           author: "الإمام البخاري",        level: "متقدم",  category: "الحديث" },
  { id: 3, title: "عمدة الأحكام",           author: "عبد الغني المقدسي",    level: "متوسط",  category: "الحديث" },
  { id: 4, title: "الأربعون النووية",       author: "الإمام النووي",         level: "مبتدئ",  category: "الحديث" },
  { id: 5, title: "رياض الصالحين",          author: "الإمام النووي",         level: "متوسط",  category: "الحديث" },
  { id: 6, title: "متن العقيدة الطحاوية",  author: "الإمام الطحاوي",        level: "متوسط",  category: "العقيدة" },
  { id: 7, title: "الورقات",                author: "إمام الحرمين الجويني", level: "مبتدئ",  category: "الفقه" },
  { id: 8, title: "متن أبي شجاع",           author: "أبو شجاع الأصفهاني",   level: "مبتدئ",  category: "الفقه" },
];
*/

// ─────────────────────────────────────────────
//  Library Page
// ─────────────────────────────────────────────
export default function Library() {
  const [searchQuery,     setSearchQuery]    = useState("");
  const [activeCategory,  setActiveCategory] = useState("الكل");
  const [books,           setBooks]          = useState([]);
  const [isLoading,       setIsLoading]      = useState(true);

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
    } catch {
      navigate(`/library/${book.id}/0`);
    }
  };

  // Client-side filter on books list
  const filteredBooks = books.filter((book) => {
    const matchesSearch   = (book.title || "").includes(searchQuery) || (book.author || "").includes(searchQuery);
    const matchesCategory = activeCategory === "الكل" || book.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-base-200">

      {/* Sidebar – desktop only (lg+) */}
      <div className="hidden lg:block">
        <Sidebar logo={logo} user={user} activePage="library" />
      </div>

      {/* Dock – mobile & tablet (below lg) */}
      <div className="block lg:hidden">
        <Dock activePage="library" />
      </div>

      {/* ── Page content ── */}
      <main className="px-3 sm:px-8 py-8 pt-3 pb-20 lg:pb-8" dir="rtl">

        {/* ── Search bar row with profile avatar ── */}
        <PageHeader
          searchSlot={
            <label className="input input-bordered flex items-center gap-2 w-full max-w-xl mx-auto font-2 bg-base-100 shadow-sm text-sm">
              <FiSearch className="text-base-content/40 text-lg shrink-0" />
              <input
                id="library-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في المتون والأحاديث..."
                className="grow"
                aria-label="بحث في المتون"
              />
            </label>
          }
        />

        {/* ── Page title ── */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <IoBookOutline className="text-3xl text-cyan-600" />
            <h1 className="font-1 font-bold text-3xl text-base-content">
              مكتبة المتون
            </h1>
          </div>
          <p className="font-2 text-base-content/60 text-sm">
            تصفح واختر من مجموعة واسعة من المتون العلمية والأحاديث النبوية
            لحفظها ومراجعتها
          </p>
        </header>

        {/* ── Category filter tabs ── */}
        <div
          className="flex flex-wrap items-center gap-2 mb-6"
          role="tablist"
          aria-label="تصنيفات المتون"
        >
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              id={`cat-btn-${cat.id}`}
              role="tab"
              aria-selected={activeCategory === cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`
                btn btn-sm rounded-full font-2 transition-all duration-200
                ${activeCategory === cat.label
                  ? "bg-2 text-white border-transparent shadow-md"
                  : "btn-outline border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200"}
              `}
            >
              {cat.label}
            </button>
          ))}

          {/* Advanced filter button */}
          <button
            id="library-filter-btn"
            className="btn btn-sm btn-square btn-outline border-base-300 bg-base-100
                       hover:bg-2 hover:text-white hover:border-transparent
                       ms-auto transition-colors duration-200"
            aria-label="فلتر متقدم"
          >
            <HiOutlineAdjustmentsHorizontal className="text-base" />
          </button>
        </div>

        {/* ── Results count ── */}
        <p className="font-2 text-sm text-base-content/50 mb-4">
          {isLoading ? "جاري استحضار الكتب والمتون ..." : filteredBooks.length > 0 ? `يتوفر ${filteredBooks.length} متناً` : "لم نجد متوناً مطابقة"}
        </p>

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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {filteredBooks.map((book) => (
              <button
                key={book.id}
                onClick={() => handleBookClick(book)}
                className="block text-start w-full"
                aria-label={book.title}
              >
                <Card
                  title={book.title}
                  author={book.author}
                  level={book.level}
                  category={book.category}
                  coverImage={book.coverImage}
                  onAdd={(e) => {
                    e.stopPropagation();
                    console.log("Adding book:", book.title);
                  }}
                />
              </button>
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
