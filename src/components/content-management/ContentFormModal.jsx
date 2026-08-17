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
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi";
import KeyTermsModal from "./KeyTermsModal";
import StructureModeSelector from "./StructureModeSelector";
import {
  BOOK_STRUCTURE_MODES,
  STRUCTURE_MODE_CONFIG,
  SECTION_TYPES,
  SECTION_TYPE_LABELS,
  createEmptyFormSection,
  createEmptyFormHadith,
} from "../../utils/hadithSectionTree";

// Helper to generate empty section object (legacy flat mode)
const createEmptySection = (index = 1) => ({
  id: Date.now() + Math.random(),
  title: "",
  hadithNumber: "",
  matnText: "",
  explanations: [
    {
      id: Date.now() + Math.random() + 1,
      scholarOrBook: "",
      text: "",
    },
  ],
  keyTerms: [],
  videoUrl: "",
  audioFile: null,
  audioFileName: "",
});

/**
 * ContentFormModal - Advanced Form Modal for Adding/Editing Hadith Books & Matn Sections.
 * Supports 3 structure modes:
 * 1. Direct (flat hadiths/paragraphs)
 * 2. Kitab → Bab → Hadiths
 * 3. Bab → Fasl → Paragraphs
 */
export default function ContentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSaving = false,
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
    structureMode: BOOK_STRUCTURE_MODES.DIRECT,
    // For DIRECT mode (النمط 1)
    sections: [createEmptySection(1)],
    // For KITAB_BAB & BAB_FASL modes (النمط 2 و 3)
    hierarchySections: [],
  });

  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isFormTouched, setIsFormTouched] = useState(false);
  const [activeKeyTermsSectionId, setActiveKeyTermsSectionId] = useState(null);
  const [showModeChangeWarning, setShowModeChangeWarning] = useState(null);
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
        structureMode: initialData.structureMode || BOOK_STRUCTURE_MODES.DIRECT,
        sections:
          initialData.sections && initialData.sections.length > 0
            ? initialData.sections
            : [
              {
                id: Date.now(),
                title: initialData.matnTitle || "",
                matnText: initialData.matnText || "",
                explanations: [
                  {
                    id: Date.now() + 1,
                    scholarOrBook: initialData.scholarName || "",
                    text: initialData.textExplanation || "",
                  },
                ],
                videoUrl: initialData.videoExplanation || "",
                audioFile: null,
                audioFileName: initialData.audioUrl ? "تسجيل صوتي سابق" : "",
              },
            ],
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
        structureMode: BOOK_STRUCTURE_MODES.DIRECT,
        sections: [createEmptySection(1)],
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
  // STRUCTURE MODE CHANGE
  // ────────────────────────────────────────────────

  const hasAnyContent = () => {
    // Check direct mode
    const hasDirect = formData.sections.some(
      (s) => s.title || s.matnText || s.explanations.some((e) => e.text || e.scholarOrBook)
    );
    // Check hierarchy mode
    const hasHierarchy = formData.hierarchySections.length > 0;
    return hasDirect || hasHierarchy;
  };

  const handleStructureModeChange = (newMode) => {
    if (newMode === formData.structureMode) return;
    // Always show confirmation when editing existing book OR when any content has been entered
    if (initialData || hasAnyContent()) {
      setShowModeChangeWarning(newMode);
    } else {
      applyStructureModeChange(newMode);
    }
  };

  const applyStructureModeChange = (newMode) => {
    markTouched();
    setFormData((prev) => ({
      ...prev,
      structureMode: newMode,
      sections: [createEmptySection(1)],
      hierarchySections: [],
    }));
    setCollapsedSections(new Set());
    setShowModeChangeWarning(null);
  };

  // ────────────────────────────────────────────────
  // DIRECT MODE (النمط 1) HANDLERS
  // ────────────────────────────────────────────────

  const getPrimaryScholarOrBook = (secList) => {
    return secList?.[0]?.explanations?.[0]?.scholarOrBook || "";
  };

  const handleAddSection = () => {
    markTouched();
    const primaryScholar = getPrimaryScholarOrBook(formData.sections);
    const newSection = createEmptySection(formData.sections.length + 1);
    if (primaryScholar && newSection.explanations[0]) {
      newSection.explanations[0].scholarOrBook = primaryScholar;
    }
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const handleRemoveSection = (sectionId) => {
    if (formData.sections.length <= 1) return;
    markTouched();
    setFormData((prev) => {
      const secToRemove = prev.sections.find((s) => s.id === sectionId || s._localId === sectionId);
      const delId = secToRemove?.id && typeof secToRemove.id === "number" && secToRemove.id < 1e9 ? secToRemove.id : null;
      return {
        ...prev,
        deletedHadithIds: delId ? [...(prev.deletedHadithIds || []), delId] : prev.deletedHadithIds,
        sections: prev.sections.filter((s) => s.id !== sectionId && s._localId !== sectionId),
      };
    });
  };

  const handleSectionChange = (sectionId, field, value) => {
    markTouched();
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, [field]: value } : s
      ),
    }));
  };

  const handleAudioUpload = (sectionId, e) => {
    const file = e.target.files?.[0];
    if (file) {
      markTouched();
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId
            ? { ...s, audioFile: file, audioFileName: file.name }
            : s
        ),
      }));
    }
  };

  const handleAddExplanation = (sectionId) => {
    markTouched();
    const primaryScholar = getPrimaryScholarOrBook(formData.sections);
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            explanations: [
              ...s.explanations,
              {
                id: Date.now() + Math.random(),
                scholarOrBook: primaryScholar || "",
                text: "",
              },
            ],
          };
        }
        return s;
      }),
    }));
  };

  const handleRemoveExplanation = (sectionId, expId) => {
    markTouched();
    setFormData((prev) => {
      const targetSection = prev.sections.find((s) => s.id === sectionId);
      const targetExp = targetSection?.explanations?.find((e) => e.id === expId || e._localId === expId);
      const deletedId = targetExp?.id && typeof targetExp.id === "number" && targetExp.id < 1e9 ? targetExp.id : null;

      return {
        ...prev,
        deletedExplanationIds: deletedId
          ? [...(prev.deletedExplanationIds || []), deletedId]
          : prev.deletedExplanationIds,
        sections: prev.sections.map((s) => {
          if (s.id === sectionId && s.explanations.length > 1) {
            return {
              ...s,
              explanations: s.explanations.filter((e) => (e.id || e._localId) !== expId),
            };
          }
          return s;
        }),
      };
    });
  };

  const handleExplanationChange = (sectionId, expId, field, value) => {
    markTouched();
    setFormData((prev) => {
      const isPrimaryExp =
        prev.sections.length > 0 &&
        prev.sections[0].id === sectionId &&
        prev.sections[0].explanations.length > 0 &&
        prev.sections[0].explanations[0].id === expId;
      const oldPrimaryScholar = getPrimaryScholarOrBook(prev.sections);
      return {
        ...prev,
        sections: prev.sections.map((s) => ({
          ...s,
          explanations: s.explanations.map((exp) => {
            if (s.id === sectionId && exp.id === expId) {
              return { ...exp, [field]: value };
            }
            if (
              isPrimaryExp &&
              field === "scholarOrBook" &&
              (!exp.scholarOrBook || exp.scholarOrBook === oldPrimaryScholar)
            ) {
              return { ...exp, scholarOrBook: value };
            }
            return exp;
          }),
        })),
      };
    });
  };

  const handleSaveSectionKeyTerms = (keyTermsList) => {
    if (!activeKeyTermsSectionId) return;
    markTouched();

    // Check direct mode sections
    const directSection = formData.sections.find((s) => s.id === activeKeyTermsSectionId);
    if (directSection) {
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === activeKeyTermsSectionId ? { ...s, keyTerms: keyTermsList } : s
        ),
      }));
      return;
    }

    // Check hierarchy mode hadiths
    setFormData((prev) => ({
      ...prev,
      hierarchySections: prev.hierarchySections.map((root) => ({
        ...root,
        hadiths: root.hadiths.map((h) =>
          h._localId === activeKeyTermsSectionId ? { ...h, keyTerms: keyTermsList } : h
        ),
        children: root.children.map((child) => ({
          ...child,
          hadiths: child.hadiths.map((h) =>
            h._localId === activeKeyTermsSectionId ? { ...h, keyTerms: keyTermsList } : h
          ),
        })),
      })),
    }));
  };

  // ────────────────────────────────────────────────
  // HIERARCHY MODE (النمط 2 و 3) HANDLERS
  // ────────────────────────────────────────────────

  const modeConfig = STRUCTURE_MODE_CONFIG[formData.structureMode];
  const rootLevel = modeConfig?.levels?.[0]; // e.g. { type: KITAB, label: "كتاب" }
  const childLevel = modeConfig?.levels?.[1]; // e.g. { type: BAB, label: "باب" }

  const handleAddRootSection = () => {
    markTouched();
    const newRoot = createEmptyFormSection(
      rootLevel.type,
      formData.hierarchySections.length + 1
    );
    setFormData((prev) => ({
      ...prev,
      hierarchySections: [...prev.hierarchySections, newRoot],
    }));
  };

  const handleRemoveRootSection = (localId) => {
    markTouched();
    setFormData((prev) => {
      const rootToDelete = (prev.hierarchySections || []).find((r) => r._localId === localId);
      const rootDelId = rootToDelete?.id && typeof rootToDelete.id === "number" && rootToDelete.id < 1e9 ? rootToDelete.id : null;
      const childDelIds = [];
      const hadithDelIds = [];
      for (const c of rootToDelete?.children || []) {
        if (c.id && typeof c.id === "number" && c.id < 1e9) childDelIds.push(c.id);
        for (const h of c.hadiths || []) {
          if (h.id && typeof h.id === "number" && h.id < 1e9) hadithDelIds.push(h.id);
        }
      }

      return {
        ...prev,
        deletedSectionIds: [
          ...(prev.deletedSectionIds || []),
          ...(rootDelId ? [rootDelId] : []),
          ...childDelIds,
        ],
        deletedHadithIds: [...(prev.deletedHadithIds || []), ...hadithDelIds],
        hierarchySections: prev.hierarchySections.filter((s) => s._localId !== localId),
      };
    });
  };

  const handleRootSectionNameChange = (localId, name) => {
    markTouched();
    setFormData((prev) => ({
      ...prev,
      hierarchySections: prev.hierarchySections.map((s) =>
        s._localId === localId ? { ...s, name } : s
      ),
    }));
  };

  const handleAddChildSection = (rootLocalId) => {
    markTouched();
    setFormData((prev) => ({
      ...prev,
      hierarchySections: prev.hierarchySections.map((root) => {
        if (root._localId === rootLocalId) {
          const newChild = createEmptyFormSection(
            childLevel.type,
            root.children.length + 1
          );
          return { ...root, children: [...root.children, newChild] };
        }
        return root;
      }),
    }));
  };

  const handleRemoveChildSection = (rootLocalId, childLocalId) => {
    markTouched();
    setFormData((prev) => {
      let deletedChildId = null;
      const childHadithDelIds = [];
      for (const r of prev.hierarchySections || []) {
        if (r._localId === rootLocalId) {
          const c = (r.children || []).find((ch) => ch._localId === childLocalId);
          if (c?.id && typeof c.id === "number" && c.id < 1e9) {
            deletedChildId = c.id;
          }
          for (const h of c?.hadiths || []) {
            if (h.id && typeof h.id === "number" && h.id < 1e9) {
              childHadithDelIds.push(h.id);
            }
          }
        }
      }

      return {
        ...prev,
        deletedSectionIds: deletedChildId
          ? [...(prev.deletedSectionIds || []), deletedChildId]
          : prev.deletedSectionIds,
        deletedHadithIds: childHadithDelIds.length > 0
          ? [...(prev.deletedHadithIds || []), ...childHadithDelIds]
          : prev.deletedHadithIds,
        hierarchySections: prev.hierarchySections.map((root) => {
          if (root._localId === rootLocalId) {
            return {
              ...root,
              children: root.children.filter((c) => c._localId !== childLocalId),
            };
          }
          return root;
        }),
      };
    });
  };

  const handleChildSectionNameChange = (rootLocalId, childLocalId, name) => {
    markTouched();
    setFormData((prev) => ({
      ...prev,
      hierarchySections: prev.hierarchySections.map((root) => {
        if (root._localId === rootLocalId) {
          return {
            ...root,
            children: root.children.map((c) =>
              c._localId === childLocalId ? { ...c, name } : c
            ),
          };
        }
        return root;
      }),
    }));
  };

  // Hadith/paragraph handlers within hierarchy
  const handleAddHadithToChild = (rootLocalId, childLocalId) => {
    markTouched();
    setFormData((prev) => ({
      ...prev,
      hierarchySections: prev.hierarchySections.map((root) => {
        if (root._localId === rootLocalId) {
          return {
            ...root,
            children: root.children.map((child) => {
              if (child._localId === childLocalId) {
                const newH = createEmptyFormHadith(child.hadiths.length + 1);
                return { ...child, hadiths: [...child.hadiths, newH] };
              }
              return child;
            }),
          };
        }
        return root;
      }),
    }));
  };

  const handleRemoveHadithFromChild = (rootLocalId, childLocalId, hadithLocalId) => {
    markTouched();
    setFormData((prev) => {
      let deletedHadithId = null;
      for (const r of prev.hierarchySections || []) {
        if (r._localId === rootLocalId) {
          for (const c of r.children || []) {
            if (c._localId === childLocalId) {
              const h = (c.hadiths || []).find((hd) => hd._localId === hadithLocalId);
              if (h?.id && typeof h.id === "number" && h.id < 1e9) {
                deletedHadithId = h.id;
              }
            }
          }
        }
      }

      return {
        ...prev,
        deletedHadithIds: deletedHadithId
          ? [...(prev.deletedHadithIds || []), deletedHadithId]
          : prev.deletedHadithIds,
        hierarchySections: prev.hierarchySections.map((root) => {
          if (root._localId === rootLocalId) {
            return {
              ...root,
              children: root.children.map((child) => {
                if (child._localId === childLocalId) {
                  return {
                    ...child,
                    hadiths: child.hadiths.filter((h) => h._localId !== hadithLocalId),
                  };
                }
                return child;
              }),
            };
          }
          return root;
        }),
      };
    });
  };

  const handleHadithFieldChange = (rootLocalId, childLocalId, hadithLocalId, field, value) => {
    markTouched();
    setFormData((prev) => ({
      ...prev,
      hierarchySections: prev.hierarchySections.map((root) => {
        if (root._localId === rootLocalId) {
          return {
            ...root,
            children: root.children.map((child) => {
              if (child._localId === childLocalId) {
                return {
                  ...child,
                  hadiths: child.hadiths.map((h) =>
                    h._localId === hadithLocalId ? { ...h, [field]: value } : h
                  ),
                };
              }
              return child;
            }),
          };
        }
        return root;
      }),
    }));
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
    onSubmit({
      ...formData,
      coverImage: formData.coverImagePreview || "",
      matnText: formData.sections[0]?.matnText || "",
      textExplanation: formData.sections[0]?.explanations[0]?.text || "",
      videoExplanation: formData.sections[0]?.videoUrl || "",
      audioUrl: formData.sections[0]?.audioFileName || "",
    });
  };

  // ────────────────────────────────────────────────
  // FIND KEY TERMS SECTION DATA (for modal)
  // ────────────────────────────────────────────────

  const findKeyTermsTarget = () => {
    if (!activeKeyTermsSectionId) return { keyTerms: [], title: "" };
    // Direct mode
    const directSec = formData.sections.find((s) => s.id === activeKeyTermsSectionId);
    if (directSec) return { keyTerms: directSec.keyTerms || [], title: directSec.title || "" };
    // Hierarchy mode
    for (const root of formData.hierarchySections) {
      for (const child of root.children) {
        for (const h of child.hadiths) {
          if (h._localId === activeKeyTermsSectionId) {
            return { keyTerms: h.keyTerms || [], title: h.title || "" };
          }
        }
      }
      for (const h of root.hadiths || []) {
        if (h._localId === activeKeyTermsSectionId) {
          return { keyTerms: h.keyTerms || [], title: h.title || "" };
        }
      }
    }
    return { keyTerms: [], title: "" };
  };

  const keyTermsTarget = findKeyTermsTarget();

  // ────────────────────────────────────────────────
  // RENDER: HADITH/PARAGRAPH CARD (reused across modes)
  // ────────────────────────────────────────────────

  const renderHadithCard = (sec, sIdx, { onRemove, isRemovable = true } = {}) => (
    <div
      key={sec.id || sec._localId}
      className="bg-base-100 rounded-2xl border-2 border-cyan-700/20 p-5 space-y-5 shadow-xs relative"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-base-200 pb-3">
        <span className="badge bg-cyan-700 text-white font-bold text-xs px-3 py-1 rounded-lg">
          الحديث / الفقرة {sIdx + 1}
        </span>
        {isRemovable && (
          <button
            type="button"
            onClick={onRemove}
            className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg gap-1"
            title="حذف هذا الحديث أو الفقرة"
          >
            <HiTrash className="text-sm" />
            <span>حذف</span>
          </button>
        )}
      </div>

      {/* Title (Optional) */}
      <div>
        <label className="block text-xs font-semibold text-base-content/80 mb-1.5 flex items-center gap-1.5">
          <HiOutlineBookOpen className="text-base text-cyan-700" />
          <span>عنوان الحديث أو الفقرة <span className="text-base-content/50 font-normal">(اختياري)</span></span>
        </label>
        <input
          type="text"
          value={sec.title}
          onChange={(e) => {
            const val = e.target.value;
            if (sec.id) handleSectionChange(sec.id, "title", val);
            else if (sec._localId) handleHadithFieldChangeGeneric(sec._localId, "title", val);
          }}
          placeholder="مثال: الحديث الأول: إنما الأعمال بالنيات (اختياري)"
          className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-sm font-2 text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs"
        />
      </div>

      {/* Hadith Number — free text, since books number as "٣" or "١٢ مكرر" */}
      <div>
        <label className="block text-xs font-semibold text-base-content/80 mb-1.5 flex items-center gap-1.5">
          <HiOutlineBookOpen className="text-base text-cyan-700" />
          <span>رقم الحديث <span className="text-base-content/50 font-normal">(اختياري)</span></span>
        </label>
        <input
          type="text"
          value={sec.hadithNumber || ""}
          onChange={(e) => {
            const val = e.target.value;
            if (sec.id) handleSectionChange(sec.id, "hadithNumber", val);
            else if (sec._localId) handleHadithFieldChangeGeneric(sec._localId, "hadithNumber", val);
          }}
          placeholder="مثال: ١ أو 12 مكرر"
          className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-sm font-2 text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs"
        />
      </div>

      {/* Main Matn Text */}
      <div>
        <label className="block text-xs font-semibold text-base-content/80 mb-1 flex items-center gap-1.5">
          <HiOutlineDocumentText className="text-base text-cyan-700" />
          <span>نص المتن الرئيسي <span className="text-red-500">*</span></span>
        </label>
        <textarea
          rows={4}
          required
          value={sec.matnText}
          onChange={(e) => {
            const val = e.target.value;
            if (sec.id) handleSectionChange(sec.id, "matnText", val);
            else if (sec._localId) handleHadithFieldChangeGeneric(sec._localId, "matnText", val);
          }}
          placeholder="اكتب أو ألصق نص المتن الأصلي..."
          className="w-full p-4 rounded-xl border border-base-300 bg-base-100 text-base font-4 leading-relaxed text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs"
        />

        {/* Key Terms Button */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => setActiveKeyTermsSectionId(sec.id || sec._localId)}
            className="btn btn-xs sm:btn-sm btn-outline border-cyan-700/60 text-cyan-700 hover:bg-cyan-700 hover:text-white font-2 rounded-xl text-xs flex items-center gap-1.5 font-bold transition-all shadow-2xs group"
          >
            <HiOutlineSparkles className="text-sm text-cyan-700 group-hover:text-white" />
            <span>إدارة الكلمات الحساسة في النطق</span>
            {(sec.keyTerms?.length || 0) > 0 && (
              <span className="badge badge-sm bg-cyan-700 text-white font-bold px-2 py-0.5 rounded-full text-[10px]">
                {sec.keyTerms.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Text Explanations */}
      <div className="space-y-3 bg-base-200/40 p-4 rounded-xl border border-base-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-base-content/90 flex items-center gap-1.5">
            <HiOutlineBookOpen className="text-base text-cyan-700" />
            <span>الشروحات النصية المكتوبة</span>
          </label>
          <button
            type="button"
            onClick={() => {
              if (sec.id) handleAddExplanation(sec.id);
            }}
            className="btn btn-xs btn-outline border-cyan-700 text-cyan-700 hover:bg-cyan-700 hover:text-white rounded-lg text-[11px] gap-1 font-bold"
          >
            <HiPlus className="text-xs" />
            <span>إضافة شرح نصي آخر</span>
          </button>
        </div>

        {sec.explanations?.map((exp, eIdx) => (
          <div
            key={exp.id || exp._localId}
            className="bg-base-100 p-3.5 rounded-xl border border-base-300 space-y-3 relative"
          >
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={exp.scholarOrBook}
                onChange={(e) => {
                  if (sec.id) handleExplanationChange(sec.id, exp.id, "scholarOrBook", e.target.value);
                }}
                placeholder="اسم الشرح / الشيخ (مثال: شرح الشيخ ابن عثيمين)"
                className="w-full px-3 py-1.5 rounded-lg border border-base-300 bg-base-100 text-xs font-2 text-base-content focus:outline-hidden focus:border-cyan-600"
              />
              {sec.explanations.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (sec.id) handleRemoveExplanation(sec.id, exp.id);
                  }}
                  className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50 rounded-md shrink-0"
                  title="حذف هذا الشرح"
                >
                  <HiTrash className="text-sm" />
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={exp.text}
              onChange={(e) => {
                if (sec.id) handleExplanationChange(sec.id, exp.id, "text", e.target.value);
              }}
              placeholder="اكتب الشرح النصي والتعليقات..."
              className="w-full p-3 rounded-lg border border-base-300 bg-base-100 text-xs font-2 text-base-content focus:outline-hidden focus:border-cyan-600"
            />
          </div>
        ))}
      </div>

      {/* Video & Audio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-base-content/80 mb-1 flex items-center gap-1.5">
            <HiOutlineVideoCamera className="text-base text-cyan-700" />
            <span>الشرح المرئي (رابط الفيديو)</span>
          </label>
          <input
            type="text"
            value={sec.videoUrl}
            onChange={(e) => {
              if (sec.id) handleSectionChange(sec.id, "videoUrl", e.target.value);
            }}
            placeholder="رابط فيديو الشرح المرئي أو YouTube ID"
            className="w-full px-3.5 py-2 rounded-xl border border-base-300 bg-base-100 text-xs font-2 text-base-content focus:outline-hidden focus:border-cyan-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-base-content/80 mb-1 flex items-center gap-1.5">
            <HiOutlineVolumeUp className="text-base text-cyan-700" />
            <span>الصوتيات (رفع ملف صوتي من الجهاز)</span>
          </label>
          <div className="flex items-center gap-2">
            <label className="btn btn-sm btn-outline border-cyan-700/40 text-cyan-700 bg-base-100 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 font-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer grow shadow-xs">
              <HiOutlineUpload className="text-base text-cyan-700 shrink-0" />
              <span className="truncate">
                {sec.audioFileName || "رفع ملف صوتي من الجهاز (MP3 / WAV)"}
              </span>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  if (sec.id) handleAudioUpload(sec.id, e);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Placeholder for generic hadith field change (hierarchy mode)
  const handleHadithFieldChangeGeneric = () => { };

  // ────────────────────────────────────────────────
  // RENDER: HIERARCHY BUILDER (النمط 2 و 3)
  // ────────────────────────────────────────────────

  const renderHierarchyBuilder = () => {
    if (!rootLevel || !childLevel) return null;

    return (
      <div className="space-y-5">
        {formData.hierarchySections.map((root, rIdx) => {
          const isCollapsed = collapsedSections.has(root._localId);
          const totalHadiths = root.children.reduce((sum, c) => sum + c.hadiths.length, 0);

          return (
            <div
              key={root._localId}
              className="border-2 border-amber-500/30 dark:border-amber-700/30 rounded-2xl overflow-hidden shadow-xs"
            >
              {/* Root Section Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/50 dark:border-amber-800/30">
                <span className="badge bg-amber-600 text-white font-bold text-xs px-3 py-1 rounded-lg shrink-0">
                  {rootLevel.label} {rIdx + 1}
                </span>

                <input
                  type="text"
                  value={root.name}
                  onChange={(e) => handleRootSectionNameChange(root._localId, e.target.value)}
                  placeholder={`اسم ال${rootLevel.label} (مثال: ${rootLevel.label === "كتاب" ? "كتاب الطهارة" : "باب العبادات"})`}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-amber-300/60 dark:border-amber-800/50 bg-white dark:bg-slate-900 text-sm font-2 font-bold text-base-content focus:outline-hidden focus:border-amber-500 shadow-xs"
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Stats badge */}
                  <span className="text-[10px] text-amber-700/70 dark:text-amber-400/70 font-2 hidden sm:inline">
                    {root.children.length} {childLevel.plural} · {totalHadiths} عنصر
                  </span>

                  {/* Collapse toggle */}
                  <button
                    type="button"
                    onClick={() => toggleCollapse(root._localId)}
                    className="btn btn-ghost btn-xs rounded-lg text-amber-700 dark:text-amber-400"
                    title={isCollapsed ? "توسيع" : "طي"}
                  >
                    {isCollapsed ? <HiChevronDown className="text-base" /> : <HiChevronUp className="text-base" />}
                  </button>

                  {/* Delete root */}
                  <button
                    type="button"
                    onClick={() => handleRemoveRootSection(root._localId)}
                    className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                    title={`حذف ال${rootLevel.label}`}
                  >
                    <HiTrash className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Collapsible Content */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? "max-h-0 opacity-0" : "max-h-none opacity-100"
                  }`}
              >
                <div className="p-4 space-y-4">
                  {/* Child Sections */}
                  {root.children.map((child, cIdx) => {
                    const isChildCollapsed = collapsedSections.has(child._localId);

                    return (
                      <div
                        key={child._localId}
                        className="border border-cyan-600/20 dark:border-cyan-700/20 rounded-xl overflow-hidden"
                      >
                        {/* Child Header */}
                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-cyan-50/50 dark:bg-cyan-950/20 border-b border-cyan-200/40 dark:border-cyan-800/20">
                          <span className="badge bg-cyan-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-lg shrink-0">
                            {childLevel.label} {cIdx + 1}
                          </span>

                          <input
                            type="text"
                            value={child.name}
                            onChange={(e) =>
                              handleChildSectionNameChange(root._localId, child._localId, e.target.value)
                            }
                            placeholder={`اسم ال${childLevel.label} (مثال: ${childLevel.label === "باب" ? "باب الوضوء" : "فصل الصيام"})`}
                            className="flex-1 px-2.5 py-1 rounded-lg border border-cyan-300/50 dark:border-cyan-800/40 bg-white dark:bg-slate-900 text-xs font-2 font-bold text-base-content focus:outline-hidden focus:border-cyan-500"
                          />

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] text-cyan-600/60 font-2 hidden sm:inline">
                              {child.hadiths.length} عنصر
                            </span>

                            <button
                              type="button"
                              onClick={() => toggleCollapse(child._localId)}
                              className="btn btn-ghost btn-xs rounded-lg text-cyan-600"
                              title={isChildCollapsed ? "توسيع" : "طي"}
                            >
                              {isChildCollapsed ? <HiChevronDown className="text-sm" /> : <HiChevronUp className="text-sm" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveChildSection(root._localId, child._localId)}
                              className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                              title={`حذف ال${childLevel.label}`}
                            >
                              <HiTrash className="text-xs" />
                            </button>
                          </div>
                        </div>

                        {/* Child Content: Hadiths */}
                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${isChildCollapsed ? "max-h-0 opacity-0" : "max-h-none opacity-100"
                            }`}
                        >
                          <div className="p-3.5 space-y-3">
                            {child.hadiths.length === 0 && (
                              <p className="text-xs text-base-content/50 text-center py-3 font-2">
                                لا توجد أحاديث أو فقرات بعد في هذا ال{childLevel.label}
                              </p>
                            )}

                            {child.hadiths.map((h, hIdx) => (
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
                                    onClick={() => handleRemoveHadithFromChild(root._localId, child._localId, h._localId)}
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
                                      handleHadithFieldChange(root._localId, child._localId, h._localId, "title", e.target.value)
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
                                      handleHadithFieldChange(root._localId, child._localId, h._localId, "matnText", e.target.value)
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
                                      onClick={() => {
                                        markTouched();
                                        setFormData((prev) => ({
                                          ...prev,
                                          hierarchySections: prev.hierarchySections.map((r) => {
                                            if (r._localId === root._localId) {
                                              return {
                                                ...r,
                                                children: r.children.map((c) => {
                                                  if (c._localId === child._localId) {
                                                    return {
                                                      ...c,
                                                      hadiths: c.hadiths.map((hd) => {
                                                        if (hd._localId === h._localId) {
                                                          return {
                                                            ...hd,
                                                            explanations: [
                                                              ...hd.explanations,
                                                              { _localId: Date.now() + Math.random(), scholarOrBook: "", text: "" },
                                                            ],
                                                          };
                                                        }
                                                        return hd;
                                                      }),
                                                    };
                                                  }
                                                  return c;
                                                }),
                                              };
                                            }
                                            return r;
                                          }),
                                        }));
                                      }}
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
                                        <input
                                          type="text"
                                          value={exp.scholarOrBook}
                                          onChange={(e) => {
                                            markTouched();
                                            setFormData((prev) => ({
                                              ...prev,
                                              hierarchySections: prev.hierarchySections.map((r) => {
                                                if (r._localId === root._localId) {
                                                  return {
                                                    ...r,
                                                    children: r.children.map((c) => {
                                                      if (c._localId === child._localId) {
                                                        return {
                                                          ...c,
                                                          hadiths: c.hadiths.map((hd) => {
                                                            if (hd._localId === h._localId) {
                                                              return {
                                                                ...hd,
                                                                explanations: hd.explanations.map((ex, i) =>
                                                                  i === eIdx ? { ...ex, scholarOrBook: e.target.value } : ex
                                                                ),
                                                              };
                                                            }
                                                            return hd;
                                                          }),
                                                        };
                                                      }
                                                      return c;
                                                    }),
                                                  };
                                                }
                                                return r;
                                              }),
                                            }));
                                          }}
                                          placeholder="اسم الشرح / الشيخ"
                                          className="w-full px-2.5 py-1 rounded-lg border border-base-300 bg-base-100 text-[11px] font-2 text-base-content focus:outline-hidden focus:border-cyan-600"
                                        />
                                        {h.explanations.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              markTouched();
                                              const expToDelete = h.explanations[eIdx];
                                              const delId = expToDelete?.id && typeof expToDelete.id === "number" && expToDelete.id < 1e9 ? expToDelete.id : null;

                                              setFormData((prev) => ({
                                                ...prev,
                                                deletedExplanationIds: delId
                                                  ? [...(prev.deletedExplanationIds || []), delId]
                                                  : prev.deletedExplanationIds,
                                                hierarchySections: prev.hierarchySections.map((r) => {
                                                  if (r._localId === root._localId) {
                                                    return {
                                                      ...r,
                                                      children: r.children.map((c) => {
                                                        if (c._localId === child._localId) {
                                                          return {
                                                            ...c,
                                                            hadiths: c.hadiths.map((hd) => {
                                                              if (hd._localId === h._localId) {
                                                                return {
                                                                  ...hd,
                                                                  explanations: hd.explanations.filter((_, i) => i !== eIdx),
                                                                };
                                                              }
                                                              return hd;
                                                            }),
                                                          };
                                                        }
                                                        return c;
                                                      }),
                                                    };
                                                  }
                                                  return r;
                                                }),
                                              }));
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
                                          markTouched();
                                          setFormData((prev) => ({
                                            ...prev,
                                            hierarchySections: prev.hierarchySections.map((r) => {
                                              if (r._localId === root._localId) {
                                                return {
                                                  ...r,
                                                  children: r.children.map((c) => {
                                                    if (c._localId === child._localId) {
                                                      return {
                                                        ...c,
                                                        hadiths: c.hadiths.map((hd) => {
                                                          if (hd._localId === h._localId) {
                                                            return {
                                                              ...hd,
                                                              explanations: hd.explanations.map((ex, i) =>
                                                                i === eIdx ? { ...ex, text: e.target.value } : ex
                                                              ),
                                                            };
                                                          }
                                                          return hd;
                                                        }),
                                                      };
                                                    }
                                                    return c;
                                                  }),
                                                };
                                              }
                                              return r;
                                            }),
                                          }));
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
                                        handleHadithFieldChange(root._localId, child._localId, h._localId, "videoUrl", e.target.value)
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
                                            handleHadithFieldChange(root._localId, child._localId, h._localId, "audioFile", file);
                                            handleHadithFieldChange(root._localId, child._localId, h._localId, "audioFileName", file.name);
                                          }
                                        }}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Add Hadith button */}
                            <button
                              type="button"
                              onClick={() => handleAddHadithToChild(root._localId, child._localId)}
                              className="btn btn-sm btn-outline border-cyan-700/50 text-cyan-700 hover:bg-cyan-700 hover:text-white rounded-xl text-xs font-bold gap-1 w-full"
                            >
                              <HiPlus className="text-sm" />
                              <span>إضافة حديث أو فقرة لهذا ال{childLevel.label}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Child Section button */}
                  <button
                    type="button"
                    onClick={() => handleAddChildSection(root._localId)}
                    className="btn btn-sm btn-outline border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-600 hover:text-white rounded-xl text-xs font-bold gap-1 w-full"
                  >
                    <HiPlus className="text-sm" />
                    <span>إضافة {childLevel.label} جديد داخل {rootLevel.label === "كتاب" ? "هذا الكتاب" : "هذا الباب"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Root Section button */}
        <button
          type="button"
          onClick={handleAddRootSection}
          className="btn btn-md bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold gap-1.5 shadow-xs w-full"
        >
          <HiPlus className="text-base" />
          <span>إضافة {rootLevel.label} جديد</span>
        </button>
      </div>
    );
  };

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

              {/* Structure Mode Selector */}
              <StructureModeSelector
                value={formData.structureMode}
                onChange={handleStructureModeChange}
                disabled={false}
              />
            </div>

            {/* ── DIRECT MODE (النمط 1): Flat sections ── */}
            {formData.structureMode === BOOK_STRUCTURE_MODES.DIRECT && (
              <div className="space-y-6">
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="btn btn-sm bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold gap-1 shadow-xs"
                  >
                    <HiPlus className="text-base" />
                    <span>إضافة فقرة أو حديث</span>
                  </button>
                </div>

                {formData.sections.map((sec, sIdx) =>
                  renderHadithCard(sec, sIdx, {
                    onRemove: () => handleRemoveSection(sec.id),
                    isRemovable: formData.sections.length > 1,
                  })
                )}
              </div>
            )}

            {/* ── HIERARCHY MODE (النمط 2 و 3): Kitab→Bab or Bab→Fasl ── */}
            {(formData.structureMode === BOOK_STRUCTURE_MODES.KITAB_BAB ||
              formData.structureMode === BOOK_STRUCTURE_MODES.BAB_FASL) && (
                <div className="space-y-4">
                  {formData.hierarchySections.length === 0 && (
                    <div className="text-center py-8 space-y-3">
                      <p className="text-sm text-base-content/50 font-2">
                        لم يتم إضافة أي {rootLevel?.plural} بعد. ابدأ بإضافة أول {rootLevel?.label}.
                      </p>
                    </div>
                  )}
                  {renderHierarchyBuilder()}
                </div>
              )}
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

      {/* ── Mode Change Warning Dialog ── */}
      {showModeChangeWarning && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-base-100 border border-base-300 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 mx-auto flex items-center justify-center text-2xl">
              <HiOutlineExclamationCircle />
            </div>

            <h3 className="font-1 font-bold text-lg text-base-content">
              تغيير الهيكل التنظيمي؟
            </h3>

            <p className="font-2 text-xs text-base-content/70 leading-relaxed">
              سيؤدي تغيير الهيكل التنظيمي إلى مسح جميع الأحاديث والفقرات المدخلة حالياً. هل تريد المتابعة؟
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModeChangeWarning(null)}
                className="btn btn-outline border-base-300 font-2 rounded-xl text-xs flex-1"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => applyStructureModeChange(showModeChangeWarning)}
                className="btn bg-amber-600 hover:bg-amber-700 text-white font-2 font-bold rounded-xl text-xs flex-1"
              >
                نعم، تغيير الهيكل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
