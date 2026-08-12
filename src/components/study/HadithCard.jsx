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
    <div className="card bg-linear-to-b from-olive-500 to-base-200 shadow-md border border-base-300 flex-1" dir="rtl">
      <div className="card-body p-6 sm:p-8">

        {/* ── Card header: book name + hadith badge ── */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-2 text-sm font-semibold text-base-content">{bookTitle}</span>
          <span className="badge bg-2 text-white font-2 text-xs px-3 py-1">
            {hadithLabel}
          </span>
        </div>

        {/* ── Hadith title ── */}
        {title && (
          <h2 className="font-1 font-bold text-xl sm:text-2xl text-center mb-4">
            "{title}"
          </h2>
        )}

        {/* ── Hadith text ── */}
        <div className="min-h-[200px] flex items-center justify-center">
          <p className="font-4 font-normal text-xl sm:text-3xl leading-[2.5] text-center text-base-content whitespace-pre-wrap">
            {renderText()}
          </p>
        </div>

        {/* ── Source ── */}
        {source && (
          <p className="font-2 text-sm text-base-content/50 text-center mt-6">
            [{source}]
          </p>
        )}
      </div>
    </div>
  );
}
