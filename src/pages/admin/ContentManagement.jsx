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

  // Extract loadBackendBooks so it can be re-invoked on create/update/delete
  const loadBackendBooks = async () => {
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
  };

  // Fetch real books from backend API on mount
  useEffect(() => {
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
      const [sections, realHadiths, allKeyTerms, expBooks] = await Promise.all([
        booksService.getBookSections(book.id).catch(() => []),
        hadithsService.getHadithsByBook(book.id).catch(() => []),
        hadithsService.getHadithKeyTerms().catch(() => []),
        hadithsService.getExplanationBooks().catch(() => []),
      ]);

      // Fetch explanations specifically for each hadith belonging to this book
      const explanationsByHadithId = {};
      if (Array.isArray(realHadiths) && realHadiths.length > 0) {
        await Promise.all(
          realHadiths.map(async (h) => {
            if (h.id) {
              const exps = await hadithsService.getHadithExplanations(h.id).catch(() => []);
              if (Array.isArray(exps) && exps.length > 0) {
                explanationsByHadithId[h.id] = exps;
              }
            }
          })
        );
      }

      // Helper to format hadith explanations
      const formatExplanationsForHadith = (hId) => {
        if (!hId) {
          return [{ _localId: Date.now() + Math.random(), scholarOrBook: "", text: "" }];
        }
        const hExplanations = explanationsByHadithId[hId] || [];
        if (hExplanations.length > 0) {
          return hExplanations.map((e) => ({
            _localId: e.id || Date.now() + Math.random(),
            id: e.id,
            scholarOrBook: e.author || "",
            text: e.text || e.explanationText || e.content || "",
            explanationBookId: e.explanationBookId || null,
          }));
        }
        return [{ _localId: Date.now() + Math.random(), scholarOrBook: "", text: "" }];
      };

      // Helper to format keyterms for hadith
      const formatKeyTermsForHadith = (hId) => {
        if (!hId) return [];
        return Array.isArray(allKeyTerms)
          ? allKeyTerms.filter((kt) => Number(kt.hadithId) === Number(hId))
          : [];
      };

      // ── Detect Structure Mode from Sections ──
      const hasSections = Array.isArray(sections) && sections.length > 0;
      let detectedMode = "direct";

      if (hasSections) {
        const hasKitab = sections.some((s) => Number(s.type) === 1);
        const hasFasl = sections.some((s) => Number(s.type) === 3);

        if (hasKitab) {
          detectedMode = "kitab_bab";
        } else if (hasFasl || sections.some((s) => Number(s.type) === 4 && !s.parentSectionId)) {
          detectedMode = "bab_fasl";
        }
      }

      if (detectedMode === "kitab_bab" || detectedMode === "bab_fasl") {
        // Build 2-level hierarchy for editing
        const rootSections = sections
          .filter((s) => !s.parentSectionId)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const hierarchySections = rootSections.map((root) => {
          const children = sections
            .filter((s) => Number(s.parentSectionId) === Number(root.id))
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((child) => {
              const childHadiths = (Array.isArray(realHadiths) ? realHadiths : [])
                .filter((h) => {
                  if (h.hadithBookId && Number(h.hadithBookId) !== Number(book.id)) return false;
                  return Number(h.hadithSectionId) === Number(child.id);
                })
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((h) => ({
                  _localId: h.id || Date.now() + Math.random(),
                  id: h.id,
                  title: h.title || "",
                  matnText: h.text || "",
                  explanations: formatExplanationsForHadith(h.id),
                  keyTerms: formatKeyTermsForHadith(h.id),
                  videoUrl: h.videoExplanation || "",
                  audioFile: null,
                  audioFileName: h.audioUrl || "",
                }));

              const hadithsToUse =
                childHadiths.length > 0
                  ? childHadiths
                  : [
                      {
                        _localId: Date.now() + Math.random(),
                        title: "",
                        matnText: "",
                        explanations: [{ _localId: Date.now(), scholarOrBook: "", text: "" }],
                        keyTerms: [],
                        videoUrl: "",
                        audioFile: null,
                        audioFileName: "",
                      },
                    ];

              return {
                _localId: child.id || Date.now() + Math.random(),
                id: child.id,
                name: child.name || child.title || "",
                type: child.type,
                order: child.order || 1,
                hadiths: hadithsToUse,
              };
            });

          return {
            _localId: root.id || Date.now() + Math.random(),
            id: root.id,
            name: root.name || root.title || "",
            type: root.type,
            order: root.order || 1,
            children,
          };
        });

        setEditingBook({
          ...book,
          structureMode: detectedMode,
          hierarchySections,
          sections: [
            {
              id: Date.now(),
              title: "",
              matnText: "",
              explanations: [{ _localId: Date.now(), scholarOrBook: "", text: "" }],
              keyTerms: [],
              videoUrl: "",
              audioFile: null,
              audioFileName: "",
            },
          ],
        });
      } else {
        // Direct Mode: flat hadiths list
        let directSections = [];
        if (Array.isArray(realHadiths) && realHadiths.length > 0) {
          directSections = realHadiths.map((h, idx) => ({
            id: h.id || idx + 1,
            _localId: h.id || idx + 1,
            title: h.title || (h.hadithNumber ? h.hadithNumber : ""),
            matnText: h.text || "",
            explanations: formatExplanationsForHadith(h.id),
            keyTerms: formatKeyTermsForHadith(h.id),
            videoUrl: h.videoExplanation || "",
            audioFile: null,
            audioFileName: h.audioUrl || "",
          }));
        } else {
          directSections = [
            {
              id: Date.now(),
              _localId: Date.now(),
              title: "",
              matnText: book.matnText || "",
              explanations: [{ _localId: Date.now(), scholarOrBook: "", text: "" }],
              keyTerms: [],
              videoUrl: "",
              audioFile: null,
              audioFileName: "",
            },
          ];
        }

        setEditingBook({
          ...book,
          structureMode: "direct",
          sections: directSections,
          hierarchySections: [],
        });
      }
    } catch (err) {
      console.warn("Using fallback book state for edit modal:", err.message);
      setEditingBook({
        ...book,
        structureMode: "direct",
        sections: [
          {
            id: Date.now(),
            _localId: Date.now(),
            title: "",
            matnText: book.matnText || "",
            explanations: [{ id: 1, scholarOrBook: "", text: "" }],
            keyTerms: [],
            videoUrl: "",
            audioFile: null,
            audioFileName: "",
          },
        ],
        hierarchySections: [],
      });
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

// Robust helper to extract numerical ID from various backend response shapes
function extractEntityId(res) {
  if (res == null) return null;
  if (typeof res === "number" && !isNaN(res)) return res;
  if (typeof res === "string" && !isNaN(Number(res)) && res.trim() !== "") return Number(res);
  if (typeof res === "object") {
    return (
      extractEntityId(res.id) ??
      extractEntityId(res.Id) ??
      extractEntityId(res.bookId) ??
      extractEntityId(res.BookId) ??
      extractEntityId(res.sectionId) ??
      extractEntityId(res.SectionId) ??
      extractEntityId(res.hadithId) ??
      extractEntityId(res.HadithId) ??
      extractEntityId(res.data)
    );
  }
  return null;
}

  const handleSaveForm = async (formData) => {
    setIsSubmitting(true);
    try {
      let bookId = null;

      if (editingBook) {
        bookId = editingBook.id;
        try {
          await booksService.updateBook(bookId, formData);
        } catch (updateErr) {
          console.warn("Could not update book metadata via PUT, continuing to save sections & hadiths:", updateErr.message);
        }
      } else {
        const created = await booksService.createBook(formData);
        console.log("📚 [Created Book Response]:", created);
        bookId = extractEntityId(created);
      }

      if (!bookId && editingBook) {
        bookId = editingBook.id;
      }
      
      // Delete any items that the user removed in the modal
      if (Array.isArray(formData.deletedExplanationIds) && formData.deletedExplanationIds.length > 0) {
        for (const delId of formData.deletedExplanationIds) {
          await hadithsService.deleteExplanation(delId).catch(() => null);
        }
      }
      if (Array.isArray(formData.deletedHadithIds) && formData.deletedHadithIds.length > 0) {
        for (const delId of formData.deletedHadithIds) {
          await hadithsService.deleteHadith(delId).catch(() => null);
        }
      }
      if (Array.isArray(formData.deletedSectionIds) && formData.deletedSectionIds.length > 0) {
        for (const delId of formData.deletedSectionIds) {
          await booksService.deleteSection(delId).catch(() => null);
        }
      }

      console.log("📚 [Active Book ID]:", bookId);

      // Persist book visibility preference
      if (bookId) {
        setBookVisibilityStatus(bookId, formData.status || "معروض");
      }

      // If we have a valid bookId, save sections and hadiths to backend
      if (bookId) {
        if (formData.structureMode === "direct" || !formData.structureMode) {
          // Direct Mode: Flat hadiths
          if (Array.isArray(formData.sections)) {
            for (let i = 0; i < formData.sections.length; i++) {
              const sec = formData.sections[i];
              if (sec.matnText && sec.matnText.trim()) {
                const hadithPayload = {
                  title: sec.title || "",
                  matnText: sec.matnText,
                  narrator: sec.narrator?.trim() || "غير محدد",
                  order: i + 1,
                  hadithBookId: Number(bookId),
                  hadithSectionId: null,
                  videoUrl: sec.videoUrl || "",
                  audioUrl: sec.audioFileName || "",
                };
                let createdHadith = null;
                if (sec.id && Number(sec.id) < 1e10) {
                  createdHadith = await hadithsService.updateHadith(sec.id, hadithPayload).catch((err) => {
                    console.warn("Could not update direct hadith:", err);
                    return null;
                  });
                } else {
                  createdHadith = await hadithsService.createHadith(hadithPayload).catch((err) => {
                    console.warn("Could not save direct hadith:", err);
                    return null;
                  });
                }
                const hadithId = extractEntityId(createdHadith) || sec.id;

                // Save key terms if provided
                if (hadithId && Array.isArray(sec.keyTerms) && sec.keyTerms.length > 0) {
                  for (const kt of sec.keyTerms) {
                    if (kt.text) {
                      await hadithsService.createHadithKeyTerm({
                        hadithId: Number(hadithId),
                        text: kt.text,
                        normalizedText: kt.normalizedText,
                        order: kt.order || 1,
                      }).catch(() => null);
                    }
                  }
                }

                // Save explanations if provided
                if (hadithId && Array.isArray(sec.explanations) && sec.explanations.length > 0) {
                  for (const exp of sec.explanations) {
                    if (exp.text && exp.text.trim()) {
                      let savedExp = null;
                      const isRealServerId = exp.id && typeof exp.id === "number" && exp.id > 0 && exp.id < 1e9;
                      if (isRealServerId) {
                        savedExp = await hadithsService.updateExplanation(exp.id, {
                          hadithId: Number(hadithId),
                          text: exp.text,
                          scholarOrBook: exp.scholarOrBook,
                          explanationBookId: exp.explanationBookId,
                        }).catch(() => null);
                      }
                      if (!savedExp) {
                        await hadithsService.createExplanation({
                          hadithId: Number(hadithId),
                          text: exp.text,
                          scholarOrBook: exp.scholarOrBook,
                          explanationBookId: exp.explanationBookId,
                        }).catch((err) => {
                          console.warn("Could not save direct explanation:", err);
                          return null;
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        } else if (
          formData.structureMode === "kitab_bab" ||
          formData.structureMode === "bab_fasl"
        ) {
          // Hierarchy Modes: Kitab -> Bab or Bab -> Fasl
          if (Array.isArray(formData.hierarchySections)) {
            const existingSections = await booksService.getBookSections(bookId).catch(() => []);

            const getOrCreateSection = async ({ name, type, order, hadithBookId, parentSectionId }) => {
              const existing = (existingSections || []).find((s) =>
                (s.parentSectionId === parentSectionId || (parentSectionId == null && s.parentSectionId == null)) &&
                (Number(s.order) === Number(order) || (s.name && s.name.trim() === (name || "").trim()))
              );
              if (existing) {
                console.log("♻️ [Reusing Existing Section]:", existing.id, existing.name);
                return existing;
              }
              return await booksService.createSection({
                name,
                type,
                order,
                hadithBookId,
                parentSectionId,
              });
            };

            for (let rIdx = 0; rIdx < formData.hierarchySections.length; rIdx++) {
              const root = formData.hierarchySections[rIdx];
              const createdRoot = await getOrCreateSection({
                name: root.name || `قسم ${rIdx + 1}`,
                type: root.type,
                order: rIdx + 1,
                hadithBookId: Number(bookId),
                parentSectionId: null,
              }).catch((err) => {
                console.warn("Could not create root section:", err);
                return null;
              });

              const rootId = extractEntityId(createdRoot);
              console.log("📂 [Created/Reused Root Section ID]:", rootId);

              if (Array.isArray(root.children)) {
                for (let cIdx = 0; cIdx < root.children.length; cIdx++) {
                  const child = root.children[cIdx];
                  const createdChild = await getOrCreateSection({
                    name: child.name || `فرع ${cIdx + 1}`,
                    type: child.type,
                    order: cIdx + 1,
                    hadithBookId: Number(bookId),
                    parentSectionId: rootId ? Number(rootId) : null,
                  }).catch((err) => {
                    console.warn("Could not create child section:", err);
                    return null;
                  });

                  const childId = extractEntityId(createdChild);
                  console.log("📁 [Created/Reused Child Section ID]:", childId);

                  if (Array.isArray(child.hadiths)) {
                    for (let hIdx = 0; hIdx < child.hadiths.length; hIdx++) {
                      const h = child.hadiths[hIdx];
                      if (h.matnText && h.matnText.trim()) {
                        const hadithPayload = {
                          title: h.title || "",
                          matnText: h.matnText,
                          narrator: h.narrator?.trim() || "غير محدد",
                          order: hIdx + 1,
                          hadithBookId: Number(bookId),
                          hadithSectionId: childId ? Number(childId) : null,
                          videoUrl: h.videoUrl || "",
                          audioUrl: h.audioFileName || "",
                        };
                        let createdHadith = null;
                        if (h.id && Number(h.id) < 1e10) {
                          createdHadith = await hadithsService.updateHadith(h.id, hadithPayload).catch((err) => {
                            console.warn("Could not update hierarchy hadith:", err);
                            return null;
                          });
                        } else {
                          createdHadith = await hadithsService.createHadith(hadithPayload).catch((err) => {
                            console.warn("Could not create hierarchy hadith:", err);
                            return null;
                          });
                        }

                        const hadithId = extractEntityId(createdHadith) || h.id;

                        if (hadithId && Array.isArray(h.keyTerms) && h.keyTerms.length > 0) {
                          for (const kt of h.keyTerms) {
                            if (kt.text) {
                              await hadithsService.createHadithKeyTerm({
                                hadithId: Number(hadithId),
                                text: kt.text,
                                normalizedText: kt.normalizedText,
                                order: kt.order || 1,
                              }).catch(() => null);
                            }
                          }
                        }

                        // Save explanations if provided
                        if (hadithId && Array.isArray(h.explanations) && h.explanations.length > 0) {
                          for (const exp of h.explanations) {
                            if (exp.text && exp.text.trim()) {
                              let savedExp = null;
                              const isRealServerId = exp.id && typeof exp.id === "number" && exp.id > 0 && exp.id < 1e9;
                              if (isRealServerId) {
                                savedExp = await hadithsService.updateExplanation(exp.id, {
                                  hadithId: Number(hadithId),
                                  text: exp.text,
                                  scholarOrBook: exp.scholarOrBook,
                                  explanationBookId: exp.explanationBookId,
                                }).catch(() => null);
                              }
                              if (!savedExp) {
                                await hadithsService.createExplanation({
                                  hadithId: Number(hadithId),
                                  text: exp.text,
                                  scholarOrBook: exp.scholarOrBook,
                                  explanationBookId: exp.explanationBookId,
                                }).catch((err) => {
                                  console.warn("Could not save hierarchy explanation:", err);
                                  return null;
                                });
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      await loadBackendBooks();
      setIsFormOpen(false);
      setEditingBook(null);
    } catch (err) {
      console.error("Error saving book:", err);
      alert("حدث خطأ أثناء حفظ الكتاب في السيرفر: " + (err.message || "يرجى التحقق من المدخلات"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBook) return;
    setIsSubmitting(true);
    try {
      await booksService.deleteBook(deletingBook.id);
      await loadBackendBooks();
    } catch (err) {
      console.warn("Could not delete from server, removing locally:", err.message);
      setBooks((prev) => prev.filter((b) => b.id !== deletingBook.id));
    } finally {
      setIsSubmitting(false);
      setIsDeleteOpen(false);
      setDeletingBook(null);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 text-base-content font-2 relative">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
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
      <header className="mb-4 pb-2 border-b border-base-200 mt-4 sm:mt-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-1 text-base-content">
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

      {/* Full screen / page dimmed overlay loader when editing an existing book */}
      {isLoading && filteredBooks.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center gap-3 animate-fadeIn" dir="rtl">
          <div className="bg-base-100/95 border border-base-300 p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3.5 max-w-xs text-center animate-modalIn">
            <span className="loading loading-spinner loading-lg text-cyan-700"></span>
            <span className="text-sm font-bold font-2 text-base-content">جاري جلب تفاصيل ومحتوى الكتاب...</span>
          </div>
        </div>
      )}

      {/* Initial Page Loading Skeletons */}
      {isLoading && filteredBooks.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-base-100 border border-base-200 shadow-xs p-5 rounded-3xl space-y-4 animate-pulse">
              <div className="h-6 bg-base-200 rounded-xl w-3/4"></div>
              <div className="h-4 bg-base-200 rounded-xl w-1/2"></div>
              <div className="h-20 bg-base-200 rounded-2xl w-full"></div>
              <div className="h-8 bg-base-200 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* Content Cards Grid (Always visible underneath loader when editing) */}
      {filteredBooks.length > 0 && (
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
      </main>
    </div>
  );
}
