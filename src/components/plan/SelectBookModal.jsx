import React, { useState, useEffect } from "react";
import { FiSearch, FiX, FiBookOpen, FiCheck } from "react-icons/fi";
import { booksService } from "../../services/booksService";

export default function SelectBookModal({ isOpen, onClose, onSelectBook, selectedBookId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    async function loadBooks() {
      try {
        setIsLoading(true);
        const data = await booksService.getBooks();
        setBooks(data || []);
      } catch (err) {
        console.error("Error loading books for track selection modal:", err);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadBooks();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredBooks = books.filter((b) => {
    const isVisible = b.status !== "مخفي";
    const matchesSearch =
      !searchQuery ||
      (b.title && b.title.includes(searchQuery)) ||
      (b.author && b.author.includes(searchQuery)) ||
      (b.category && b.category.includes(searchQuery));
    return isVisible && matchesSearch;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-base-100 dark:bg-slate-900 border border-base-300 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scaleIn font-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-base-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-base-100/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xl shrink-0">
              <FiBookOpen />
            </div>
            <div>
              <h3 className="font-1 font-bold text-xl text-base-content">
                اختر متناً من المكتبة
              </h3>
              <p className="text-xs text-base-content/60">
                تصفح واختر المسار الذي ترغب في حفظه ومراجعته
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-base-200 dark:bg-slate-800 hover:bg-base-300 text-base-content flex items-center justify-center transition-colors shrink-0"
            aria-label="إغلاق النافذة"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-base-200 dark:border-slate-800 bg-base-200/30 dark:bg-slate-950/30">
          <label className="input input-bordered flex items-center gap-2.5 w-full bg-base-100 dark:bg-slate-900 shadow-xs rounded-2xl text-sm">
            <FiSearch className="text-base-content/40 text-lg shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المتن أو المؤلف أو التصنيف..."
              className="grow"
            />
          </label>
        </div>

        {/* Books List / Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grow space-y-3">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-4 border-cyan-600/20 border-t-cyan-600 rounded-full animate-spin" />
              <p className="text-sm text-base-content/60">جاري تحميل كتب المكتبة...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="py-16 text-center text-base-content/60 space-y-2">
              <FiBookOpen className="text-4xl mx-auto text-base-content/30" />
              <p className="font-bold text-base">لم يتم العثور على أي متون</p>
              <p className="text-xs">جرب البحث بكلمات أخرى</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredBooks.map((book) => {
                const isCurrentSelected = String(selectedBookId) === String(book.id);

                return (
                  <div
                    key={book.id}
                    onClick={() => {
                      onSelectBook(book);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                      isCurrentSelected
                        ? "border-cyan-700 bg-cyan-50/70 dark:bg-cyan-950/40 border-2 shadow-md scale-[1.01]"
                        : "border-base-200/80 dark:border-slate-800 bg-base-100 dark:bg-slate-900 hover:border-cyan-400 hover:shadow-md hover:scale-[1.01]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="badge badge-xs bg-cyan-700/10 text-cyan-800 dark:text-cyan-300 font-bold px-2 py-1 rounded-md text-[10px]">
                          {book.category || "متون علمية"}
                        </span>
                        <h4 className="font-bold text-base text-base-content group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-xs text-base-content/60">
                          المؤلف: {book.author || "غير محدد"}
                        </p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isCurrentSelected
                            ? "border-cyan-700 bg-cyan-700 text-white"
                            : "border-base-300 group-hover:border-cyan-500"
                        }`}
                      >
                        {isCurrentSelected && <FiCheck className="text-xs" />}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-base-200/60 dark:border-slate-800/60 text-xs text-base-content/70">
                      <span>{book.hadithsCount || book.hadithCount || 42} حديثاً</span>
                      <span className="text-cyan-700 dark:text-cyan-400 font-bold group-hover:underline">
                        {isCurrentSelected ? "المسار الحالي" : "اختيار هذا المسار ←"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
