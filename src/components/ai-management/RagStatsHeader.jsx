import React from "react";
import {
  HiOutlineDocumentText,
  HiOutlineCircleStack,
  HiOutlineGlobeAlt,
  HiOutlineCpuChip,
} from "react-icons/hi2";

export default function RagStatsHeader({
  totalDocuments = 0,
  totalChunks = 0,
  publishedCount = 0,
  readyCount = 0,
}) {
  return (
    <div dir="rtl" className="mt-1 sm:mt-3">
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3 md:gap-4">
        {/* 1. Total Knowledge Books */}
        <div className="bg-base-100 dark:bg-base-100 border border-base-300/60 rounded-xl sm:rounded-2xl shadow-xs p-2 sm:p-3.5 md:p-4 flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-right gap-1 sm:gap-2.5 md:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-full bg-cyan-100 dark:bg-cyan-950/40 flex items-center justify-center shrink-0">
            <HiOutlineDocumentText className="text-cyan-700 dark:text-cyan-400 text-xs sm:text-base md:text-xl" />
          </div>

          <div className="min-w-0 flex-1 truncate">
            <p className="text-[9px] sm:text-xs md:text-sm text-base-content/80 font-2 leading-tight truncate">
              كتب المعرفة
            </p>
            <h2 className="text-xs sm:text-lg md:text-xl lg:text-2xl font-bold font-1 truncate">
              {totalDocuments}{" "}
              <span className="text-[8px] sm:text-xs font-normal">متن</span>
            </h2>
          </div>
        </div>

        {/* 2. Published Books */}
        <div className="bg-base-100 dark:bg-base-100 border border-base-300/60 rounded-xl sm:rounded-2xl shadow-xs p-2 sm:p-3.5 md:p-4 flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-right gap-1 sm:gap-2.5 md:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center shrink-0">
            <HiOutlineGlobeAlt className="text-green-700 dark:text-green-400 text-xs sm:text-base md:text-xl" />
          </div>

          <div className="min-w-0 flex-1 truncate">
            <p className="text-[9px] sm:text-xs md:text-sm text-base-content/80 font-2 leading-tight truncate">
              المنشورة بالـ Chat
            </p>
            <h2 className="text-xs sm:text-lg md:text-xl lg:text-2xl font-bold font-1 truncate">
              {publishedCount}{" "}
              <span className="text-[8px] sm:text-xs font-normal">منشور</span>
            </h2>
          </div>
        </div>

        {/* 3. Total Vector Chunks */}
        <div className="bg-base-100 dark:bg-base-100 border border-base-300/60 rounded-xl sm:rounded-2xl shadow-xs p-2 sm:p-3.5 md:p-4 flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-right gap-1 sm:gap-2.5 md:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-full bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center shrink-0">
            <HiOutlineCircleStack className="text-purple-700 dark:text-purple-400 text-xs sm:text-base md:text-xl" />
          </div>

          <div className="min-w-0 flex-1 truncate">
            <p className="text-[9px] sm:text-xs md:text-sm text-base-content/80 font-2 leading-tight truncate">
              وحدات المعرفة
            </p>
            <h2 className="text-xs sm:text-lg md:text-xl lg:text-2xl font-bold font-1 font-mono truncate">
              {totalChunks > 0
                ? totalChunks.toLocaleString("en-US")
                : readyCount > 0
                ? readyCount
                : 0}{" "}
              <span className="text-[8px] sm:text-xs font-normal font-2">
                Chunk
              </span>
            </h2>
          </div>
        </div>

        {/* 4. RAG Ingestion Pipeline Status */}
        <div className="bg-base-100 dark:bg-base-100 border border-base-300/60 rounded-xl sm:rounded-2xl shadow-xs p-2 sm:p-3.5 md:p-4 flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-right gap-1 sm:gap-2.5 md:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center shrink-0">
            <HiOutlineCpuChip className="text-orange-500 text-xs sm:text-base md:text-xl" />
          </div>

          <div className="min-w-0 flex-1 truncate">
            <p className="text-[9px] sm:text-xs md:text-sm text-base-content/80 font-2 leading-tight truncate">
              محرك البحث
            </p>
            <div className="flex items-center justify-center md:justify-start gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[9px] sm:text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400 font-2 truncate">
                متصل
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
