import React from "react";

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────

/** Turquoise badge class for quoted hadith/Quran text */
const QUOTE_BADGE_CLASS =
  "inline-flex items-center px-3 py-1 rounded-xl bg-cyan-700/15 dark:bg-cyan-950/95 text-cyan-950 dark:text-cyan-100 font-bold font-3 text-[14px] sm:text-base border border-cyan-700/30 dark:border-cyan-400/60 shadow-sm mx-0.5 my-1 align-baseline leading-relaxed";

/** Subtle citation badge class for verse references */
const CITATION_BADGE_CLASS =
  "inline-flex items-center px-2 py-0.5 rounded-md bg-base-200 text-cyan-800 dark:text-cyan-200 font-semibold font-2 text-[12px] sm:text-sm border border-base-300 mx-1 align-baseline";

/** Regex matching Arabic diacritical marks (tashkeel) */
const TASHKEEL_RE = /[\u064B-\u065F\u0670\u0610-\u061A]/g;

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

/**
 * Strip common leading labels like "الشرح" / "الشرح:" from explanation text.
 */
function stripLeadingLabel(text) {
  if (!text) return text;
  return text.replace(/^\s*(?:#+\s*)?الشرح\s*[:：]?\s*\n?/u, "").trim();
}

/**
 * Normalize explicit quote patterns into «...» guillemets.
 * Converts ﴿...﴾ Quranic brackets and "..." double quotes.
 * Preserves normal scholar commentary in (...) parentheses without converting to guillemets.
 */
function normalizeQuotes(text) {
  if (!text) return text;
  let result = text;

  // Convert Quranic brackets ﴿...﴾ → «...»
  result = result.replace(/﴿([^﴾]+)﴾/g, (_, inner) => `«${inner.trim()}»`);

  // Convert double quotes "..." / “...” / „...“ → «...»
  result = result.replace(/[""„“]([^""„“]+)[""„“]/g, (match, inner) => {
    if (/[\u0621-\u064A]/.test(inner)) return `«${inner.trim()}»`;
    return match;
  });

  return result;
}

// ─────────────────────────────────────────────
//  Inline Formatter
// ─────────────────────────────────────────────

/**
 * Parse inline formatting: **bold** and «guillemets».
 * Preserves plain text strings intact with exact spaces.
 */
function formatInline(str, keyRef) {
  if (!str) return str;

  const result = [];
  let i = 0;
  let buffer = "";

  const flushBuffer = () => {
    if (buffer) {
      result.push(buffer);
      buffer = "";
    }
  };

  while (i < str.length) {
    // Bold **...**
    if (str[i] === "*" && str[i + 1] === "*") {
      const endBold = str.indexOf("**", i + 2);
      if (endBold !== -1) {
        flushBuffer();
        const boldContent = str.slice(i + 2, endBold);
        const tashkeelCount = (boldContent.match(TASHKEEL_RE) || []).length;

        // If bold content has 3+ diacritics (hadith quote inside **...**)
        if (tashkeelCount >= 3) {
          result.push(
            <span key={`b${keyRef.k++}`} className={QUOTE_BADGE_CLASS}>
              «{boldContent}»
            </span>
          );
        } else {
          result.push(
            <strong
              key={`b${keyRef.k++}`}
              className="font-bold text-cyan-900 dark:text-cyan-200 font-3 text-[13px] sm:text-base inline"
            >
              {boldContent}
            </strong>
          );
        }
        i = endBold + 2;
        continue;
      }
    }

    // Explicit Guillemets «...»
    if (str[i] === "«") {
      const endQuote = str.indexOf("»", i + 1);
      if (endQuote !== -1) {
        flushBuffer();
        const rawQuote = str
          .slice(i + 1, endQuote)
          .trim()
          .replace(/\*\*/g, "");
        result.push(
          <span key={`q${keyRef.k++}`} className={QUOTE_BADGE_CLASS}>
            «{rawQuote}»
          </span>
        );
        i = endQuote + 1;
        continue;
      }
    }

    buffer += str[i];
    i++;
  }

  flushBuffer();
  return result.length === 1 && typeof result[0] === "string"
    ? result[0]
    : result;
}

// ─────────────────────────────────────────────
//  Main Renderer
// ─────────────────────────────────────────────

export default function renderMarkdownText(rawText) {
  if (!rawText) return null;

  const text = stripLeadingLabel(rawText);
  if (!text) return null;

  const normalized = normalizeQuotes(text);
  const lines = normalized.split("\n");

  const keyRef = { k: 0 };

  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // Blockquote (> ...)
    if (trimmed.startsWith(">")) {
      const clean = trimmed
        .replace(/^>\s*/, "")
        .replace(/^«/, "")
        .replace(/»$/, "")
        .replace(/\*\*/g, "")
        .trim();
      return (
        <p
          key={idx}
          className="font-2 text-sm sm:text-base leading-relaxed text-base-content/90 my-2"
        >
          <span className={QUOTE_BADGE_CLASS}>«{clean}»</span>
        </p>
      );
    }

    // Heading (# ...)
    if (trimmed.startsWith("#")) {
      const headingText = trimmed.replace(/^#+\s*/, "");
      if (/^الشرح\s*[:：]?\s*$/.test(headingText)) return null;
      return (
        <h4
          key={idx}
          className="font-3 font-bold text-base sm:text-lg text-cyan-800 dark:text-cyan-300 mt-5 mb-2"
        >
          {headingText}
        </h4>
      );
    }

    // Full-line bold (**...**)
    if (
      trimmed.startsWith("**") &&
      trimmed.endsWith("**") &&
      !trimmed.slice(2, -2).includes("**")
    ) {
      const boldContent = trimmed.slice(2, -2);
      if (/^الشرح\s*[:：]?\s*$/.test(boldContent)) return null;
      return (
        <h4
          key={idx}
          className="font-3 font-bold text-base sm:text-lg text-cyan-800 dark:text-cyan-300 mt-5 mb-2 border-r-2 border-cyan-700 pr-2"
        >
          {boldContent}
        </h4>
      );
    }

    // List item (* ..., - ..., • ...)
    if (
      trimmed.startsWith("* ") ||
      trimmed.startsWith("- ") ||
      trimmed.startsWith("• ")
    ) {
      return (
        <li
          key={idx}
          className="font-2 text-sm sm:text-base leading-relaxed text-base-content/90 ms-4 list-disc mb-1.5"
        >
          {formatInline(trimmed.replace(/^[*\-•]\s*/, ""), keyRef)}
        </li>
      );
    }

    // Plain paragraph
    return (
      <p
        key={idx}
        className="font-2 text-sm sm:text-base leading-relaxed text-base-content/90 mb-2.5"
      >
        {formatInline(trimmed, keyRef)}
      </p>
    );
  });
}

export { QUOTE_BADGE_CLASS, CITATION_BADGE_CLASS };
