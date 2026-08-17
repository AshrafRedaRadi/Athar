import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoLayersOutline, IoLibraryOutline, IoChevronBack, IoDocumentTextOutline } from "react-icons/io5";
import Navbar from "../components/shared/Navbar";
import { booksService } from "../services/booksService";
import { SECTION_TYPE_LABELS } from "../utils/hadithSectionTree";

// ─────────────────────────────────────────────
//  ListSection — one level of a book's contents
//  Routes: /library/:bookId/sections
//          /library/:bookId/sections/:sectionId
//
//  Books nest to whatever depth they were entered at, so this shows a single level at a
//  time rather than the whole tree: the sections directly inside the current node, plus
//  that node's own hadiths. Only that level is fetched, which is what keeps a large book
//  from arriving in one response.
// ─────────────────────────────────────────────
export default function ListSection() {
  const { bookId, sectionId } = useParams();
  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [current, setCurrent] = useState(null);
  const [trail, setTrail] = useState([]);
  const [bookTitle, setBookTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!bookId) { setIsLoading(false); return; }
      try {
        setIsLoading(true);
        setError(null);

        const [childSections, booksData, currentSection] = await Promise.all([
          booksService.getSectionLevel(bookId, {
            onlyRoots: !sectionId,
            parentSectionId: sectionId ?? null,
          }),
          booksService.getBooks().catch(() => []),
          sectionId ? booksService.getSection(sectionId).catch(() => null) : Promise.resolve(null),
        ]);

        if (cancelled) return;

        const book = booksData.find((b) => String(b.id) === String(bookId));
        setBookTitle(book?.title || "");
        setCurrent(currentSection);
        setChildren(childSections);

        // Walk up from the current section so the reader can see and undo the path taken.
        const ancestors = [];
        let cursor = currentSection?.parentSectionId ?? null;
        while (cursor && ancestors.length < 10) {
          const ancestor = await booksService.getSection(cursor).catch(() => null);
          if (!ancestor) break;
          ancestors.unshift(ancestor);
          cursor = ancestor.parentSectionId ?? null;
        }
        if (!cancelled) setTrail(ancestors);

        // Nothing nested here, so the reader wants the hadiths themselves — skip the empty
        // level rather than showing a page with no options on it.
        const hasHadiths = (currentSection?.hadithCount ?? 0) > 0;
        if (childSections.length === 0 && (hasHadiths || !sectionId)) {
          navigate(`/library/${bookId}/${sectionId || 0}`, { replace: true });
        }
      } catch (err) {
        console.error("Error loading sections:", err.message);
        if (!cancelled) setError("تعذَّر تحميل الأقسام، يرجى المحاولة لاحقاً.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [bookId, sectionId, navigate]);

  const openSection = (section) => {
    // A section with nothing nested inside it goes straight to its hadiths.
    if ((section.childSectionCount ?? 0) === 0) {
      navigate(`/library/${bookId}/${section.id}`);
    } else {
      navigate(`/library/${bookId}/sections/${section.id}`);
    }
  };

  const SkeletonCard = () => (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-5 flex flex-col gap-3 animate-pulse">
      <div className="w-1/3 h-3 bg-base-300 rounded" />
      <div className="w-2/3 h-5 bg-base-300 rounded" />
      <div className="w-full h-3 bg-base-300 rounded" />
    </div>
  );

  const ownHadiths = current?.hadithCount ?? 0;
  const nestedHadiths = children.reduce((sum, c) => sum + (c.hadithCount || 0), 0);
  const directHadiths = Math.max(0, ownHadiths - nestedHadiths);

  return (
    <div className="min-h-screen bg-base-200">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        <Navbar activePage="library" />

        {/* ── Breadcrumb trail: المكتبة › الكتاب › كتاب › باب … ── */}
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
            className="hover:text-cyan-700 transition-colors line-clamp-1"
          >
            {bookTitle || "الكتاب"}
          </button>

          {trail.map((ancestor) => (
            <span key={ancestor.id} className="flex items-center gap-2">
              <IoChevronBack className="text-xs" />
              <button
                onClick={() => navigate(`/library/${bookId}/sections/${ancestor.id}`)}
                className="hover:text-cyan-700 transition-colors line-clamp-1"
              >
                {ancestor.name}
              </button>
            </span>
          ))}

          {current && (
            <span className="flex items-center gap-2">
              <IoChevronBack className="text-xs" />
              <span className="text-base-content/90 font-medium line-clamp-1">{current.name}</span>
            </span>
          )}
        </div>

        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <IoLayersOutline className="text-3xl text-cyan-600" />
            <h1 className="font-1 font-bold text-2xl sm:text-3xl text-base-content">
              {current ? current.name : "أقسام الكتاب"}
            </h1>
          </div>
          <p className="font-2 text-base-content/60 text-sm">
            {current ? bookTitle : bookTitle || ""}
          </p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : error ? (
          <div role="alert" className="alert alert-error font-2">
            <span>{error}</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((section) => (
                <button
                  key={section.id}
                  onClick={() => openSection(section)}
                  className="card bg-base-100 border border-base-200 shadow-md hover:shadow-xl
                             transition-all duration-300 hover:-translate-y-1 text-start w-full p-0"
                  aria-label={section.name}
                >
                  <div className="card-body p-5 gap-2">
                    <span className="badge badge-sm bg-cyan-700/10 text-cyan-800 dark:text-cyan-300 border-cyan-700/20 font-2 mb-1">
                      {SECTION_TYPE_LABELS[section.type] || "قسم"}
                    </span>

                    <h2 className="card-title font-1 font-bold text-base text-base-content leading-snug">
                      {section.name}
                    </h2>

                    <p className="font-2 text-xs text-base-content/50">
                      {section.childSectionCount > 0 && `${section.childSectionCount} قسم فرعي · `}
                      {section.hadithCount} حديث
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Hadiths sitting in this node itself, alongside its sub-sections. */}
            {directHadiths > 0 && (
              <button
                onClick={() => navigate(`/library/${bookId}/${sectionId || 0}`)}
                className="card bg-base-100 border border-base-200 shadow-md hover:shadow-xl
                           transition-all duration-300 text-start w-full p-0 mt-4"
              >
                <div className="card-body p-5 gap-1 flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IoDocumentTextOutline className="text-2xl text-cyan-600" />
                    <div>
                      <h2 className="font-1 font-bold text-base text-base-content">
                        أحاديث في هذا {current ? SECTION_TYPE_LABELS[current.type] || "القسم" : "الكتاب"} مباشرة
                      </h2>
                      <p className="font-2 text-xs text-base-content/50">{directHadiths} حديث</p>
                    </div>
                  </div>
                  <IoChevronBack className="text-base text-base-content/40" />
                </div>
              </button>
            )}

            {children.length === 0 && directHadiths === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <IoLayersOutline className="text-6xl text-base-content/20" />
                <p className="font-2 text-base-content/60 text-lg max-w-md">
                  لا يوجد محتوى في هذا القسم
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
