import React, { useRef, useEffect } from "react";

// Track last scrolled line's offsetTop globally across words to guarantee 1 smooth scroll per line
let lastScrolledLineOffsetTop = -1;

/**
 * RecitationWord — renders a single word with CSS-only visibility control.
 *
 * ALWAYS renders the real word. Controls visibility via CSS color + border.
 * border-b-2 is always present (transparent when visible) to guarantee
 * identical layout dimensions in both hidden and visible states.
 * Includes line-throttled GPU-accelerated smooth auto-scrolling when active word moves past bounds.
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
  const elementRef = useRef(null);

  // Line-throttled GPU-accelerated smooth scrolling
  useEffect(() => {
    if (isActive && elementRef.current) {
      const el = elementRef.current;
      const currentOffsetTop = el.offsetTop;

      // Only check scroll if active word is on a NEW line (offsetTop differs by > 12px)
      if (Math.abs(currentOffsetTop - lastScrolledLineOffsetTop) > 12) {
        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        // Safe bounds accounting for top Navbar (~90px) and bottom floating player/toolbar (~150px)
        const topMargin = 100;
        const bottomMargin = viewportHeight - 150;

        if (rect.bottom > bottomMargin || rect.top < topMargin) {
          lastScrolledLineOffsetTop = currentOffsetTop;
          el.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      }
    }
  }, [isActive]);

  // Special: ﷺ symbol is always visible
  if (word === "ﷺ") {
    return (
      <span
        ref={isActive ? elementRef : null}
        className="text-base-content font-4 mx-0.5 border-b-2 border-transparent"
      >
        {word}{" "}
      </span>
    );
  }

  // Visibility logic:
  // - Evaluated words (Correct / Incorrect) or active / revealed words stay visible
  const isEvaluated = state !== "Pending";
  const isVisible = !isHidden || isRevealed || isActive || (isReciting && isRecited) || isEvaluated;

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
      ref={elementRef}
      className={className}
      title={recognizedText ? `المقروء: ${recognizedText}` : undefined}
    >
      {word}{" "}
    </span>
  );
}
