import React from "react";
import renderMarkdownText from "./markdownRenderer";

/**
 * Empty state placeholder shown when no explanation is available.
 */
function EmptyState({ message }) {
  return (
    <div className="p-5 text-center bg-base-200/50 rounded-2xl border border-dashed border-base-300 my-3">
      <p className="font-2 text-[13px] sm:text-base text-base-content/60 leading-relaxed">
        {message}
      </p>
    </div>
  );
}

/**
 * Extract text fields from a scholar explanation item (object or string).
 */
function parseScholarItem(item) {
  if (typeof item === "string") {
    return { rawText: item, summary: "", sections: null, keyPoints: null };
  }

  if (typeof item === "object" && item !== null) {
    const rawText =
      item.text ||
      item.Text ||
      item.content ||
      item.Content ||
      item.explanationText ||
      item.ExplanationText ||
      item.details ||
      item.Details ||
      item.body ||
      item.Body ||
      item.description ||
      item.Description ||
      "";

    const summary = item.summary || item.Summary || "";
    const rawSecs = item.sections || item.Sections;
    const rawKeys = item.keyPoints || item.KeyPoints;

    return {
      rawText,
      summary,
      sections: Array.isArray(rawSecs) ? rawSecs : null,
      keyPoints: Array.isArray(rawKeys) ? rawKeys : null,
    };
  }

  return { rawText: "", summary: "", sections: null, keyPoints: null };
}

/**
 * Renders the explanation content for a single scholar.
 * Handles raw markdown text, summary, structured sections, and key points.
 *
 * @param {Object|string|null} item - Scholar explanation data from the backend
 * @param {string} emptyMsg - Fallback message when no content is available
 */
export default function ScholarTextContent({ item, emptyMsg, fontSize = 16 }) {
  if (!item) return <EmptyState message={emptyMsg} />;

  const { rawText, summary, sections, keyPoints } = parseScholarItem(item);

  const hasContent = Boolean(
    (rawText && rawText.trim().length > 0) ||
      summary ||
      (sections && sections.length > 0) ||
      (keyPoints && keyPoints.length > 0)
  );

  if (!hasContent) return <EmptyState message={emptyMsg} />;

  return (
    <div
      className="space-y-3 bg-base-100 p-2 rounded-xl transition-all duration-150"
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.85 }}
    >
      {/* Summary Card */}
      {summary && (
        <div className="p-3 bg-cyan-700/10 border border-cyan-700/20 rounded-xl text-[0.9em] font-2 leading-relaxed text-base-content">
          <span className="font-bold text-cyan-800 dark:text-cyan-300 block mb-1">
            الخلاصة:
          </span>
          {summary}
        </div>
      )}

      {/* Main markdown body */}
      {rawText && renderMarkdownText(rawText)}

      {/* Structured sections */}
      {sections &&
        sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1.5 mt-3">
            {sec.title && (
              <h4 className="font-3 font-bold text-base text-cyan-800 dark:text-cyan-300 border-r-2 border-cyan-700 pr-2 my-2">
                {sec.title}
              </h4>
            )}
            {sec.content && renderMarkdownText(sec.content)}
            {Array.isArray(sec.items) && (
              <ul className="space-y-1 ms-4 list-disc font-2 text-sm text-base-content/90">
                {sec.items.map((it, iIdx) => (
                  <li key={iIdx}>{it}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

      {/* Key points */}
      {keyPoints && keyPoints.length > 0 && (
        <div className="bg-base-200/60 p-3 rounded-xl border border-base-300 mt-3">
          <h5 className="font-3 font-bold text-sm text-cyan-800 dark:text-cyan-300 mb-2">
            الفوائد والنقاط المهمة:
          </h5>
          <ul className="space-y-1.5 text-sm font-2 text-base-content/85">
            {keyPoints.map((kp, kIdx) => (
              <li key={kIdx} className="flex items-start gap-2">
                <span className="text-cyan-700 font-bold">•</span>
                <span>{kp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
