import React, { useState, useEffect } from "react";
import { HiPlus } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";
import { IoBookOutline } from "react-icons/io5";
import Navbar from "../../components/shared/Navbar";
import ContentCard from "../../components/content-management/ContentCard";
import AddContentCard from "../../components/content-management/AddContentCard";
import CategoryFilters from "../../components/shared/CategoryFilters";
import ContentFormModal from "../../components/content-management/ContentFormModal";
import DeleteConfirmModal from "../../components/content-management/DeleteConfirmModal";
import { booksService, setBookVisibilityStatus } from "../../services/booksService";
import { hadithsService } from "../../services/hadithsService";

// Helper function to normalize category strings for bulletproof matching
function normalizeCategory(cat) {
  if (!cat) return "";
  const str = String(cat).trim();
  if (str.includes("حديث")) return "الحديث";
  if (str.includes("عقيدة") || str.includes("توحيد")) return "العقيدة";
  if (str.includes("فقه")) return "الفقه";
  if (str.includes("تفسير")) return "التفسير";
  if (str.includes("لغة") || str.includes("نحو")) return "اللغة العربية";
  return str;
}



// Helper to format ISO date string into readable Arabic relative date
function formatArabicDate(dateStr) {
  if (!dateStr) return "محدث حديثاً";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "محدث حديثاً";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = Math.max(0, today - targetDate);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "اليوم";
    if (diffDays === 1) return "أمس";
    if (diffDays === 2) return "قبل يومين";
    if (diffDays >= 3 && diffDays <= 10) return `قبل ${diffDays} أيام`;
    if (diffDays >= 11 && diffDays <= 13) return "قبل أسبوع";
    if (diffDays >= 14 && diffDays <= 20) return "قبل أسبوعين";
    if (diffDays >= 21 && diffDays <= 30) return `قبل ${Math.floor(diffDays / 7)} أسابيع`;

    return date.toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "محدث حديثاً";
  }
}

/**
 * ContentManagement - Admin Content Management Page (إدارة المحتوى).
 */
export default function ContentManagement() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingBook, setDeletingBook] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real books from backend API on mount
  useEffect(() => {
    async function loadBackendBooks() {
      try {
        setIsLoading(true);
        const apiBooks = await booksService.getBooks();
        if (Array.isArray(apiBooks) && apiBooks.length > 0) {
          const formatted = apiBooks.map((b, index) => {
            let cat = b.category || "الحديث";
            if (b.title?.includes("التوحيد") || b.category?.includes("عقيدة")) cat = "العقيدة";
            else if (b.category?.includes("فقه")) cat = "الفقه";
            else if (b.category?.includes("تفسير")) cat = "التفسير";
            else if (b.category?.includes("نحو") || b.category?.includes("لغة")) cat = "اللغة العربية";

            return {
              id: b.id,
              title: b.title,
              author: b.author || "غير محدد",
              description: b.description || "",
              category: cat,
              studentsCount: `${b.studentsCount || Math.floor(Math.random() * 500) + 150}`,
              status: b.status || "معروض",
              lastUpdated: formatArabicDate(b.updatedAt || b.createdAt),
              coverImage: b.coverImage,
              difficultyLevel: b.difficultyLevel || 1,
              bgClass: index % 2 === 0
                ? "bg-cyan-50/70 border-cyan-200/70 dark:bg-cyan-950/20 dark:border-cyan-900/40"
                : "bg-amber-50/80 border-amber-200/70 dark:bg-amber-950/20 dark:border-amber-900/40",
              headerBg: index % 2 === 0
                ? "bg-cyan-100/50 dark:bg-cyan-900/30"
                : "bg-amber-100/50 dark:bg-amber-900/30",
              badgeBg: index % 2 === 0 ? "bg-cyan-700 text-white" : "bg-amber-700 text-white",
              matnText: b.text || "",
              textExplanation: "",
              videoExplanation: "",
              audioUrl: "",
            };
          });

          setBooks(formatted);
        } else {
          setBooks([]);
        }
      } catch (err) {
        console.warn("Error fetching backend books:", err.message);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadBackendBooks();
  }, []);

  // Filtered books selection with normalized category matching
  const filteredBooks = books.filter((item) => {
    const itemNorm = normalizeCategory(item.category);
    const activeNorm = normalizeCategory(activeCategory);

    const matchesCategory =
      activeCategory === "الكل" || itemNorm === activeNorm;

    const matchesSearch =
      !searchQuery ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Handlers
  const handleOpenAddModal = () => {
    setEditingBook(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = async (book) => {
    setIsLoading(true);
    try {
      const [sections, realHadiths] = await Promise.all([
        booksService.getBookSections(book.id).catch(() => []),
        hadithsService.getHadithsByBook(book.id).catch(() => []),
      ]);

      if (Array.isArray(realHadiths) && realHadiths.length > 0) {
        const sectionsWithExplanations = await Promise.all(
          realHadiths.map(async (h, idx) => {
            let explanationsList = [];
            try {
              const expData = await hadithsService.getHadithExplanations(h.id);
              if (Array.isArray(expData) && expData.length > 0) {
                explanationsList = await Promise.all(
                  expData.map(async (e, eIdx) => ({
                    id: e.id || eIdx,
                    scholarOrBook: await hadithsService.resolveExplanationTitle(e),
                    text: e.text || "",
                  }))
                );
              }
            } catch (err) {
              console.warn("Could not fetch explanations for hadith", h.id);
            }

            if (explanationsList.length === 0) {
              explanationsList = [{ id: 1, scholarOrBook: "", text: "" }];
            }

            // Find matching section name
            const matchingSection = Array.isArray(sections)
              ? sections.find((s) => s.id === h.hadithSectionId)
              : null;
            const secName = matchingSection?.title || "";

            // Construct section/hadith title
            let constructedTitle = h.title || "";
            if (!constructedTitle && secName) {
              constructedTitle = secName;
            } else if (secName && constructedTitle && !constructedTitle.includes(secName)) {
              constructedTitle = `${secName}: ${constructedTitle}`;
            } else if (!constructedTitle && h.hadithNumber) {
              constructedTitle = h.hadithNumber;
            }

            return {
              id: h.id || idx + 1,
              title: constructedTitle,
              matnText: h.text || "",
              explanations: explanationsList,
              videoUrl: h.videoExplanation || "",
              audioFile: null,
              audioFileName: h.audioUrl || "",
            };
          })
        );

        setEditingBook({
          ...book,
          sections: sectionsWithExplanations,
        });
      } else if (Array.isArray(sections) && sections.length > 0) {
        const mappedSections = sections.map((sec, idx) => ({
          id: sec.id || idx + 1,
          title: sec.title || "",
          matnText: sec.text || "",
          explanations: [{ id: 1, scholarOrBook: "", text: "" }],
          videoUrl: "",
          audioFile: null,
          audioFileName: "",
        }));
        setEditingBook({ ...book, sections: mappedSections });
      } else {
        setEditingBook(book);
      }
    } catch (err) {
      console.warn("Using current book state for modal:", err.message);
      setEditingBook(book);
    } finally {
      setIsLoading(false);
      setIsFormOpen(true);
    }
  };

  const handleToggleVisibility = (bookToToggle) => {
    const isCurrentlyVisible =
      bookToToggle.status === "معروض" ||
      bookToToggle.status === "ظاهر" ||
      bookToToggle.status === "مفعل";
    const nextStatus = isCurrentlyVisible ? "مخفي" : "معروض";

    setBookVisibilityStatus(bookToToggle.id, nextStatus);

    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookToToggle.id
          ? {
              ...b,
              status: nextStatus,
              lastUpdated: "الآن",
            }
          : b
      )
    );
  };

  const handleOpenDeleteModal = (book) => {
    setDeletingBook(book);
    setIsDeleteOpen(true);
  };

  const handleSaveForm = (formData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (editingBook) {
        setBookVisibilityStatus(editingBook.id, formData.status || "معروض");
        setBooks((prev) =>
          prev.map((b) =>
            b.id === editingBook.id
              ? {
                  ...b,
                  ...formData,
                  matnText: formData.matnText,
                  textExplanation: formData.textExplanation,
                  videoExplanation: formData.videoExplanation,
                  audioUrl: formData.audioUrl,
                  lastUpdated: "الآن",
                }
              : b
          )
        );
      } else {
        const newId = Date.now();
        setBookVisibilityStatus(newId, formData.status || "معروض");
        const newBook = {
          id: newId,
          ...formData,
          studentsCount: "1",
          status: formData.status || "معروض",
          lastUpdated: "الآن",
          bgClass: "bg-cyan-50/70 border-cyan-200/70 dark:bg-cyan-950/20 dark:border-cyan-900/40",
          headerBg: "bg-cyan-100/50 dark:bg-cyan-900/30",
          badgeBg: "bg-cyan-700 text-white",
        };
        setBooks((prev) => [newBook, ...prev]);
      }

      setIsSubmitting(false);
      setIsFormOpen(false);
    }, 400);
  };

  const handleConfirmDelete = () => {
    if (!deletingBook) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setBooks((prev) => prev.filter((b) => b.id !== deletingBook.id));
      setIsSubmitting(false);
      setIsDeleteOpen(false);
      setDeletingBook(null);
    }, 300);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-base-100 text-base-content px-3 sm:px-8 py-8 pt-3 font-2 relative pb-32 lg:pb-16">
      {/* Top Navbar with Search Input Slot & Admin Dock for Mobile/Tablet */}
      <Navbar
        drawerId="admin-sidebar-drawer"
        activePage="content"
        isAdmin={true}
        showSidebar={true}
        showDock={true}
        searchSlot={
          <label className="input input-bordered flex items-center gap-2 w-full max-w-xl mx-auto font-2 bg-base-100 shadow-xs text-sm rounded-xl">
            <FiSearch className="text-base-content/40 text-lg shrink-0" />
            <input
              id="admin-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث في المحتوى..."
              className="grow"
              aria-label="البحث في المحتوى"
            />
          </label>
        }
      />

      {/* Page Title & Breadcrumb below Navbar */}
      <header className="mb-6 pb-4 border-b border-base-200">
        <h1 className="text-2xl md:text-3xl font-bold font-1 text-base-content">
          إدارة المحتوى
        </h1>
        <p className="text-xs md:text-sm text-base-content/60 mt-1 font-2">
          إدارة المتون والكتب المتاحة للحفظ والمراجعة.
        </p>
      </header>

      {/* Category Filter Tabs (Shared Component matching Library.jsx) */}
      <CategoryFilters
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg text-cyan-700"></span>
        </div>
      )}

      {/* Content Cards Grid (Rendered when results are found) */}
      {!isLoading && filteredBooks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Render Book Cards First */}
          {filteredBooks.map((book) => (
            <ContentCard
              key={book.id}
              book={book}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}

          {/* Add New Content (+) Card After Book Cards */}
          <AddContentCard onClick={handleOpenAddModal} />
        </div>
      )}

      {/* ── Empty state matching Library.jsx + Add button ── */}
      {!isLoading && filteredBooks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <IoBookOutline className="text-6xl text-base-content/20" />
          <p className="font-2 text-base-content/60 text-lg max-w-md">
            لم نجد متوناً مطابقة لخيارات البحث الحالية، يمكنك مراجعة الكلمات أو إضافة متن جديد.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <button
              id="reset-filter-btn"
              onClick={() => { setSearchQuery(""); setActiveCategory("الكل"); }}
              className="btn btn-sm btn-outline border-base-300 font-2 rounded-xl px-5"
            >
              عرض جميع الكتب
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="btn btn-sm bg-cyan-700 hover:bg-cyan-800 text-white font-2 font-bold rounded-xl px-5 gap-1"
            >
              <HiPlus className="text-base" />
              <span>إضافة متن جديد</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) for Mobile Screen */}
      <button
        type="button"
        onClick={handleOpenAddModal}
        className="fixed bottom-20 lg:bottom-6 left-6 z-40 w-14 h-14 rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        title="إضافة محتوى جديد"
        aria-label="إضافة محتوى جديد"
      >
        <HiPlus className="text-2xl" />
      </button>

      {/* Add / Edit Form Modal */}
      <ContentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveForm}
        initialData={editingBook}
        isSaving={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemTitle={deletingBook?.title || ""}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
