import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { IoBookOutline } from "react-icons/io5";
import { IoIosNotificationsOutline } from "react-icons/io";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import Sidebar from "../components/Sidebar";
import Dock from "../components/Dock";
import Avatar from "../components/Avatar";
import Card from "../components/Card";
import { booksService } from "../services/booksService";
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

  // ── Theme toggle (synced with Sidebar's theme) ──
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    setIsDark(currentTheme === "dark");
  }, []);

  const handleThemeChange = () => {
    const dark = !isDark;
    setIsDark(dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
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
        <div className="flex items-center gap-3 mb-8">
          {/* Profile avatar – visible on mobile/tablet only */}
          <a
            href="#"
            className="shrink-0 lg:hidden"
            aria-label="إعدادات البروفايل"
          >
            <Avatar src={user} size="w-10" />
          </a>

          {/* Spacer for desktop (lg+) – reserves space for Sidebar's fixed avatar */}
          <div className="hidden lg:block w-10 shrink-0" />

          {/* Search bar – always centered */}
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

          {/* Notifications + Dark mode – visible on mobile/tablet only */}
          <div className="flex items-center gap-2 shrink-0 lg:hidden">
            <button
              aria-label="الإشعارات"
              className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-cyan-700"
            >
              <IoIosNotificationsOutline className="text-xl" />
            </button>

            <label className="swap swap-rotate btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-cyan-700">
              <input
                type="checkbox"
                checked={isDark}
                onChange={handleThemeChange}
              />
              {/* Sun */}
              <svg className="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>
              {/* Moon */}
              <svg className="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73A8.15 8.15 0 0 1 9.08 5.49a8.59 8.59 0 0 1 .25-2A1 1 0 0 0 8 2.36 10.14 10.14 0 1 0 22 14.05a1 1 0 0 0-.36-1.05z" />
              </svg>
            </label>
          </div>

          {/* Spacer for desktop (lg+) – balances the notification/theme icons width */}
          <div className="hidden lg:flex w-20 shrink-0" />
        </div>

        {/* ── Page title ── */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <IoBookOutline className="text-3xl text-cyan-600" />
            <h1 className="font-3 font-bold text-3xl text-base-content">
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
              <Link key={book.id} to={`/library/${book.id}/1`} className="block no-underline">
                <Card
                  title={book.title}
                  author={book.author}
                  level={book.level}
                  category={book.category}
                  coverImage={book.coverImage}
                  onAdd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Adding book:", book.title);
                  }}
                />
              </Link>
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
