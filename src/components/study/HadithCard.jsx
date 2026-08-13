import React from "react";
import RecitationWord from "./recitation/RecitationWord";

/**
 * HadithCard — displays the hadith text with hide/reveal toggle
 * and speech recognition recitation coloring support.
 *
 * Uses RecitationWord for each word, which renders the same content
 * in both hidden and visible states (CSS-only visibility control)
 * to eliminate all layout jumps and flashes.
 */
export default function HadithCard({
  bookTitle,
  hadithLabel,
  title,
  text = "",
  source,
  spokenWords = [],
  activeWordIndex = -1,
  recitationStopped = false,
  completedSummary = null,
  isHidden: externalIsHidden,
  revealedCount = 0,
  mode = "reading",
}) {
  const isHidden = externalIsHidden !== undefined ? externalIsHidden : true;
  const isReciting = mode === "reciting";

  const renderText = () => {
    const words = text.trim().split(/\s+/);

    return words.map((word, i) => {
      const spoken = spokenWords[i];
      const state = spoken?.state || "Pending";

      const isRecited = spoken != null && state !== "Pending";
      const isActive = isReciting && (i === activeWordIndex || spoken?.isCurrentActive === true);
      const isRevealed = i < revealedCount;

      return (
        <RecitationWord
          key={i}
          word={word}
          isHidden={isHidden}
          isRevealed={isRevealed}
          isActive={isActive}
          state={state}
          isReciting={isReciting}
          isRecited={isRecited}
          recognizedText={spoken?.recognizedText}
        />
      );
    });
  };

  return (
    <div className="card bg-[#faf7f0] dark:bg-[#1a232a] shadow-lg shadow-amber-900/5 dark:shadow-black/40 border border-[#e8e2d2] dark:border-[#2d3a45] border-t-4 border-t-[#286a89] dark:border-t-[#38bdf8] rounded-2xl sm:rounded-3xl flex-1 transition-all duration-300" dir="rtl">
      <div className="card-body p-6 sm:p-8">

        {/* ── Card header: book name + hadith badge ── */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-2 text-sm font-bold text-[#286a89] dark:text-[#38bdf8] tracking-wide">{bookTitle}</span>
          <span className="badge bg-[#286a89] dark:bg-[#0284c7] text-white font-2 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs border-0">
            {hadithLabel}
          </span>
        </div>

        {/* ── Hadith title ── */}
        {title && (
          <h2 className="font-1 font-bold text-xl sm:text-2xl text-center text-[#2d3748] dark:text-[#f1f5f9] my-3 leading-relaxed">
            "{title}"
          </h2>
        )}

        {/* ── Hadith text ── */}
        <div className="min-h-[200px] flex items-center justify-center">
          <p className="font-4 font-normal text-xl sm:text-3xl leading-[2.6] text-center text-[#1a202c] dark:text-[#f8fafc] whitespace-pre-wrap">
            {renderText()}
          </p>
        </div>

        {/* ── Source ── */}
        {source && (
          <p className="font-2 text-xs sm:text-sm text-[#718096] dark:text-[#94a3b8] text-center mt-6 font-medium">
            [{source}]
          </p>
        )}
      </div>
    </div>
  );
}
