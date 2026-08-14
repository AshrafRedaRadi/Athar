import { useEffect, useMemo, useRef } from "react";
import RecitationWord from "./recitation/RecitationWord";

export default function HadithCard({
  bookTitle,
  hadithLabel,
  title,
  text = "",
  source,
  spokenWords = [],
  canonicalWords = [],
  activeWordIndex = -1,
  furthestActiveWordIndex = -1,
  startDetection = null,
  isHidden: externalIsHidden,
  mode = "reading",
}) {
  const isHidden = externalIsHidden !== undefined ? externalIsHidden : true;
  const isReciting = mode === "reciting";
  const textContainerRef = useRef(null);
  const lastScrolledLineRef = useRef(null);

  const displayTokens = useMemo(() => {
    const originalTokens = text.trim() ? text.trim().split(/\s+/) : [];
    const serverWords = canonicalWords
      .filter(Boolean)
      .slice()
      .sort((left, right) => left.index - right.index);

    if (serverWords.length === 0) {
      return originalTokens.map((word, displayIndex) => ({
        word,
        displayIndex,
        evaluationIndex: displayIndex,
      }));
    }

    let serverCursor = 0;
    return originalTokens.map((word, displayIndex) => {
      const serverWord = serverWords[serverCursor];
      if (serverWord && serverWord.word === word) {
        serverCursor += 1;
        return { word, displayIndex, evaluationIndex: serverWord.index };
      }

      // Decorative tokens such as a standalone ﷺ keep their display position but
      // never shift the canonical evaluator indexes.
      return { word, displayIndex, evaluationIndex: null };
    });
  }, [canonicalWords, text]);

  const detectionStatus = startDetection?.status || startDetection?.Status || "Searching";
  const detectedStartIndex = startDetection?.startWordIndex
    ?? startDetection?.StartWordIndex
    ?? null;

  // One centralized scroll check per active-index change. Individual words never
  // measure layout or start competing smooth-scroll animations.
  useEffect(() => {
    if (!isReciting || activeWordIndex < 0 || !textContainerRef.current) return;
    const element = textContainerRef.current.querySelector(
      `[data-recitation-word-index="${activeWordIndex}"]`
    );
    if (!element) return;

    const line = element.offsetTop;
    if (lastScrolledLineRef.current === line) return;
    lastScrolledLineRef.current = line;

    const rect = element.getBoundingClientRect();
    const topSafeBoundary = 100;
    const bottomSafeBoundary = window.innerHeight - 150;
    if (rect.top < topSafeBoundary || rect.bottom > bottomSafeBoundary) {
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  }, [activeWordIndex, isReciting]);

  const renderedWords = displayTokens.map(({ word, displayIndex, evaluationIndex }) => {
    const spoken = evaluationIndex === null ? undefined : spokenWords[evaluationIndex];
    const state = spoken?.state || "Pending";
    const isActive = isReciting && evaluationIndex === activeWordIndex;
    const isBeforeDetectedStart = detectionStatus === "Detected"
      && Number.isInteger(detectedStartIndex)
      && evaluationIndex !== null
      && evaluationIndex < detectedStartIndex;
    const evaluationStart = Number.isInteger(detectedStartIndex) ? detectedStartIndex : 0;
    const isCrossedPending = state === "Pending"
      && evaluationIndex !== null
      && evaluationIndex >= evaluationStart
      && evaluationIndex < furthestActiveWordIndex;

    return (
      <RecitationWord
        key={displayIndex}
        word={word}
        evaluationIndex={evaluationIndex}
        isHidden={isHidden}
        isBeforeDetectedStart={isBeforeDetectedStart}
        isCrossedPending={isCrossedPending}
        isActive={isActive}
        state={state}
        recognizedText={spoken?.recognizedText}
        reasonCode={spoken?.reasonCode}
      />
    );
  });

  return (
    <div className="card bg-[#faf7f0] dark:bg-[#1a232a] shadow-lg shadow-amber-900/5 dark:shadow-black/40 border border-[#e8e2d2] dark:border-[#2d3a45] border-t-4 border-t-[#286a89] dark:border-t-[#38bdf8] rounded-2xl sm:rounded-3xl flex-1 transition-all duration-300" dir="rtl">
      <div className="card-body p-6 sm:p-8">
        <div className="flex items-center justify-between mb-3">
          <span className="font-2 text-sm font-bold text-[#286a89] dark:text-[#38bdf8] tracking-wide">{bookTitle}</span>
          <span className="badge bg-[#286a89] dark:bg-[#0284c7] text-white font-2 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs border-0">
            {hadithLabel}
          </span>
        </div>

        {title && (
          <h2 className="font-1 font-bold text-xl sm:text-2xl text-center text-black dark:text-white my-3 leading-relaxed">
            "{title}"
          </h2>
        )}

        <div ref={textContainerRef} className="min-h-[200px] flex items-center justify-center">
          <p className="font-4 font-normal text-xl sm:text-3xl leading-[2.6] text-center text-black dark:text-white whitespace-pre-wrap">
            {renderedWords}
          </p>
        </div>

        {source && (
          <p className="font-2 text-xs sm:text-sm text-[#718096] dark:text-[#94a3b8] text-center mt-6 font-medium">
            [{source}]
          </p>
        )}
      </div>
    </div>
  );
}
