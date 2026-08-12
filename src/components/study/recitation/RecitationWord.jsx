import React from "react";

/**
 * RecitationWord — renders a single word with CSS-only visibility control.
 *
 * ALWAYS renders the real word. Controls visibility via CSS color + border.
 * border-b-2 is always present (transparent when visible) to guarantee
 * identical layout dimensions in both hidden and visible states.
 */
export default function RecitationWord({
  word,
  isHidden = false,
  isRevealed = false,
  isActive = false,
  state = "Pending",
  isReciting = false,
  isRecited = false,
  recognizedText = null,
}) {
  // Special: ﷺ symbol is always visible
  if (word === "ﷺ") {
    return (
      <span className="text-base-content font-4 mx-0.5 border-b-2 border-transparent">
        {word}{" "}
      </span>
    );
  }

  // Visibility logic:
  // - During recitation: spoken words are always visible (override isHidden)
  // - After recitation: isHidden controls everything (button works normally)
  // - Active word or step-by-step revealed word is always visible
  const isVisible = !isHidden || isRevealed || isActive || (isReciting && isRecited);

  // Base: always include border-b-2 for consistent layout
  let className = "inline-block mx-0.5 border-b-2 transition-colors duration-300";

  if (isActive) {
    // Active word: royal blue, bold, scaled up
    className = "inline-block mx-0.5 border-b-2 border-transparent text-sky-500 dark:text-sky-400 font-extrabold scale-110 transition-all duration-150 drop-shadow-md";
  } else if (isVisible) {
    // Visible word: border transparent + state coloring
    className += " border-transparent";
    if (state === "Incorrect") {
      className += " text-red-600 dark:text-red-400 font-semibold";
    } else if (state === "Uncertain") {
      className += " text-amber-500 dark:text-amber-400 font-semibold";
    } else {
      className += " text-base-content font-normal";
    }
  } else {
    // Hidden word: transparent text + visible border (the "dash")
    className += " border-base-content/40 text-transparent select-none";
  }

  return (
    <span
      className={className}
      title={recognizedText ? `المقروء: ${recognizedText}` : undefined}
    >
      {word}{" "}
    </span>
  );
}
