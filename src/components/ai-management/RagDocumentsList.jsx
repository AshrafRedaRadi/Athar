import React, { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import {
  HiOutlineCircleStack,
  HiOutlineExclamationCircle,
  HiOutlineArrowPath,
  HiOutlineGlobeAlt,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineDocumentText,
  HiOutlineCpuChip,
} from "react-icons/hi2";
import { aiAssistantService } from "../../services/aiAssistantService";

const ACTIVE_PROCESSING_STATUSES = new Set([
  "Pending",
  "Extracting",
  "Cleaning",
  "DetectingStructure",
  "Chunking",
  "Embedding",
  "Indexing",
]);

const STATUS_CONFIG = {
  Pending: { label: "في انتظار المعالجة", badge: "badge-ghost", icon: "⏳" },
  Extracting: { label: "استخراج النص", badge: "badge-info", icon: "📄" },
  Cleaning: { label: "تنظيف التنسيق", badge: "badge-info", icon: "🧹" },
  DetectingStructure: { label: "اكتشاف الأبواب", badge: "badge-info", icon: "📑" },
  Chunking: { label: "إنشاء وحدات المعرفة", badge: "badge-warning", icon: "✂️" },
  Embedding: { label: "بناء المتجهات (Vectors)", badge: "badge-warning", icon: "🧠" },
  Indexing: { label: "الفهرسة في Qdrant", badge: "badge-warning", icon: "📥" },
  Ready: { label: "اكتملت المعالجة (جاهز)", badge: "badge-success", icon: "✅" },
  Failed: { label: "فشلت المعالجة", badge: "badge-error", icon: "❌" },
};

export default function RagDocumentsList({ documents = [], onUpdateDocuments, isLoading }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const docsRef = useRef(documents);
  docsRef.current = documents;

  // Smart Polling Effect for all Active Processing Books (every 2.5s)
  useEffect(() => {
    const activeBooks = (documents || []).filter((d) => {
      const st = d.processingStatus || d.status;
      return ACTIVE_PROCESSING_STATUSES.has(st);
    });

    if (activeBooks.length === 0) return;

    const interval = setInterval(async () => {
      let hasChanges = false;
      const updatedDocs = [...docsRef.current];

      for (let i = 0; i < updatedDocs.length; i++) {
        const doc = updatedDocs[i];
        const docId = doc.bookId ?? doc.id;
        const currentSt = doc.processingStatus || doc.status;

        if (docId && ACTIVE_PROCESSING_STATUSES.has(currentSt)) {
          try {
            const statusRes = await aiAssistantService.getBookStatus(docId);
            if (statusRes) {
              const newSt = statusRes.processingStatus || statusRes.status;
              if (
                newSt !== currentSt ||
                statusRes.isPublished !== doc.isPublished ||
                statusRes.chunkCount !== doc.chunkCount
              ) {
                updatedDocs[i] = {
                  ...doc,
                  ...statusRes,
                  processingStatus: newSt,
                };
                hasChanges = true;
              }
            }
          } catch (err) {
            console.warn(`Polling error for book ${docId}:`, err.message);
          }
        }
      }

      if (hasChanges && onUpdateDocuments) {
        onUpdateDocuments(updatedDocs);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [documents, onUpdateDocuments]);

  // Action Handlers
  const handlePublish = async (bookId) => {
    setActionLoadingId(`publish-${bookId}`);
    setActionError("");
    try {
      await aiAssistantService.publishBook(bookId);
      if (onUpdateDocuments) {
        onUpdateDocuments(
          docsRef.current.map((d) =>
            (d.bookId ?? d.id) === bookId ? { ...d, isPublished: true } : d
          )
        );
      }
    } catch (err) {
      setActionError(err?.message || "تعذر نشر الكتاب.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnpublish = async (bookId) => {
    setActionLoadingId(`unpublish-${bookId}`);
    setActionError("");
    try {
      await aiAssistantService.unpublishBook(bookId);
      if (onUpdateDocuments) {
        onUpdateDocuments(
          docsRef.current.map((d) =>
            (d.bookId ?? d.id) === bookId ? { ...d, isPublished: false } : d
          )
        );
      }
    } catch (err) {
      setActionError(err?.message || "تعذر إلغاء نشر الكتاب.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRetry = async (bookId) => {
    setActionLoadingId(`retry-${bookId}`);
    setActionError("");
    try {
      await aiAssistantService.retryBook(bookId);
      if (onUpdateDocuments) {
        onUpdateDocuments(
          docsRef.current.map((d) =>
            (d.bookId ?? d.id) === bookId
              ? { ...d, processingStatus: "Pending", processingError: null }
              : d
          )
        );
      }
    } catch (err) {
      setActionError(err?.message || "تعذر إعادة محاولة معالجة الكتاب.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReprocess = async (bookId) => {
    setActionLoadingId(`reprocess-${bookId}`);
    setActionError("");
    try {
      await aiAssistantService.reprocessBook(bookId);
      if (onUpdateDocuments) {
        onUpdateDocuments(
          docsRef.current.map((d) =>
            (d.bookId ?? d.id) === bookId
              ? { ...d, processingStatus: "Pending", isPublished: false }
              : d
          )
        );
      }
    } catch (err) {
      setActionError(err?.message || "تعذر إعادة معالجة الكتاب.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredDocs = (documents || []).filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.bookType?.toLowerCase().includes(searchQuery.toLowerCase());

    const st = doc.processingStatus || doc.status;
    const matchesStatus = statusFilter === "الكل" || st === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-base-100 dark:bg-slate-900 border border-base-300 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm font-2 space-y-7 transition-all" dir="rtl">
      {/* Header & Filter Controls (Fully Responsive) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-base-200 dark:border-slate-800">
        <div>
          <h2 className="font-1 font-bold text-xl sm:text-2xl text-base-content flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-cyan-700/10 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-2xl shrink-0 shadow-xs">
              <HiOutlineCircleStack />
            </span>
            <span>سجل كتب المعرفة وحالة المعالجة ({filteredDocs.length})</span>
          </h2>
          <p className="text-sm sm:text-base text-base-content/70 mt-1.5 font-2">
            متابعة استخراج الصفحات، بناء الـ Chunks والمتجهات، ونشر الكتب للبحث والمحادثة الذكية.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* 1. Search Box */}
          <div className="relative flex-1 md:w-60 lg:w-72 min-w-0">
            <FiSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/40 text-base pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الكتب..."
              className="input input-bordered w-full rounded-2xl pr-10 pl-4 text-sm sm:text-base font-2 bg-base-100 dark:bg-slate-800 border-base-300 dark:border-slate-700 h-11"
            />
          </div>

          {/* 2. Select Dropdown on the left */}
          <div className="shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-bordered rounded-2xl text-sm sm:text-base font-2 cursor-pointer w-36 sm:w-40 bg-base-100 dark:bg-slate-800 border-base-300 dark:border-slate-700 h-11"
            >
              <option value="الكل">جميع الحالات</option>
              <option value="Ready">جاهز (Ready)</option>
              <option value="Failed">فشل (Failed)</option>
              <option value="Pending">قيد المعالجة</option>
            </select>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="alert alert-error text-sm sm:text-base rounded-2xl flex items-center gap-2.5 py-4 px-5 font-medium shadow-xs font-2 text-white">
          <HiOutlineExclamationCircle className="text-2xl shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Table Content */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <span className="loading loading-spinner loading-lg text-cyan-700" />
          <p className="text-sm sm:text-base text-base-content/70 font-2">جاري تحميل سجل كتب المعرفة...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-base-200/40 dark:bg-slate-800/40 rounded-3xl border border-dashed border-base-300 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-cyan-700/10 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 mx-auto flex items-center justify-center text-3xl shadow-xs">
            <HiOutlineDocumentText />
          </div>
          <h4 className="font-1 font-bold text-base sm:text-lg text-base-content">لا توجد كتب مضافة بعد</h4>
          <p className="text-sm text-base-content/70 max-w-sm mx-auto font-2">
            قم برفع كتاب PDF من النموذج أعلاه لبدء تفكيكه وفهرسته في قاعدة المعرفة.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-base-300 dark:border-slate-800">
          <table className="table w-full text-right align-middle font-2">
            <thead>
              <tr className="bg-base-200/70 dark:bg-slate-800/80 text-base-content/80 font-bold border-b border-base-300 dark:border-slate-800 text-xs sm:text-sm font-1">
                <th className="py-4 px-4">الكتاب والمعلومات</th>
                <th className="py-4 px-4">التصنيف والمعالجة</th>
                <th className="py-4 px-4">مرحلة المعالجة</th>
                <th className="py-4 px-4">الصفحات / الوحدات</th>
                <th className="py-4 px-4">حالة النشر</th>
                <th className="text-center py-4 px-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200/70 dark:divide-slate-800/70 text-xs sm:text-sm">
              {filteredDocs.map((doc) => {
                const bookId = doc.bookId ?? doc.id;
                const status = doc.processingStatus || doc.status || "Pending";
                const isPublished = !!doc.isPublished;
                const isActivelyProcessing = ACTIVE_PROCESSING_STATUSES.has(status);
                const isReady = status === "Ready";
                const isFailed = status === "Failed";
                const cfg = STATUS_CONFIG[status] || {
                  label: status,
                  badge: "badge-ghost",
                  icon: "⚙️",
                };

                return (
                  <tr
                    key={bookId}
                    className="hover:bg-base-200/40 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Title & Author */}
                    <td className="font-medium max-w-[220px] sm:max-w-[280px] py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-700/10 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-base shrink-0 font-bold shadow-xs">
                          <HiOutlineDocumentText />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-sm sm:text-base text-base-content truncate font-1">
                            {doc.title}
                          </p>
                          <p className="text-xs sm:text-sm text-base-content/70 truncate mt-0.5 font-2">
                            {doc.author ? `المؤلف: ${doc.author}` : `رقم الكتاب: #${bookId}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Book Type & Profile */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className="badge badge-sm sm:badge-md bg-base-200 dark:bg-slate-800 font-medium text-xs rounded-xl">
                          {doc.bookType || "HadithCollection"}
                        </span>
                        <span className="block text-xs text-base-content/60 font-mono">
                          {doc.processingProfile || "Hadith"}
                        </span>
                      </div>
                    </td>

                    {/* Processing Status Badge */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span
                          className={`badge ${cfg.badge} badge-sm sm:badge-md gap-1.5 font-bold text-xs py-2 px-3 rounded-xl`}
                        >
                          {isActivelyProcessing && (
                            <span className="loading loading-spinner loading-xs" />
                          )}
                          <span>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                        </span>

                        {isFailed && doc.processingError && (
                          <p
                            className="text-xs text-error max-w-[160px] truncate font-2 mt-1"
                            title={doc.processingError}
                          >
                            الخطأ: {doc.processingError}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Pages & Chunks Counts */}
                    <td className="font-mono text-xs sm:text-sm py-4 px-4">
                      <div className="space-y-0.5">
                        <p className="text-base-content font-medium">
                          الصفحات: {doc.pageCount ?? "—"}
                        </p>
                        <p className="text-cyan-700 dark:text-cyan-400 font-bold">
                          Chunks: {doc.chunkCount ?? "—"}
                        </p>
                      </div>
                    </td>

                    {/* Publication State Interactive Toggle Button */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {isReady ? (
                        <button
                          type="button"
                          onClick={() =>
                            isPublished
                              ? handleUnpublish(bookId)
                              : handlePublish(bookId)
                          }
                          disabled={
                            actionLoadingId === `publish-${bookId}` ||
                            actionLoadingId === `unpublish-${bookId}`
                          }
                          className={`btn btn-xs sm:btn-sm rounded-xl gap-1.5 font-bold font-2 text-xs transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap ${
                            isPublished
                              ? "btn-success text-white"
                              : "btn-outline border-base-300 dark:border-slate-700 text-base-content/60 hover:text-base-content hover:bg-base-200"
                          }`}
                          title={
                            isPublished
                              ? "انقر لإلغاء النشر وإخفاء الكتاب من البحث"
                              : "انقر لنشر الكتاب في البحث والمحادثة"
                          }
                        >
                          {actionLoadingId === `publish-${bookId}` ||
                          actionLoadingId === `unpublish-${bookId}` ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : isPublished ? (
                            <HiOutlineEye className="text-sm shrink-0" />
                          ) : (
                            <HiOutlineEyeSlash className="text-sm shrink-0" />
                          )}
                          <span>{isPublished ? "منشور" : "غير منشور"}</span>
                        </button>
                      ) : (
                        <span className="badge badge-ghost badge-sm sm:badge-md text-base-content/50 text-xs rounded-xl px-3 py-1 whitespace-nowrap inline-flex items-center gap-1.5">
                          <HiOutlineEyeSlash className="text-xs shrink-0" />
                          <span>غير جاهز للنشر</span>
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="text-center py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1.5 flex-nowrap">
                        {/* 1. Reprocess Option */}
                        {isReady && (
                          <button
                            type="button"
                            onClick={() => handleReprocess(bookId)}
                            disabled={actionLoadingId === `reprocess-${bookId}`}
                            className="btn btn-xs sm:btn-sm btn-ghost text-base-content/70 hover:text-base-content font-medium rounded-xl gap-1 text-xs whitespace-nowrap cursor-pointer"
                            title="إعادة المعالجة وبناء المتجهات"
                          >
                            {actionLoadingId === `reprocess-${bookId}` ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <HiOutlineCpuChip className="text-sm shrink-0" />
                            )}
                            <span>إعادة معالجة</span>
                          </button>
                        )}

                        {/* 2. Retry Button */}
                        {isFailed && (
                          <button
                            type="button"
                            onClick={() => handleRetry(bookId)}
                            disabled={actionLoadingId === `retry-${bookId}`}
                            className="btn btn-xs sm:btn-sm btn-error text-white font-bold rounded-xl gap-1 shadow-xs text-xs whitespace-nowrap cursor-pointer"
                            title="إعادة محاولة المعالجة"
                          >
                            {actionLoadingId === `retry-${bookId}` ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <HiOutlineArrowPath className="text-sm shrink-0" />
                            )}
                            <span>إعادة المحاولة</span>
                          </button>
                        )}

                        {/* Processing Status Indicator */}
                        {isActivelyProcessing && (
                          <span className="text-xs text-base-content/60 font-medium whitespace-nowrap">
                            جاري المعالجة...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
