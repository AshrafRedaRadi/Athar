import React, { useState, useEffect } from "react";
import {
  HiOutlineX,
  HiOutlineBookOpen,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineVideoCamera,
  HiOutlineVolumeUp,
  HiOutlinePhotograph,
  HiOutlineUpload,
  HiOutlineEye,
  HiOutlineSparkles,
  HiPlus,
  HiTrash,
} from "react-icons/hi";
import KeyTermsModal from "./KeyTermsModal";
import {
  STRUCTURE_EXAMPLES,
  SECTION_TYPES,
  createEmptyFormHadith,
  addChildSection,
  addHadith,
  updateNode,
  updateHadith as updateHadithInTree,
  removeNode,
  removeHadith,
  flattenTree,
} from "../../utils/hadithSectionTree";
import SectionNode from "./SectionNode";
import ExplanationBookPicker from "./ExplanationBookPicker";

export default function ContentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSaving = false,
  explanationBooks = [],
}) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "الحديث",
    difficultyLevel: "1",
    status: "معروض",
    description: "",
    coverImageFile: null,
    coverImagePreview: "",
    // Hadiths that hang off the book itself, with no section — how a متن like الأربعون
    // النووية is arranged. Books that use كتب/أبواب/فصول put theirs inside the tree below,
    // and a book may legitimately use both.
    bookHadiths: [createEmptyFormHadith(1)],
    hierarchySections: [],
  });

  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isFormTouched, setIsFormTouched] = useState(false);
  const [activeKeyTermsSectionId, setActiveKeyTermsSectionId] = useState(null);
  // Track collapsed sections for hierarchy mode
  const [collapsedSections, setCollapsedSections] = useState(new Set());

  // Populate data when editing or reset when adding
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        author: initialData.author || "",
        category: initialData.category || "الحديث",
        difficultyLevel: initialData.difficultyLevel ? String(initialData.difficultyLevel) : "1",
        status: initialData.status || "معروض",
        description: initialData.description || "",
        coverImageFile: null,
        coverImagePreview: initialData.coverImage || "",
        bookHadiths:
          initialData.bookHadiths && initialData.bookHadiths.length > 0
            ? initialData.bookHadiths
            : [],
        hierarchySections: initialData.hierarchySections || [],
      });
      setIsFormTouched(false);
      setCollapsedSections(new Set());
    } else {
      setFormData({
        title: "",
        author: "",
        category: "الحديث",
        difficultyLevel: "1",
        status: "معروض",
        description: "",
        coverImageFile: null,
        coverImagePreview: "",
        bookHadiths: [createEmptyFormHadith(1)],
        hierarchySections: [],
      });
      setIsFormTouched(false);
      setCollapsedSections(new Set());
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // ────────────────────────────────────────────────
  // SHARED HELPERS
  // ────────────────────────────────────────────────

  const markTouched = () => {
    if (!isFormTouched) setIsFormTouched(true);
  };

  const handleFieldChange = (field, value) => {
    markTouched();
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      markTouched();
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        coverImageFile: file,
        coverImagePreview: previewUrl,
      }));
    }
  };

  // ────────────────────────────────────────────────
  // BOOK-LEVEL HADITH HANDLERS
  // ────────────────────────────────────────────────
  // A hadith either hangs off the book itself (sectionLocalId === null) or off a section
  // in the tree. Every handler below takes that same first argument so one hadith editor
  // serves both places.


  /** Which section owns a hadith, or null when it hangs off the book itself. */
  const findHadithOwner = (state, hadithLocalId) => {
    if ((state.bookHadiths || []).some((h) => h._localId === hadithLocalId)) return null;
    const owner = flattenTree(state.hierarchySections).find((item) =>
      (item.node.hadiths || []).some((h) => h._localId === hadithLocalId)
    );
    return owner ? owner.node._localId : undefined;
  };

  const handleSaveSectionKeyTerms = (keyTermsList) => {
    if (!activeKeyTermsSectionId) return;
    markTouched();

    setFormData((prev) => {
      const ownerLocalId = findHadithOwner(prev, activeKeyTermsSectionId);
      if (ownerLocalId === undefined) return prev;

      if (ownerLocalId === null) {
        return {
          ...prev,
          bookHadiths: prev.bookHadiths.map((h) =>
            h._localId === activeKeyTermsSectionId ? { ...h, keyTerms: keyTermsList } : h
          ),
        };
      }

      return {
        ...prev,
        hierarchySections: updateHadithInTree(
          prev.hierarchySections,
          ownerLocalId,
          activeKeyTermsSectionId,
          { keyTerms: keyTermsList }
        ),
      };
    });
  };

  // ────────────────────────────────────────────────
  // SECTION TREE HANDLERS
  // ────────────────────────────────────────────────

  /** Only ids that came back from the API refer to something the server can delete. */
  const isPersistedId = (id) => Number.isInteger(id) && id > 0 && id < 1e9;

  /**
   * Collect the backend ids under a node so removing it also removes its subtree on the
   * server. Children are walked before the node itself, which puts the deepest sections
   * first — the API refuses to delete a section that still has children.
   */
  const collectSubtreeDeletions = (node) => {
    const sectionIds = [];
    const hadithIds = [];

    const walk = (current) => {
      for (const child of current.children || []) walk(child);
      for (const hadith of current.hadiths || []) {
        if (isPersistedId(hadith.id)) hadithIds.push(hadith.id);
      }
      if (isPersistedId(current.id)) sectionIds.push(current.id);
    };

    walk(node);
    return { sectionIds, hadithIds };
  };

  const handleAddRootSection = () => {
    markTouched();
    setFormData((prev) => ({
      ...prev,
      // Sensible default only — the type dropdown on the node changes it in one click.
      hierarchySections: addChildSection(prev.hierarchySections, null, SECTION_TYPES.KITAB),
    }));
  };

  const handleRemoveTreeSection = (localId) => {
    markTouched();
    setFormData((prev) => {
      const entry = flattenTree(prev.hierarchySections).find(
        (item) => item.node._localId === localId
      );
      const { sectionIds, hadithIds } = entry
        ? collectSubtreeDeletions(entry.node)
        : { sectionIds: [], hadithIds: [] };

      return {
        ...prev,
        deletedSectionIds: [...(prev.deletedSectionIds || []), ...sectionIds],
        deletedHadithIds: [...(prev.deletedHadithIds || []), ...hadithIds],
        hierarchySections: removeNode(prev.hierarchySections, localId),
      };
    });
  };

  const handleSectionNameChange = (localId, name) => {
    markTouched();
    setFormData((prev) => ({
      ...prev,
      hierarchySections: updateNode(prev.hierarchySections, localId, { name }),
    }));
  };

  const handleSectionTypeChange = (localId, type) => {
    markTouched();
    setFormData((prev) => ({
      ...prev,
      hierarchySections: updateNode(prev.hierarchySections, localId, { type }),
    }));
  };

  const handleAddChildSection = (parentLocalId) => {
    markTouched();
    setFormData((prev) => ({
      ...prev,
      hierarchySections: addChildSection(prev.hierarchySections, parentLocalId, SECTION_TYPES.BAB),
    }));
  };

  // Hadith/paragraph handlers within hierarchy
  const handleAddHadithToSection = (sectionLocalId) => {
    markTouched();
    setFormData((prev) =>
      sectionLocalId === null
        ? {
            ...prev,
            bookHadiths: [
              ...prev.bookHadiths,
              createEmptyFormHadith(prev.bookHadiths.length + 1),
            ],
          }
        : { ...prev, hierarchySections: addHadith(prev.hierarchySections, sectionLocalId) }
    );
  };

  const handleRemoveHadithFromSection = (sectionLocalId, hadithLocalId) => {
    markTouched();
    setFormData((prev) => {
      const source =
        sectionLocalId === null
          ? prev.bookHadiths
          : flattenTree(prev.hierarchySections).find(
              (item) => item.node._localId === sectionLocalId
            )?.node.hadiths || [];

      const hadith = source.find((h) => h._localId === hadithLocalId);
      const deletedHadithIds = isPersistedId(hadith?.id)
        ? [...(prev.deletedHadithIds || []), hadith.id]
        : prev.deletedHadithIds;

      return sectionLocalId === null
        ? {
            ...prev,
            deletedHadithIds,
            bookHadiths: prev.bookHadiths.filter((h) => h._localId !== hadithLocalId),
          }
        : {
            ...prev,
            deletedHadithIds,
            hierarchySections: removeHadith(prev.hierarchySections, sectionLocalId, hadithLocalId),
          };
    });
  };

  /**
   * Rewrite a hadith's explanations through a callback. Reads the list from current state
   * rather than the render-time snapshot, so rapid edits cannot clobber each other.
   */
  const updateHierarchyExplanations = (sectionLocalId, hadithLocalId, updater) => {
    markTouched();
    setFormData((prev) => {
      const source =
        sectionLocalId === null
          ? prev.bookHadiths
          : flattenTree(prev.hierarchySections).find(
              (item) => item.node._localId === sectionLocalId
            )?.node.hadiths || [];

      const hadith = source.find((hd) => hd._localId === hadithLocalId);
      if (!hadith) return prev;

      const explanations = updater(hadith.explanations || []);

      return sectionLocalId === null
        ? {
            ...prev,
            bookHadiths: prev.bookHadiths.map((h) =>
              h._localId === hadithLocalId ? { ...h, explanations } : h
            ),
          }
        : {
            ...prev,
            hierarchySections: updateHadithInTree(
              prev.hierarchySections,
              sectionLocalId,
              hadithLocalId,
              { explanations }
            ),
          };
    });
  };

  const handleHierarchyHadithChange = (sectionLocalId, hadithLocalId, field, value) => {
    markTouched();
    setFormData((prev) =>
      sectionLocalId === null
        ? {
            ...prev,
            bookHadiths: prev.bookHadiths.map((h) =>
              h._localId === hadithLocalId ? { ...h, [field]: value } : h
            ),
          }
        : {
            ...prev,
            hierarchySections: updateHadithInTree(
              prev.hierarchySections,
              sectionLocalId,
              hadithLocalId,
              { [field]: value }
            ),
          }
    );
  };

  // Toggle collapse for a section
  const toggleCollapse = (localId) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(localId)) next.delete(localId);
      else next.add(localId);
      return next;
    });
  };

  // ────────────────────────────────────────────────
  // CLOSE & SUBMIT
  // ────────────────────────────────────────────────

  const handleAttemptClose = () => {
    if (isFormTouched) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowConfirmClose(false);
    setIsFormTouched(false);
    onClose();
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    // The legacy single-matn fields still feed the book summary shown on the card.
    const firstHadith =
      formData.bookHadiths[0] ||
      flattenTree(formData.hierarchySections).flatMap(({ node }) => node.hadiths || [])[0];

    onSubmit({
      ...formData,
      coverImage: formData.coverImagePreview || "",
      matnText: firstHadith?.matnText || "",
      textExplanation: firstHadith?.explanations?.[0]?.text || "",
      videoExplanation: firstHadith?.videoUrl || "",
      audioUrl: firstHadith?.audioFileName || "",
    });
  };

  // ────────────────────────────────────────────────
  // FIND KEY TERMS SECTION DATA (for modal)
  // ────────────────────────────────────────────────

  const findKeyTermsTarget = () => {
    if (!activeKeyTermsSectionId) return { keyTerms: [], title: "" };
    // Book-level hadiths first, then anywhere in the tree.
    const bookHadith = formData.bookHadiths.find((h) => h._localId === activeKeyTermsSectionId);
    if (bookHadith) return { keyTerms: bookHadith.keyTerms || [], title: bookHadith.title || "" };
    for (const { node } of flattenTree(formData.hierarchySections)) {
      const match = (node.hadiths || []).find((h) => h._localId === activeKeyTermsSectionId);
      if (match) return { keyTerms: match.keyTerms || [], title: match.title || "" };
    }
    return { keyTerms: [], title: "" };
  };

  const keyTermsTarget = findKeyTermsTarget();

  // ────────────────────────────────────────────────
  // RENDER: HIERARCHY BUILDER (النمط 2 و 3)
  // ────────────────────────────────────────────────

  // The hadith editor is identical at every level of the tree, so SectionNode renders it
  // through this callback rather than owning a copy of it.
  const renderHierarchyHadith = (sectionLocalId, h, hIdx, onRemove) => (
                              <div
                                key={h._localId}
                                className="bg-base-100 rounded-xl border border-base-300 p-4 space-y-4"
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-base-200">
                                  <span className="badge badge-sm bg-slate-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md">
                                    حديث / فقرة {hIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={onRemove}
                                    className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md"
                                  >
                                    <HiTrash className="text-xs" />
                                    <span className="text-[10px]">حذف</span>
                                  </button>
                                </div>

                                {/* Title */}
                                <div>
                                  <label className="block text-[11px] font-semibold text-base-content/70 mb-1 flex items-center gap-1">
                                    <HiOutlineBookOpen className="text-sm text-cyan-700" />
                                    <span>عنوان الحديث أو الفقرة <span className="text-base-content/40 font-normal">(اختياري)</span></span>
                                  </label>
                                  <input
                                    type="text"
                                    value={h.title}
                                    onChange={(e) =>
                                      handleHierarchyHadithChange(sectionLocalId, h._localId, "title", e.target.value)
                                    }
                                    placeholder="مثال: الحديث الأول: إنما الأعمال بالنيات"
                                    className="w-full px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-xs font-2 text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs"
                                  />
                                </div>

                                {/* Matn Text */}
                                <div>
                                  <label className="block text-[11px] font-semibold text-base-content/70 mb-1 flex items-center gap-1">
                                    <HiOutlineDocumentText className="text-sm text-cyan-700" />
                                    <span>نص المتن الرئيسي <span className="text-red-500">*</span></span>
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={h.matnText}
                                    onChange={(e) =>
                                      handleHierarchyHadithChange(sectionLocalId, h._localId, "matnText", e.target.value)
                                    }
                                    placeholder="اكتب أو ألصق نص المتن الأصلي..."
                                    className="w-full p-3 rounded-lg border border-base-300 bg-base-100 text-sm font-4 leading-relaxed text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs"
                                  />

                                  {/* Key Terms Button */}
                                  <div className="mt-2">
                                    <button
                                      type="button"
                                      onClick={() => setActiveKeyTermsSectionId(h._localId)}
                                      className="btn btn-xs btn-outline border-cyan-700/60 text-cyan-700 hover:bg-cyan-700 hover:text-white font-2 rounded-lg text-[10px] flex items-center gap-1 font-bold transition-all group"
                                    >
                                      <HiOutlineSparkles className="text-xs text-cyan-700 group-hover:text-white" />
                                      <span>إدارة الكلمات الحساسة في النطق</span>
                                      {(h.keyTerms?.length || 0) > 0 && (
                                        <span className="badge badge-xs bg-cyan-700 text-white font-bold px-1.5 rounded-full text-[9px]">
                                          {h.keyTerms.length}
                                        </span>
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Explanations */}
                                <div className="space-y-2.5 bg-base-200/40 p-3 rounded-xl border border-base-200">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-base-content/80 flex items-center gap-1">
                                      <HiOutlineBookOpen className="text-sm text-cyan-700" />
                                      <span>الشروحات النصية المكتوبة</span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateHierarchyExplanations(sectionLocalId, h._localId, (list) => [
                                          ...list,
                                          { _localId: `explanation-${Date.now()}-${list.length}`, id: null, scholarOrBook: "", text: "" },
                                        ])
                                      }
                                      className="btn btn-xs btn-outline border-cyan-700 text-cyan-700 hover:bg-cyan-700 hover:text-white rounded-lg text-[10px] gap-0.5 font-bold"
                                    >
                                      <HiPlus className="text-xs" />
                                      <span>إضافة شرح</span>
                                    </button>
                                  </div>

                                  {h.explanations?.map((exp, eIdx) => (
                                    <div
                                      key={exp._localId || eIdx}
                                      className="bg-base-100 p-3 rounded-lg border border-base-300 space-y-2"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1">
                                          <ExplanationBookPicker
                                            compact
                                            books={explanationBooks}
                                            value={exp}
                                            onChange={(next) =>
                                              updateHierarchyExplanations(sectionLocalId, h._localId, (list) =>
                                                list.map((ex, i) => (i === eIdx ? { ...ex, ...next } : ex))
                                              )
                                            }
                                          />
                                        </div>
                                        {h.explanations.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const expToDelete = h.explanations[eIdx];
                                              if (isPersistedId(expToDelete?.id)) {
                                                setFormData((prev) => ({
                                                  ...prev,
                                                  deletedExplanationIds: [
                                                    ...(prev.deletedExplanationIds || []),
                                                    expToDelete.id,
                                                  ],
                                                }));
                                              }
                                              updateHierarchyExplanations(sectionLocalId, h._localId, (list) =>
                                                list.filter((_, i) => i !== eIdx)
                                              );
                                            }}
                                            className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50 rounded-md shrink-0"
                                          >
                                            <HiTrash className="text-xs" />
                                          </button>
                                        )}
                                      </div>
                                      <textarea
                                        rows={2}
                                        value={exp.text}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          updateHierarchyExplanations(sectionLocalId, h._localId, (list) =>
                                            list.map((ex, i) => (i === eIdx ? { ...ex, text: value } : ex))
                                          );
                                        }}
                                        placeholder="اكتب الشرح النصي والتعليقات..."
                                        className="w-full p-2.5 rounded-lg border border-base-300 bg-base-100 text-[11px] font-2 text-base-content focus:outline-hidden focus:border-cyan-600"
                                      />
                                    </div>
                                  ))}
                                </div>

                                {/* Video & Audio */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-semibold text-base-content/70 mb-1 flex items-center gap-1">
                                      <HiOutlineVideoCamera className="text-sm text-cyan-700" />
                                      <span>الشرح المرئي (رابط الفيديو)</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={h.videoUrl}
                                      onChange={(e) =>
                                        handleHierarchyHadithChange(sectionLocalId, h._localId, "videoUrl", e.target.value)
                                      }
                                      placeholder="رابط فيديو أو YouTube ID"
                                      className="w-full px-3 py-1.5 rounded-lg border border-base-300 bg-base-100 text-[11px] font-2 text-base-content focus:outline-hidden focus:border-cyan-600"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-semibold text-base-content/70 mb-1 flex items-center gap-1">
                                      <HiOutlineVolumeUp className="text-sm text-cyan-700" />
                                      <span>الصوتيات (ملف صوتي)</span>
                                    </label>
                                    <label className="btn btn-xs btn-outline border-cyan-700/40 text-cyan-700 bg-base-100 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 font-2 rounded-lg text-[10px] flex items-center gap-1.5 cursor-pointer w-full shadow-xs">
                                      <HiOutlineUpload className="text-sm text-cyan-700 shrink-0" />
                                      <span className="truncate">
                                        {h.audioFileName || "رفع ملف صوتي (MP3 / WAV)"}
                                      </span>
                                      <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            handleHierarchyHadithChange(sectionLocalId, h._localId, "audioFile", file);
                                            handleHierarchyHadithChange(sectionLocalId, h._localId, "audioFileName", file.name);
                                          }
                                        }}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
  );

  // ────────────────────────────────────────────────
  // RENDER: HIERARCHY BUILDER (recursive, any depth)
  // ────────────────────────────────────────────────

  const renderHierarchyBuilder = () => (
    <div className="space-y-5">
      {formData.hierarchySections.map((root, rIdx) => (
        <SectionNode
          key={root._localId}
          node={root}
          index={rIdx}
          depth={1}
          collapsedIds={collapsedSections}
          onToggleCollapse={toggleCollapse}
          onNameChange={handleSectionNameChange}
          onTypeChange={handleSectionTypeChange}
          onRemove={handleRemoveTreeSection}
          onAddChild={handleAddChildSection}
          onAddHadith={handleAddHadithToSection}
          onRemoveHadith={handleRemoveHadithFromSection}
          renderHadith={renderHierarchyHadith}
        />
      ))}

      <button
        type="button"
        onClick={handleAddRootSection}
        className="btn btn-md bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold gap-1.5 shadow-xs w-full"
      >
        <HiPlus className="text-base" />
        <span>إضافة قسم رئيسي جديد</span>
      </button>
    </div>
  );

  // ────────────────────────────────────────────────
  // MAIN RENDER
  // ────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-base-100 border border-base-300 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-200/40 shrink-0">
          <div className="flex items-center gap-3 text-cyan-700 dark:text-cyan-400">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center">
              <HiOutlineBookOpen className="text-2xl text-cyan-700" />
            </div>
            <div>
              <h2 className="font-1 font-bold text-lg md:text-xl text-base-content">
                {initialData ? "تعديل محتوى المتن" : "إضافة متن جديد"}
              </h2>
              <p className="text-xs text-base-content/60 font-2">
                إدخال وإدارة تفاصيل المتن والأقسام والشروحات الصوتية والمرئية.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAttemptClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content hover:bg-base-200"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        {/* ── Modal Form Body ── */}
        <form
          onSubmit={handleSubmitForm}
          className="p-6 space-y-8 overflow-y-auto flex-1 font-2"
        >
          {/* ────────────────────────────────────────────────────────── */}
          {/* SECTION 1: BASIC METADATA */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="space-y-4 bg-base-200/30 p-5 rounded-2xl border border-base-200">
            <h3 className="font-1 font-bold text-base text-cyan-700 dark:text-cyan-400 pb-2 border-b border-base-200/80 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-700 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>البيانات الأساسية للمتن / الكتاب</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1.1 Title */}
              <div>
                <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                  عنوان المتن / الكتاب <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  placeholder="مثال: الأربعون النووية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-sm font-2 text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs"
                />
              </div>

              {/* 1.2 Author */}
              <div>
                <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                  المؤلف / الجامع <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => handleFieldChange("author", e.target.value)}
                  placeholder="مثال: الإمام يحيى بن شرف النووي"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-sm font-2 text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs"
                />
              </div>

              {/* 1.3 Category */}
              <div>
                <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                  التصنيف الرئيسي <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-sm font-2 text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs cursor-pointer"
                >
                  <option value="الحديث">الحديث</option>
                  <option value="العقيدة">العقيدة</option>
                  <option value="الفقه">الفقه</option>
                  <option value="اللغة العربية">اللغة العربية</option>
                  <option value="التفسير">التفسير</option>
                </select>
              </div>

              {/* 1.4 Difficulty Level */}
              <div>
                <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                  مستوى الصعوبة <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.difficultyLevel}
                  onChange={(e) => handleFieldChange("difficultyLevel", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-sm font-2 text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs cursor-pointer"
                >
                  <option value="1">مبتدئ</option>
                  <option value="2">متوسط</option>
                  <option value="3">متقدم</option>
                </select>
              </div>

              {/* 1.5 Visibility */}
              <div>
                <label className="block text-xs font-semibold text-base-content/80 mb-1.5 flex items-center gap-1">
                  <HiOutlineEye className="text-base text-cyan-700" />
                  <span>الظهور بالموقع الرئيسي <span className="text-red-500">*</span></span>
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-sm font-2 text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs cursor-pointer font-bold text-cyan-800 dark:text-cyan-400"
                >
                  <option value="معروض">معروض بالمكتبة الرئيسية</option>
                  <option value="مخفي">مخفي من المكتبة الرئيسية</option>
                </select>
              </div>
            </div>

            {/* 1.6 Brief Description */}
            <div>
              <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                نبذة عن الكتاب <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="اكتب نبذة مختصرة وشاملة عن موضوع الكتاب وأهميته..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-sm font-2 text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs"
              />
            </div>

            {/* 1.7 Cover Image */}
            <div>
              <label className="block text-xs font-semibold text-base-content/80 mb-1.5 flex items-center gap-1.5">
                <HiOutlinePhotograph className="text-base text-cyan-700" />
                <span>صورة الغلاف (رفع من الجهاز)</span>
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="btn btn-outline border-cyan-700/40 text-cyan-700 bg-base-100 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 font-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs">
                  <HiOutlineUpload className="text-lg text-cyan-700 shrink-0" />
                  <span>{formData.coverImageFile ? "تغيير الصورة المختارة" : "رفع صورة الغلاف من جهازك"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {formData.coverImagePreview && (
                  <div className="flex items-center gap-3 bg-base-100 p-2 rounded-xl border border-base-300">
                    <img
                      src={formData.coverImagePreview}
                      alt="معاينة الغلاف"
                      className="h-12 w-12 object-cover rounded-lg border border-base-200"
                    />
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <HiOutlinePhotograph className="text-sm" />
                      <span>تم اختيار صورة الغلاف</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* SECTION 2: STRUCTURE MODE + CONTENT */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            <div className="pb-2 border-b border-base-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-cyan-700 text-white text-xs flex items-center justify-center font-bold">2</span>
                <h3 className="font-1 font-bold text-base text-cyan-700 dark:text-cyan-400">
                  هيكل المحتوى والأحاديث والشروحات
                </h3>
              </div>

              {/* The book decides its own shape: put أحاديث directly under it, or group
                  them into كتب / أبواب / فصول, or both in the same book. */}
              <details className="text-xs text-base-content/60 font-2">
                <summary className="cursor-pointer select-none hover:text-base-content">
                  أمثلة على تنظيم الكتب
                </summary>
                <ul className="mt-2 space-y-1 ps-4 list-disc">
                  {STRUCTURE_EXAMPLES.map((example) => (
                    <li key={example.label}>
                      <span className="font-bold">{example.label}</span> — {example.examples}
                    </li>
                  ))}
                </ul>
              </details>
            </div>

            {/* ── Hadiths that belong to the book itself, with no section ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-base-content/80 font-2">
                  أحاديث / فقرات مباشرة تحت الكتاب
                </h4>
                <button
                  type="button"
                  onClick={() => handleAddHadithToSection(null)}
                  className="btn btn-sm bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold gap-1 shadow-xs"
                >
                  <HiPlus className="text-base" />
                  <span>إضافة حديث مباشر</span>
                </button>
              </div>

              {formData.bookHadiths.length === 0 ? (
                <p className="text-xs text-base-content/50 font-2 py-2">
                  لا توجد أحاديث مباشرة — استخدم الأقسام بالأسفل إن كان الكتاب مقسّماً.
                </p>
              ) : (
                formData.bookHadiths.map((h, hIdx) => (
                  <div key={h._localId}>
                    {renderHierarchyHadith(null, h, hIdx, () =>
                      handleRemoveHadithFromSection(null, h._localId)
                    )}
                  </div>
                ))
              )}
            </div>

            {/* ── Sections, nested to any depth ── */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-base-content/80 font-2">
                الأقسام (كتب / أبواب / فصول)
              </h4>
              {renderHierarchyBuilder()}
            </div>
          </div>

          {/* ── Form Actions Footer ── */}
          <div className="pt-5 border-t border-base-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleAttemptClose}
              className="btn btn-ghost rounded-xl font-2 text-sm px-5"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-2 font-bold text-sm px-8 shadow-md"
            >
              {isSaving ? "جاري الحفظ..." : initialData ? "حفظ التعديلات" : "إضافة المحتوى"}
            </button>
          </div>
        </form>
      </div>

      {/* ── KeyTermsModal Popup ── */}
      <KeyTermsModal
        isOpen={Boolean(activeKeyTermsSectionId)}
        onClose={() => setActiveKeyTermsSectionId(null)}
        hadithId={activeKeyTermsSectionId}
        initialKeyTerms={keyTermsTarget.keyTerms}
        onSaveKeyTerms={handleSaveSectionKeyTerms}
        sectionTitle={keyTermsTarget.title}
      />

      {/* ── Unsaved Changes Guard Dialog ── */}
      {showConfirmClose && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-base-100 border border-base-300 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 mx-auto flex items-center justify-center text-2xl">
              <HiOutlineExclamationCircle />
            </div>

            <h3 className="font-1 font-bold text-lg text-base-content">
              إلغاء المدخلات وإغلاق النافذة؟
            </h3>

            <p className="font-2 text-xs text-base-content/70 leading-relaxed">
              لقد قمت بإدخال أو تعديل بعض البيانات. هل أنت تأكد من رغبتك في إلغاء التغييرات؟ ستفقد كافة المدخلات التي كتبت بها.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmClose(false)}
                className="btn btn-outline border-base-300 font-2 rounded-xl text-xs flex-1"
              >
                متابعة التعديل
              </button>

              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="btn bg-red-600 hover:bg-red-700 text-white font-2 font-bold rounded-xl text-xs flex-1"
              >
                نعم، إلغاء المدخلات
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
