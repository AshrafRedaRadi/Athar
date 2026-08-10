import React from "react";
import { HiOutlineSparkles, HiOutlineDocumentText, HiOutlineDatabase, HiOutlineChip } from "react-icons/hi";

/**
 * RagStatsHeader - High-level metrics header cards for RAG AI Assistant engine.
 */
export default function RagStatsHeader({ totalDocuments = 0, totalChunks = 0, systemPromptLength = 0 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-2" dir="rtl">
      {/* 1. Vector Chunks Count */}
      <div className="bg-base-100 border border-base-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs text-base-content/60 font-semibold block mb-1">
            الأجزاء المتجهة (Vector Chunks)
          </span>
          <h3 className="font-1 text-2xl font-bold text-cyan-700 dark:text-cyan-400">
            {totalChunks.toLocaleString("ar-EG")} <span className="text-xs font-normal text-base-content/50">شريحة</span>
          </h3>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-2xl shrink-0">
          <HiOutlineDatabase />
        </div>
      </div>

      {/* 2. Indexed Knowledge Documents */}
      <div className="bg-base-100 border border-base-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs text-base-content/60 font-semibold block mb-1">
            كتب ومستندات PDF المفهرسة
          </span>
          <h3 className="font-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalDocuments} <span className="text-xs font-normal text-base-content/50">كتب متون</span>
          </h3>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0">
          <HiOutlineDocumentText />
        </div>
      </div>

      {/* 3. Embedding Model Engine */}
      <div className="bg-base-100 border border-base-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs text-base-content/60 font-semibold block mb-1">
            محرك التضمين (Embedding Model)
          </span>
          <h3 className="font-1 text-lg font-bold text-base-content truncate">
            text-embedding-3
          </h3>
          <span className="text-[11px] text-cyan-700 dark:text-cyan-400 font-semibold">1536 أبعاد متجهة</span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl shrink-0">
          <HiOutlineChip />
        </div>
      </div>

      {/* 4. RAG System Prompt Engine Status */}
      <div className="bg-base-100 border border-base-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs text-base-content/60 font-semibold block mb-1">
            حالة البرومبت المخصص
          </span>
          <div className="flex items-center gap-2">
            <span className="badge badge-success badge-sm font-bold text-white">نشط ويعمل</span>
            <span className="text-xs text-base-content/50">{systemPromptLength} حرف</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
          <HiOutlineSparkles />
        </div>
      </div>
    </div>
  );
}
