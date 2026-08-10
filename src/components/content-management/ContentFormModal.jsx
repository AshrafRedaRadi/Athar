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
  HiPlus,
  HiTrash,
} from "react-icons/hi";

// Helper to generate empty section object
const createEmptySection = (index = 1) => ({
  id: Date.now() + Math.random(),
  title: "",
  matnText: "",
  explanations: [
    {
      id: Date.now() + Math.random() + 1,
      scholarOrBook: "",
      text: "",
    },
  ],
  videoUrl: "",
  audioFile: null,
  audioFileName: "",
});

/**
 * ContentFormModal - Advanced Form Modal for Adding/Editing Hadith Books & Matn Sections.
 * Supports:
 * 1. Image File Upload for Cover
 * 2. Category selection matching search filter options (Required)
 * 3. Book Brief Description labeled "نبذة عن الكتاب" (Required)
 * 4. Hierarchical Matn Sections (Title, Main Text, Multiple Written Explanations, Video URL, Audio File Upload)
 * 5. Dynamic Section & Explanation Adders
 * 6. Large spacious layout (max-w-5xl)
 * 7. Unsaved Changes Guard on close
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
    sections: [createEmptySection(1)],
  });

  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isFormTouched, setIsFormTouched] = useState(false);

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
      });
      setIsFormTouched(false);
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
        sections: [createEmptySection(1)],
      });
      setIsFormTouched(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Mark form as modified
  const markTouched = () => {
    if (!isFormTouched) setIsFormTouched(true);
  };

  // Base field change handler
  const handleFieldChange = (field, value) => {
    markTouched();
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Cover image file change handler
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

  // Helper to get the primary scholar/book name from section 1 explanation 1
  const getPrimaryScholarOrBook = (secList) => {
    return secList?.[0]?.explanations?.[0]?.scholarOrBook || "";
  };

  // Sections Handlers
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
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
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

  // Explanations Handlers inside Section
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
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id === sectionId && s.explanations.length > 1) {
          return {
            ...s,
            explanations: s.explanations.filter((e) => e.id !== expId),
          };
        }
        return s;
      }),
    }));
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

            // Smart propagation: If user updates primary scholar/book name, propagate to unedited/matching ones
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

  // Request Close with Unsaved Guard
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
                إدخال وإدارة تفاصيل المتن والأقسام والشروحات الصويتة والمرئية.
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

              {/* 1.3 Category (Matching Filter Options) */}
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

              {/* 1.5 Main Site Visibility Control */}
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

            {/* 1.5 Brief Description (Required) */}
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

            {/* 1.6 Cover Image File Upload */}
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
          {/* SECTION 2: HIERARCHICAL MATN SECTIONS & EXPLANATIONS */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-700 text-white text-xs flex items-center justify-center font-bold">2</span>
                <h3 className="font-1 font-bold text-base text-cyan-700 dark:text-cyan-400">
                  أقسام المتن والشروحات والصوتيات (Hadith Sections & Explanations)
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAddSection}
                className="btn btn-sm bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold gap-1 shadow-xs"
              >
                <HiPlus className="text-base" />
                <span>إضافة قسم جديد</span>
              </button>
            </div>

            {formData.sections.map((sec, sIdx) => (
              <div
                key={sec.id}
                className="bg-base-100 rounded-2xl border-2 border-cyan-700/20 p-5 space-y-5 shadow-xs relative"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-base-200 pb-3">
                  <span className="badge bg-cyan-700 text-white font-bold text-xs px-3 py-1 rounded-lg">
                    القسم {sIdx + 1}
                  </span>

                  {formData.sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sec.id)}
                      className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg gap-1"
                      title="حذف هذا القسم"
                    >
                      <HiTrash className="text-sm" />
                      <span>حذف القسم</span>
                    </button>
                  )}
                </div>

                {/* 2.1 Section Name / Title (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-base-content/80 mb-1.5 flex items-center gap-1.5">
                    <HiOutlineBookOpen className="text-base text-cyan-700" />
                    <span>اسم القسم / عنوان الحديث <span className="text-base-content/50 font-normal">(اختياري)</span></span>
                  </label>
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => handleSectionChange(sec.id, "title", e.target.value)}
                    placeholder="مثال: الحديث الأول: إنما الأعمال بالنيات (اختياري)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-sm font-2 text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs"
                  />
                </div>

                {/* 2.1 Main Matn Text */}
                <div>
                  <label className="block text-xs font-semibold text-base-content/80 mb-1 flex items-center gap-1.5">
                    <HiOutlineDocumentText className="text-base text-cyan-700" />
                    <span>نص المتن الرئيسي لهذا القسم <span className="text-red-500">*</span></span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={sec.matnText}
                    onChange={(e) => handleSectionChange(sec.id, "matnText", e.target.value)}
                    placeholder="اكتب أو ألصق نص المتن الأصلي لهذا القسم..."
                    className="w-full p-4 rounded-xl border border-base-300 bg-base-100 text-base font-4 leading-relaxed text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs"
                  />
                </div>

                {/* 2.2 Text Explanations List (Multiple Allowed) */}
                <div className="space-y-3 bg-base-200/40 p-4 rounded-xl border border-base-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-base-content/90 flex items-center gap-1.5">
                      <HiOutlineBookOpen className="text-base text-cyan-700" />
                      <span>الشروحات النصية المكتوبة لهذا القسم (Explanation Books)</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleAddExplanation(sec.id)}
                      className="btn btn-xs btn-outline border-cyan-700 text-cyan-700 hover:bg-cyan-700 hover:text-white rounded-lg text-[11px] gap-1 font-bold"
                    >
                      <HiPlus className="text-xs" />
                      <span>إضافة شرح نصي آخر</span>
                    </button>
                  </div>

                  {sec.explanations.map((exp, eIdx) => (
                    <div
                      key={exp.id}
                      className="bg-base-100 p-3.5 rounded-xl border border-base-300 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={exp.scholarOrBook}
                          onChange={(e) =>
                            handleExplanationChange(sec.id, exp.id, "scholarOrBook", e.target.value)
                          }
                          placeholder="اسم الشرح / الشيخ (مثال: شرح الشيخ ابن عثيمين)"
                          className="w-full px-3 py-1.5 rounded-lg border border-base-300 bg-base-100 text-xs font-2 text-base-content focus:outline-hidden focus:border-cyan-600"
                        />

                        {sec.explanations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExplanation(sec.id, exp.id)}
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
                        onChange={(e) =>
                          handleExplanationChange(sec.id, exp.id, "text", e.target.value)
                        }
                        placeholder="اكتب الشرح النصي والتعليقات..."
                        className="w-full p-3 rounded-lg border border-base-300 bg-base-100 text-xs font-2 text-base-content focus:outline-hidden focus:border-cyan-600"
                      />
                    </div>
                  ))}
                </div>

                {/* 2.3 Video & Audio Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Video URL */}
                  <div>
                    <label className="block text-xs font-semibold text-base-content/80 mb-1 flex items-center gap-1.5">
                      <HiOutlineVideoCamera className="text-base text-cyan-700" />
                      <span>الشرح المرئي (رابط الفيديو)</span>
                    </label>
                    <input
                      type="text"
                      value={sec.videoUrl}
                      onChange={(e) => handleSectionChange(sec.id, "videoUrl", e.target.value)}
                      placeholder="رابط فيديو الشرح المرئي أو YouTube ID"
                      className="w-full px-3.5 py-2 rounded-xl border border-base-300 bg-base-100 text-xs font-2 text-base-content focus:outline-hidden focus:border-cyan-600"
                    />
                  </div>

                  {/* Audio File Upload */}
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
                          onChange={(e) => handleAudioUpload(sec.id, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
