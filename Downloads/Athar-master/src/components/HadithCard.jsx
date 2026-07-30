import { useState } from "react";

/**
 * HadithCard — displays the hadith text with hide/reveal toggle
 * and speech recognition recitation coloring support.
 *
 * Props:
 *  - bookTitle    {string}  e.g. "الأربعون النووية"
 *  - hadithLabel  {string}  e.g. "الحديث الأول"
 *  - title        {string}  e.g. "إنما الأعمال بالنيات"
 *  - text         {string}  Full hadith text with tashkeel
 *  - source       {string}  e.g. "رواه البخاري ومسلم"
 *  - mode         {string}  "reading" | "reciting" — controls text coloring behavior
 *  - spokenWords  {Array}   Array of { word: string, correct: boolean } for recitation feedback
 *  - recitationStopped {boolean} Whether recitation stopped due to full-sentence error
 *  - isHidden     {boolean} Optional controlled hide state
 *  - onToggleHide {function} Optional controlled hide toggle callback
 */
export default function HadithCard({ 
  bookTitle,
  hadithLabel, 
  title, 
  text = "", 
  source, 
  mode = "reading",
  spokenWords = [],
  recitationStopped = false,
  isHidden: externalIsHidden,
  onToggleHide: externalOnToggleHide
}) {
  const [internalIsHidden, setInternalIsHidden] = useState(true);

  const isHidden = externalIsHidden !== undefined ? externalIsHidden : internalIsHidden;

  /**
   * Helper to render a pixel-perfect blank underline.
   * Renders the actual word in text-transparent with border-b-2, guaranteeing that
   * the underline width is 100% identical to the revealed word width.
   */
  const renderBlank = (word, key, extraClass = "") => {
    if (word === "ﷺ") {
      return <span key={key} className="text-base-content font-4 mx-0.5">{word} </span>;
    }
    return (
      <span
        key={key}
        className={`inline-block border-b-2 border-base-content/50 text-transparent select-none pb-0.5 mx-0.5 ${extraClass}`}
      >
        {word}{" "}
      </span>
    );
  };

  /**
   * Renders hadith text.
   * Supports:
   * 1. 100% pixel-perfect word-width matching for hidden blanks.
   * 2. Recitation feedback: as words are spoken, blanks dynamically reveal as green (correct) or red (incorrect).
   */
  const renderText = () => {
    const words = text.trim().split(/\s+/);
    const totalSpoken = spokenWords.length;

    return words.map((word, i) => {
      const isSpoken = i < totalSpoken;

      if (isSpoken) {
        // Word has been spoken during recitation — reveal in Green (correct) or Red (incorrect)
        const spoken = spokenWords[i];
        const isCorrect = spoken?.correct;
        const colorClass = isCorrect ? "text-hadith font-semibold" : "text-hadith-error font-semibold";
        return (
          <span key={i} className={`${colorClass} inline-block mx-0.5`}>
            {word}{" "}
          </span>
        );
      }

      if (recitationStopped) {
        // Recitation stopped on error — show remaining words/blanks dimmed
        return isHidden ? (
          renderBlank(word, i, "opacity-40")
        ) : (
          <span key={i} className="opacity-40 inline-block mx-0.5">
            {word}{" "}
          </span>
        );
      }

      // Word has NOT been spoken yet
      if (isHidden) {
        // Hidden mode: show pixel-perfect underline matching exact word width
        return renderBlank(word, i);
      }

      // Normal visible reading mode
      return (
        <span key={i} className="inline-block mx-0.5">
          {word}{" "}
        </span>
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
          <h2 className="font-3 font-bold text-xl sm:text-2xl text-center mb-4">
            "{title}"
          </h2>
        )}

        {/* ── Hadith text ── */}
        <div className="min-h-[200px] flex items-center justify-center">
          <p className="font-4 text-2xl sm:text-3xl leading-[2.5] text-center text-base-content whitespace-pre-wrap">
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
