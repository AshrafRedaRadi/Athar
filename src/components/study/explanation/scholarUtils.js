// ─────────────────────────────────────────────
//  Scholar Constants & Extraction Utilities
// ─────────────────────────────────────────────

/** Scholar definitions for the toggle tabs */
export const SCHOLARS = [
  { key: "osaimi", name: "صالح العصيمي", type: "(مختصر)", fullName: "الشيخ صالح العصيمي" },
  { key: "othaymeen", name: "ابن عثيمين", type: "(مطول)", fullName: "الشيخ ابن عثيمين" },
];

const SCHOLAR_CONFIG = {
  osaimi: {
    bookId: 44,
    keywords: ["عصيمي", "العصيمي", "صالح العصيمي", "المختصر"],
  },
  othaymeen: {
    bookId: 45,
    keywords: ["عثيمين", "العثيمين", "ابن عثيمين", "ابن_عثيمين", "محمد بن صالح", "المطول", "الجامع"],
  },
};

/**
 * Check if any keyword from the list appears in the given string value.
 */
function matchesKeywords(val, keywords) {
  if (!val || typeof val !== "string") return false;
  const lower = val.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Search an explanation item's various fields for keyword matches.
 */
function itemMatchesScholar(item, keywords) {
  const fields = [
    item.explanationBookTitle,
    item.explanationBookName,
    item.bookTitle,
    item.bookName,
    item.scholarName,
    item.scholar,
    item.author,
    item.title,
    item.text,
    item.content,
    item.explanationText,
  ];
  return fields.some((f) => matchesKeywords(f, keywords));
}

/**
 * Extract the explanation data for a specific scholar from various backend payload structures.
 *
 * @param {Array|Object|null} explanation - Backend explanation payload
 * @param {"osaimi"|"othaymeen"} scholarKey - Which scholar to extract
 * @returns {Object|string|null}
 */
export function extractScholarExplanation(explanation, scholarKey) {
  if (!explanation) return null;

  const config = SCHOLAR_CONFIG[scholarKey];
  if (!config) return null;

  const { bookId, keywords } = config;

  // ── Array of explanation items ──
  if (Array.isArray(explanation)) {
    // 1. Match by explanationBookId or bookId
    let found = explanation.find(
      (item) =>
        Number(item.explanationBookId) === bookId ||
        Number(item.bookId) === bookId
    );

    // 2. Match by keywords in various fields
    if (!found) {
      found = explanation.find((item) => itemMatchesScholar(item, keywords));
    }

    // 3. Fallback by array index
    if (!found && scholarKey === "osaimi" && explanation.length > 0) {
      found = explanation[0];
    }
    if (!found && scholarKey === "othaymeen" && explanation.length > 1) {
      found = explanation[1];
    }

    return found || null;
  }

  // ── Single object ──
  if (typeof explanation === "object") {
    if (explanation[scholarKey]) return explanation[scholarKey];

    const textKey = scholarKey + "Text";
    const contentKey = scholarKey + "Content";
    if (explanation[textKey] || explanation[contentKey]) {
      return explanation[textKey] || explanation[contentKey];
    }

    if (scholarKey === "osaimi") return explanation;
  }

  return null;
}
