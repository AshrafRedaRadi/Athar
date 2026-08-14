import React from "react";

function RecitationWord({
  word,
  evaluationIndex = null,
  isHidden = false,
  isBeforeDetectedStart = false,
  isCrossedPending = false,
  isActive = false,
  state = "Pending",
  recognizedText = null,
  reasonCode = null,
}) {
  // Decorative blessing symbols are not evaluator tokens and always remain visible.
  if (word === "ﷺ") {
    return (
      <span className="text-base-content font-4 mx-0.5 border-b-2 border-transparent">
        {word}{" "}
      </span>
    );
  }

  const isIncorrect = state === "Incorrect";
  const isHinted = isIncorrect && reasonCode === "HintUsed";
  const isEvaluated = state !== "Pending";
  const isVisible = !isHidden
    || isBeforeDetectedStart
    || isCrossedPending
    || isActive
    || isEvaluated;

  let className = "inline-block mx-0.5 border-b-2 transition-colors duration-100";
  if (isActive) {
    // Active focus is transient. A hinted word becomes blue while spoken, then
    // returns to its permanent red Incorrect state when focus moves forward.
    className += " border-transparent text-sky-500 dark:text-sky-400 font-normal";
  } else if (isHinted) {
    className += " border-transparent text-black dark:text-white font-normal underline decoration-2 underline-offset-32 decoration-red-500 dark:decoration-red-400";
  } else if (isIncorrect) {
    className += " border-transparent text-red-600 dark:text-red-400 font-semibold";
  } else if (isVisible) {
    className += " border-transparent text-black dark:text-white font-normal";
  } else {
    className += " border-black/40 dark:border-white/40 text-transparent select-none";
  }

  return (
    <span
      className={className}
      data-recitation-word-index={evaluationIndex ?? undefined}
      title={recognizedText ? `المقروء: ${recognizedText}` : undefined}
    >
      {word}{" "}
    </span>
  );
}

export default React.memo(RecitationWord);
