import React, { useState } from "react";
import {
  HiOutlineDocumentArrowUp,
  HiOutlineBookOpen,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { aiAssistantService } from "../../services/aiAssistantService";

const BOOK_TYPES = [
  { value: "HadithCollection", label: "مجموعة حديثية / كتب الحديث (HadithCollection)" },
  { value: "Matn", label: "متن علمي (Matn)" },
  { value: "Manzuma", label: "منظومة شعرية (Manzuma)" },
  { value: "Commentary", label: "شرح / حاشية (Commentary)" },
];

const PROCESSING_PROFILES = [
  { value: "Hadith", label: "معالجة أحاديث وأسانيد (Hadith Profile)" },
  { value: "Matn", label: "معالجة متون وفصول (Matn Profile)" },
  { value: "Manzuma", label: "معالجة أبيات ومنظومات (Manzuma Profile)" },
  { value: "Commentary", label: "معالجة شروح وحواشي (Commentary Profile)" },
];

export default function RagPdfUploader({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [edition, setEdition] = useState("");
  const [publisher, setPublisher] = useState("");
  const [bookType, setBookType] = useState("HadithCollection");
  const [processingProfile, setProcessingProfile] = useState("Hadith");
  const [isCoreLibrary, setIsCoreLibrary] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      handleSelectFile(files[0]);
    }
  };

  const handleSelectFile = (file) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("يرجى اختيار ملف بصيغة PDF فقط.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("حجم الملف يتجاوز الحد الأقصى المسموح به (50 ميجابايت).");
      return;
    }
    setErrorMessage("");
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.pdf$/i, ""));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessInfo(null);

    if (!selectedFile) {
      setErrorMessage("يرجى اختيار ملف PDF للرفع أولاً.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("عنوان الكتاب مطلوب.");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("author", author.trim() || "");
      formData.append("description", description.trim() || "");
      formData.append("edition", edition.trim() || "");
      formData.append("publisher", publisher.trim() || "");
      formData.append("bookType", bookType);
      formData.append("processingProfile", processingProfile);
      formData.append("isCoreLibrary", String(isCoreLibrary));
      formData.append("pdf", selectedFile);

      const res = await aiAssistantService.uploadKnowledgeBook(formData);
      const data = res?.data || res;

      const createdBook = {
        bookId: data?.bookId || Date.now(),
        id: data?.bookId || Date.now(),
        title: title.trim(),
        author: author.trim(),
        bookType,
        processingProfile,
        processingStatus: data?.processingStatus || "Pending",
        isPublished: false,
        pageCount: null,
        chunkCount: null,
        fileName: selectedFile.name,
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString(),
      };

      setSuccessInfo({
        bookId: data?.bookId,
        title: title.trim(),
        jobId: data?.hangfireJobId,
      });

      if (onUploadSuccess) {
        onUploadSuccess(createdBook);
      }

      // Reset form fields
      setSelectedFile(null);
      setTitle("");
      setAuthor("");
      setDescription("");
      setEdition("");
      setPublisher("");
      setIsCoreLibrary(false);
    } catch (err) {
      console.error("Error uploading knowledge book:", err);
      setErrorMessage(err?.message || "حدث خطأ أثناء رفع ومعالجة كتاب الـ PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-base-100 dark:bg-slate-900 border border-base-300 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm font-2 space-y-7 transition-all" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-base-200 dark:border-slate-800">
        <div>
          <h2 className="font-1 font-bold text-xl sm:text-2xl text-base-content flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-cyan-700/10 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-2xl shrink-0 shadow-xs">
              <HiOutlineDocumentArrowUp />
            </span>
            <span>رفع كتاب ومعالجة PDF</span>
          </h2>
          <p className="text-sm sm:text-base text-base-content/70 mt-1.5 font-2">
            رفع ملفات PDF للمتون والشروح واستخراج النصوص وبناء متجهات الـ RAG تلقائياً عبر السيرفر.
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {successInfo && (
        <div className="alert alert-success text-sm sm:text-base rounded-2xl flex items-center justify-between py-4 px-5 font-medium shadow-xs animate-fadeIn font-2 text-white">
          <div className="flex items-center gap-2.5">
            <HiOutlineCheckCircle className="text-2xl shrink-0" />
            <span>
              تم قبول كتاب <strong>"{successInfo.title}"</strong> (رقم: {successInfo.bookId}) وبدأت المعالجة بنجاح (HTTP 202 Accepted) 🎉
            </span>
          </div>
          <span className="badge badge-md badge-outline font-mono text-xs">
            Job: {successInfo.jobId || "Active"}
          </span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="alert alert-error text-sm sm:text-base rounded-2xl flex items-center gap-2.5 py-4 px-5 font-medium shadow-xs font-2 text-white">
          <HiOutlineExclamationTriangle className="text-2xl shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* PDF File Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className={`border-2 border-dashed rounded-3xl p-7 sm:p-10 text-center transition-all cursor-pointer ${
            selectedFile
              ? "border-cyan-600 bg-cyan-50/50 dark:bg-cyan-950/20"
              : "border-base-300 dark:border-slate-700 hover:border-cyan-600/60 bg-base-200/40 dark:bg-slate-800/40"
          }`}
          onClick={() => document.getElementById("pdf-file-input").click()}
        >
          <input
            id="pdf-file-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleSelectFile(e.target.files[0]);
            }}
          />

          <div className="flex flex-col items-center justify-center gap-2.5 sm:gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-700/10 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-2xl sm:text-3xl shadow-xs">
              <HiOutlineBookOpen />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <p className="font-bold text-sm sm:text-base text-cyan-700 dark:text-cyan-400 font-1">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-base-content/70 font-mono">
                  الحجم: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <span className="badge badge-sm badge-success font-bold text-xs mt-0.5 font-2 text-white">
                  جاهز للرفع والمعالجة
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-bold text-sm sm:text-base text-base-content font-1">
                  اسحب وأفلت ملف الـ PDF هنا، أو <span className="text-cyan-700 dark:text-cyan-400 underline">تصفح من جهازك</span>
                </p>
                <p className="text-xs text-base-content/60 font-2">
                  يدعم ملفات الكتب والمتون بصيغة PDF (الحد الأقصى 50 ميجابايت)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Book Metadata Fields (2-Columns Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* 1. Title (Required) */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-base-content font-2">
              عنوان الكتاب / المتن <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={300}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: الأربعون النووية في الأحاديث الصحيحة النبوية"
              className="input input-bordered w-full rounded-xl text-xs sm:text-sm font-2 bg-base-100 dark:bg-slate-800 border-base-300 dark:border-slate-700 h-10 sm:h-11"
            />
          </div>

          {/* 2. Author (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-base-content font-2">
              اسم المؤلف / الشارح
            </label>
            <input
              type="text"
              maxLength={300}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="مثال: الإمام يحيى بن شرف النووي"
              className="input input-bordered w-full rounded-xl text-xs sm:text-sm font-2 bg-base-100 dark:bg-slate-800 border-base-300 dark:border-slate-700 h-10 sm:h-11"
            />
          </div>

          {/* 3. Book Type (Required) */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-base-content font-2">
              تصنيف الكتاب (Book Type) <span className="text-error">*</span>
            </label>
            <select
              value={bookType}
              onChange={(e) => setBookType(e.target.value)}
              className="select select-bordered w-full rounded-xl text-xs sm:text-sm font-2 cursor-pointer bg-base-100 dark:bg-slate-800 border-base-300 dark:border-slate-700 h-10 sm:h-11"
            >
              {BOOK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Processing Profile (Required) */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-base-content font-2">
              نوع المعالجة وتقطيع المتجهات (Processing Profile) <span className="text-error">*</span>
            </label>
            <select
              value={processingProfile}
              onChange={(e) => setProcessingProfile(e.target.value)}
              className="select select-bordered w-full rounded-xl text-xs sm:text-sm font-2 cursor-pointer bg-base-100 dark:bg-slate-800 border-base-300 dark:border-slate-700 h-10 sm:h-11"
            >
              {PROCESSING_PROFILES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Edition (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-base-content font-2">
              الطبعة / التحقيق
            </label>
            <input
              type="text"
              maxLength={200}
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              placeholder="مثال: الطبعة الثالثة - تحقيق الشيخ عبد القادر الأرناؤوط"
              className="input input-bordered w-full rounded-xl text-xs sm:text-sm font-2 bg-base-100 dark:bg-slate-800 border-base-300 dark:border-slate-700 h-10 sm:h-11"
            />
          </div>

          {/* 6. Publisher (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-base-content font-2">
              دار النشر
            </label>
            <input
              type="text"
              maxLength={300}
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="مثال: دار المنهاج للنشر والتوزيع"
              className="input input-bordered w-full rounded-xl text-xs sm:text-sm font-2 bg-base-100 dark:bg-slate-800 border-base-300 dark:border-slate-700 h-10 sm:h-11"
            />
          </div>
        </div>

        {/* 7. Description (Optional) */}
        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm font-semibold text-base-content font-2">
            وصف ومقدمة عن الكتاب (Description)
          </label>
          <textarea
            rows={3}
            maxLength={4000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="نبذة مختصرة عن محتوى الكتاب، الأبواب التي يغطيها..."
            className="textarea textarea-bordered w-full rounded-xl text-xs sm:text-sm font-2 bg-base-100 dark:bg-slate-800 border-base-300 dark:border-slate-700 p-3.5"
          />
        </div>

        {/* 8. isCoreLibrary Flag */}
        <div className="flex items-center justify-between p-4 bg-base-200/50 dark:bg-slate-800/60 rounded-xl border border-base-300 dark:border-slate-700">
          <div className="space-y-0.5">
            <span className="font-semibold text-xs sm:text-sm text-base-content block font-2">
              إضافة ككتاب أساسي في المنصة (isCoreLibrary)
            </span>
            <p className="text-[11px] sm:text-xs text-base-content/70 font-2">
              تحديد ما إذا كان الكتاب من المتون الرسمية الأساسية لمنصة أثر
            </p>
          </div>
          <input
            type="checkbox"
            checked={isCoreLibrary}
            onChange={(e) => setIsCoreLibrary(e.target.checked)}
            className="checkbox checkbox-primary checkbox-sm rounded-lg"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-1 flex justify-end">
          <button
            type="submit"
            disabled={isUploading || !selectedFile || !title.trim()}
            className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-2 font-bold text-xs sm:text-sm px-6 h-10 sm:h-11 shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer disabled:opacity-60 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                <span>جاري الرفع وبدء المعالجة...</span>
              </>
            ) : (
              <>
                <HiOutlineSparkles className="text-base" />
                <span>رفع وبدء المعالجة الذكية</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
