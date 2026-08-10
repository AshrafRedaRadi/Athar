import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { HiOutlineTrash, HiOutlineRefresh, HiOutlineDocumentText, HiOutlineDatabase } from "react-icons/hi";

/**
 * RagDocumentsList - Interactive Table displaying uploaded PDF documents & RAG Vector status.
 */
export default function RagDocumentsList({ documents = [], onDeleteDocument, isLoading }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [deletingId, setDeletingId] = useState(null);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "الكل" || doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteConfirm = async (id) => {
    setDeletingId(id);
    try {
      await onDeleteDocument(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-xs font-2 space-y-6" dir="rtl">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
        <div>
          <h2 className="font-1 font-bold text-lg text-base-content flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-base">
              <HiOutlineDatabase />
            </span>
            <span>سجل المتون والكتب المفهرسة ({filteredDocs.length})</span>
          </h2>
          <p className="text-xs text-base-content/60 mt-1">
            إدارة الكتب والمستندات المخزنة في قاعدة المتجهات الذكية الخاصة بالمنصة.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 text-sm pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الكتب والملفات..."
              className="input input-bordered input-sm rounded-xl pr-9 text-xs font-2 w-44 sm:w-56"
            />
          </div>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-bordered select-sm rounded-xl text-xs font-2 cursor-pointer"
          >
            <option value="الكل">كل الحالات</option>
            <option value="مفهرس بنجاح">مفهرس بنجاح</option>
            <option value="جاري الفهرسة">جاري الفهرسة</option>
            <option value="فشل الفهرسة">فشل الفهرسة</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <span className="loading loading-spinner loading-md text-cyan-700" />
          <p className="text-xs text-base-content/60">جاري تحميل سجل الكتب والمستندات المفهرسة...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="py-12 text-center space-y-3 bg-base-200/30 rounded-2xl border border-dashed border-base-300">
          <div className="w-12 h-12 rounded-2xl bg-cyan-700/10 text-cyan-700 mx-auto flex items-center justify-center text-2xl">
            <HiOutlineDocumentText />
          </div>
          <h4 className="font-1 font-bold text-sm text-base-content">لا توجد كتب مفهرسة حتى الآن</h4>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            قم برفع أول كتاب بصيغة PDF من خلال النموذج أعلاه لبدء تغذية محرك المعرفة RAG.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full text-right align-middle text-xs">
            <thead>
              <tr className="bg-base-200/50 text-base-content/70 font-semibold border-b border-base-200">
                <th className="rounded-r-xl">الكتاب والمستند</th>
                <th>التصنيف</th>
                <th>الأجزاء المتجهة</th>
                <th>الحجم</th>
                <th>تاريخ الرفع</th>
                <th>حالة الفهرسة</th>
                <th className="rounded-l-xl text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => {
                const isProcessing = doc.status === "جاري الفهرسة";
                const isFailed = doc.status === "فشل الفهرسة";

                return (
                  <tr key={doc.id} className="hover:bg-base-200/40 transition-colors border-b border-base-200">
                    {/* Title & File Name */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-lg shrink-0">
                          <HiOutlineDocumentText />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-base-content font-1">{doc.title}</span>
                          <span className="text-[11px] text-base-content/50 truncate max-w-xs">{doc.fileName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="badge badge-ghost font-medium text-xs px-2.5 py-1 rounded-lg">
                        {doc.category || "عام"}
                      </span>
                    </td>

                    {/* Chunks Count */}
                    <td>
                      <span className="font-bold text-cyan-800 dark:text-cyan-400">
                        {(doc.chunkCount || 0).toLocaleString("ar-EG")} شريحة
                      </span>
                    </td>

                    {/* File Size */}
                    <td className="text-base-content/70 font-mono text-[11px]">
                      {doc.fileSize}
                    </td>

                    {/* Date */}
                    <td className="text-base-content/70">
                      {doc.uploadedAt}
                    </td>

                    {/* Status Badge */}
                    <td>
                      {isProcessing ? (
                        <span className="badge badge-warning gap-1 font-bold text-xs px-2.5 py-1 text-amber-950">
                          <span className="loading loading-spinner loading-xs" />
                          <span>جاري الفهرسة</span>
                        </span>
                      ) : isFailed ? (
                        <span className="badge badge-error text-white font-bold text-xs px-2.5 py-1">
                          فشل الفهرسة
                        </span>
                      ) : (
                        <span className="badge bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold text-xs px-2.5 py-1">
                          مفهرس بنجاح
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteConfirm(doc.id)}
                          disabled={deletingId === doc.id}
                          className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                          title="حذف الكتاب من قاعدة المعرفة"
                        >
                          {deletingId === doc.id ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            <HiOutlineTrash className="text-base" />
                          )}
                        </button>
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
