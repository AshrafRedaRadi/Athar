import React from "react";

// ─────────────────────────────────────────────
//  Constants & Style Tokens
// ─────────────────────────────────────────────

/** Turquoise badge class for quoted Hadith / Quran text */
const QUOTE_BADGE_CLASS =
  "inline-flex items-center px-2 py-0.5 rounded-lg bg-cyan-700/15 dark:bg-cyan-950/90 text-cyan-950 dark:text-cyan-100 font-bold font-3 text-[0.96em] border border-cyan-700/30 dark:border-cyan-400/60 shadow-2xs mx-1 my-0.5 align-baseline leading-relaxed";

/** Subtle citation badge class for verse references like (البقرة: من الآية ٢٧٢) */
const CITATION_BADGE_CLASS =
  "inline-flex items-center px-1.5 py-0.5 rounded-md bg-base-200/90 dark:bg-base-300/80 text-cyan-800 dark:text-cyan-300 font-semibold font-2 text-[0.85em] border border-base-300 mx-1 align-baseline";

/** Section key label highlight class (e.g. مسألة: / الجواب: / أولاً:) */
const KEY_LABEL_CLASS =
  "font-bold font-3 text-cyan-800 dark:text-cyan-300 text-[1.02em]";

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

/**
 * Strip leading labels like "## الشرح" / "الشرح:" / "# الشرح"
 */
function stripLeadingLabel(text) {
  if (!text) return text;
  return text.replace(/^\s*(?:#+\s*)?الشرح\s*[:：]?\s*\n?/u, "").trim();
}

/**
 * Pre-process text to normalize structural patterns and remove formatting artifacts:
 * 1. Surah citations: (البقرة: من الآية ٢٧٢) → ⦅البقرة: من الآية ٢٧٢⦆
 * 2. Explicit quotes: ﴿...﴾ → «...»
 * 3. Matn quotes after "قوله: (متن)" or "وقوله: **متن**" → قوله: «متن»
 * 4. Remove dangling parentheses around quotes: («...») → «...»
 */
function normalizeStructure(rawText) {
  if (!rawText) return "";
  let text = stripLeadingLabel(rawText);

  // 1. Normalize Quranic brackets ﴿...﴾ → «...»
  text = text.replace(/﴿([^﴾]+)﴾/g, (_, inner) => `«${inner.trim()}»`);

  // 2. Normalize double quotes "..." / “...” / „...“ → «...»
  text = text.replace(/[""„“]([^""„“]+)[""„“]/g, (match, inner) => {
    if (/[\u0621-\u064A]/.test(inner)) return `«${inner.trim()}»`;
    return match;
  });

  // 3. Normalize Surah Citations: (سورة: آية) or (سورة: من الآية ٢٧٢) → ⦅سورة: من الآية ٢٧٢⦆
  text = text.replace(
    /\(([\u0600-\u06FF\s]+[:؛]\s*(?:من\s+الآية\s+)?[\d\u0660-\u0669]+[^\)]*)\)/gu,
    (_, inner) => `⦅${inner.trim()}⦆`
  );

  // 4. Normalize Parenthesized Ayah preceding a Citation: (آية) ⦅سورة⦆ or **(آية)** ⦅سورة⦆ → «آية» ⦅سورة⦆
  text = text.replace(
    /(?:\*\*)?\(([\u0600-\u06FF\s\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06ED]+)\)(?:\*\*)?\s*(⦅[^⦆]+⦆)/gu,
    (_, ayah, citation) => `«${ayah.trim()}» ${citation}`
  );

  // 5. Normalize Matn quotes introduced by (قوله: / وقوله: / فقوله: / بقوله: / لقوله: / وفي قوله)
  text = text.replace(
    /((?:و?في\s+)?(?:و?قوله|بقوله|لقوله|كقوله)\s*[:：]?\s*)(?:\(([^\)\n]+)\)|\*\*([^*\n]+)\*\*)/gu,
    (match, intro, inParen, inBold) => {
      const content = (inParen || inBold || "").trim();
      if (content && !/^(الجواب|الأول|الثاني|الثالث|مسألة)$/.test(content)) {
        return `${intro}«${content}»`;
      }
      return match;
    }
  );

  // 6. Clean dangling parentheses wrapping quotes: («...») or ( «...» ) → «...»
  text = text.replace(/\(\s*«([^»]+)»\s*\)/gu, "«$1»");

  // 7. Clean outer parentheses when an inner quote exists: (ثم قال لي: «يا عمر..») → ثم قال لي: «يا عمر..»
  text = text.replace(/\(([^()\n]*«[^»\n]+»[^()\n]*)\)/gu, "$1");

  // 8. Clean bold wrapping quotes: **«...»** → «...»
  text = text.replace(/\*\*\s*«([^»]+)»\s*\*\*/gu, "«$1»");

  // 9. Clean quotes wrapping bold: «**...**» → «...»
  text = text.replace(/«\s*\*\*([^*]+)\*\*\s*»/gu, "«$1»");

  // 10. Clean bold inside parentheses: (**...**) → **...**
  text = text.replace(/\(\s*\*\*([^*]+)\*\*\s*\)/gu, "**$1**");

  return text;
}

// ─────────────────────────────────────────────
//  Inline Token Parser
// ─────────────────────────────────────────────

/**
 * Parses inline string into React nodes:
 * - «Hadith/Ayah Quote» → Turquoise highlight badge
 * - ⦅Citation⦆ → Subtle citation pill
 * - **Bold Key Label** → Styled key label (e.g. مسألة: / الجواب:)
 * - Plain text → Clean typography with no leftover asterisks or stray brackets
 */
function parseInlineContent(str, keyRef) {
  if (!str) return str;

  const result = [];
  // Tokenize by «...», ⦅...⦆, **bold**, and *highlight/italic*
  const regex = /(«[^»]+»|⦅[^⦆]+⦆|\*\*[\s\S]+?\*\*|\*[^*\n]+?\*)/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    // Plain text before token
    if (match.index > lastIdx) {
      const plain = str.slice(lastIdx, match.index).replace(/\*/g, "");
      if (plain) result.push(plain);
    }

    const token = match[0];
    const k = keyRef.k++;

    if (token.startsWith("«") && token.endsWith("»")) {
      const inner = token.slice(1, -1).trim().replace(/\*/g, "");
      result.push(
        <span key={`q_${k}`} className={QUOTE_BADGE_CLASS}>
          «{inner}»
        </span>
      );
    } else if (token.startsWith("⦅") && token.endsWith("⦆")) {
      const inner = token.slice(1, -1).trim();
      result.push(
        <span key={`c_${k}`} className={CITATION_BADGE_CLASS}>
          ({inner})
        </span>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      const inner = token.slice(2, -2).trim().replace(/\*/g, "");
      // Check if it's a key label (like مسألة: / الجواب: / الراوي: / التخريج: / أولاً:)
      const isKeyLabel = /^(مسألة|الجواب|تنبيه|فائدة|أولاً|ثانياً|ثالثاً|رابعاً|خامساً|الأول|الثاني|الثالث|الراوي|التخريج|الموقع في الكتاب|المصدر|القاعدة الكلية|تفصيل الحكم|المثال التطبيقي)[:：]?$/.test(
        inner
      );

      result.push(
        <strong
          key={`b_${k}`}
          className={
            isKeyLabel
              ? `${KEY_LABEL_CLASS} ms-0.5`
              : "font-bold text-cyan-900 dark:text-cyan-200"
          }
        >
          {inner}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      const inner = token.slice(1, -1).trim().replace(/\*/g, "");
      result.push(
        <strong
          key={`i_${k}`}
          className="font-bold text-cyan-900 dark:text-cyan-200"
        >
          {inner}
        </strong>
      );
    }

    lastIdx = regex.lastIndex;
  }

  // Remaining trailing text
  if (lastIdx < str.length) {
    const trailing = str.slice(lastIdx).replace(/\*/g, "");
    if (trailing) result.push(trailing);
  }

  return result.length > 0 ? result : str;
}

// ─────────────────────────────────────────────
//  Main Markdown Renderer
// ─────────────────────────────────────────────

/**
 * Transforms raw markdown explanation string into a beautifully structured,
 * authentic Islamic scholarly presentation.
 */
export default function renderMarkdownText(rawText) {
  if (!rawText) return null;

  const normalized = normalizeStructure(rawText);
  if (!normalized) return null;

  const lines = normalized.split(/\r?\n/);
  const keyRef = { k: 0 };
  const blocks = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Heading (# / ## / ###)
    if (trimmed.startsWith("#")) {
      const headingText = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
      if (headingText && !/^الشرح\s*[:：]?\s*$/.test(headingText)) {
        blocks.push(
          <h4
            key={`h_${keyRef.k++}`}
            className="font-3 font-bold text-[1.12em] text-cyan-800 dark:text-cyan-300 mt-2.5 mb-1 border-r-3 border-cyan-700 pr-2"
          >
            {headingText}
          </h4>
        );
      }
      i++;
      continue;
    }

    // 2. Blockquote (> ...)
    if (trimmed.startsWith(">")) {
      const clean = trimmed
        .replace(/^>\s*/, "")
        .replace(/^«/, "")
        .replace(/»$/, "")
        .replace(/^\((.+)\)$/, "$1")
        .trim();

      blocks.push(
        <div key={`bq_${keyRef.k++}`} className="my-1">
          <span className={QUOTE_BADGE_CLASS}>«{clean}»</span>
        </div>
      );
      i++;
      continue;
    }

    // 3. Numbered List Item (e.g. 1. المرتبة الأولى: ... or 1. **القاعدة:** ...)
    if (/^\d+[\.\-\)]\s+/.test(trimmed)) {
      const listItems = [];
      while (i < lines.length && /^\d+[\.\-\)]\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+[\.\-\)]\s+/, "");
        listItems.push(itemText);
        i++;
      }

      blocks.push(
        <ol
          key={`ol_${keyRef.k++}`}
          className="space-y-1 my-1.5 ms-4 list-decimal font-2 text-[0.96em] text-base-content/90 leading-relaxed"
        >
          {listItems.map((it, idx) => (
            <li key={idx} className="ps-1">
              {parseInlineContent(it, keyRef)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 4. Bullet List Item (e.g. - الجملة الأولى... / * **الراوي:** ...)
    if (/^[*\-•]\s+/.test(trimmed)) {
      const listItems = [];
      while (i < lines.length && /^[*\-•]\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[*\-•]\s+/, "");
        listItems.push(itemText);
        i++;
      }

      blocks.push(
        <ul
          key={`ul_${keyRef.k++}`}
          className="space-y-1 my-1.5 ms-4 list-disc font-2 text-[0.96em] text-base-content/90 leading-relaxed"
        >
          {listItems.map((it, idx) => (
            <li key={idx} className="ps-1">
              {parseInlineContent(it, keyRef)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 5. Full-Line Bold Heading (e.g. **نص الحديث:** / **مسألة:** ... / 💡 **اقتراح للحفظ والمراجعة:**)
    const boldHeaderMatch = trimmed.match(/^(?:([^\w\s*]+)\s*)?\*\*([^*]+)\*\*[:：]?$/u);
    if (boldHeaderMatch) {
      const emojiPrefix = boldHeaderMatch[1] ? `${boldHeaderMatch[1]} ` : "";
      const inner = `${emojiPrefix}${boldHeaderMatch[2].trim()}`;
      blocks.push(
        <h5
          key={`fh_${keyRef.k++}`}
          className="font-3 font-bold text-[1.04em] text-cyan-800 dark:text-cyan-300 mt-2.5 mb-1"
        >
          {inner}
        </h5>
      );
      i++;
      continue;
    }

    // 6. Regular Paragraph
    blocks.push(
      <p
        key={`p_${keyRef.k++}`}
        className="font-2 text-[0.96em] leading-relaxed text-base-content/90 mb-1.5"
      >
        {parseInlineContent(trimmed, keyRef)}
      </p>
    );
    i++;
  }

  return blocks;
}

export { QUOTE_BADGE_CLASS, CITATION_BADGE_CLASS };
