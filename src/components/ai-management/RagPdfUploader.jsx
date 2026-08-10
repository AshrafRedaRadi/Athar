import React, { useState } from "react";
import { HiOutlineUpload, HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineExclamation } from "react-icons/hi";

/**
 * RagPdfUploader - Premium Drag & Drop PDF Uploader for RAG Knowledge Base.
 */
export default function RagPdfUploader({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("الحديث وشروحه");
  const [chunkSize, setChunkSize] = useState(500);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    setErrorMessage("");
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.pdf$/i, ""));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("يرجى اختيار ملف PDF للرفع أولاً.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setErrorMessage("");
    setSuccessMessage("");

    // Simulate upload progress interval
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      await onUploadSuccess(selectedFile, { title, category, chunkSize });
      clearInterval(interval);
      setUploadProgress(100);
      setSuccessMessage(`تم رفع وتفكيك ملف "${title || selectedFile.name}" وتخزين متجهاته بنجاح في قاعدة المعرفة!`);
      
      // Reset form
      setSelectedFile(null);
      setTitle("");
    } catch (err) {
      clearInterval(interval);
      setErrorMessage(err?.message || "حدث خطأ أثناء رفع وتفكيك كتاب PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-xs font-2 space-y-6" dir="rtl">
      <div className="flex items-center justify-between pb-4 border-b border-base-200">
        <div>
          <h2 className="font-1 font-bold text-lg text-base-content flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-base">
              <HiOutlineDocumentText />
            </span>
            <span>إضافة كتاب جديد لقاعدة المعرفة (PDF Ingestion)</span>
          </h2>
          <p className="text-xs text-base-content/60 mt-1">
            قم برفع متون وشروح الأحاديث بصيغة PDF لتفكيكها وتغذية محرك الـ RAG والمساعد الذكي بها.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-error text-xs rounded-xl flex items-center gap-2 py-3 px-4 font-medium">
          <HiOutlineExclamation className="text-lg shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success text-xs text-white rounded-xl flex items-center gap-2 py-3 px-4 font-medium">
          <HiOutlineCheckCircle className="text-lg shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Dropzone Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            selectedFile
              ? "border-cyan-700 bg-cyan-50/40 dark:bg-cyan-950/20"
              : "border-base-300 hover:border-cyan-600 bg-base-200/30"
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0])}
            className="hidden"
            id="pdf-dropzone-input"
          />
          <label htmlFor="pdf-dropzone-input" className="cursor-pointer flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-3xl">
              <HiOutlineUpload />
            </div>
            {selectedFile ? (
              <div className="space-y-1">
                <span className="font-bold text-sm text-cyan-800 dark:text-cyan-400 block truncate max-w-md mx-auto">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-base-content/60">
                  الحجم: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - اضغط للتغيير
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="font-bold text-sm text-base-content">
                  إسقاط كتاب PDF هنا أو اضغط للتصفح من جهازك
                </span>
                <span className="text-xs text-base-content/50 block">
                  تدعم الكتب والكتب المنسقة حتى 50 ميجابايت
                </span>
              </div>
            )}
          </label>
        </div>

        {/* Metadata Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
              عنوان الكتاب / المتن <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: جامع العلوم والحكم"
              className="input input-bordered w-full rounded-xl text-xs font-2"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
              تصنيف الكتاب <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select select-bordered w-full rounded-xl text-xs font-2 cursor-pointer"
            >
              <option value="الحديث وشروحه">الحديث وشروحه</option>
              <option value="العقيدة والتوحيد">العقيدة والتوحيد</option>
              <option value="الفقه والأصول">الفقه والأصول</option>
              <option value="التفسير">التفسير والقرآن</option>
              <option value="عام">علوم إسلامية عامة</option>
            </select>
          </div>

          {/* Chunk Size */}
          <div>
            <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
              حجم الشريحة (Chunk Size)
            </label>
            <select
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="select select-bordered w-full rounded-xl text-xs font-2 cursor-pointer"
            >
              <option value={300}>300 حرف (دقة عالية في الاسترجاع)</option>
              <option value={500}>500 حرف (الموصى به للأحاديث)</option>
              <option value={1000}>1000 حرف (للشروحات والكتب المطولة)</option>
            </select>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-base-content/70">
              <span>جاري رفع وتجزئة الكتاب وإنشاء المتجهات...</span>
              <span className="font-bold text-cyan-700">{uploadProgress}%</span>
            </div>
            <progress className="progress progress-info w-full" value={uploadProgress} max="100" />
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold px-8 shadow-md gap-2"
          >
            {isUploading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                <span>جاري معالجة الكتاب...</span>
              </>
            ) : (
              <>
                <HiOutlineUpload className="text-base" />
                <span>رفع وتغذية قاعدة المعرفة</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
