import React, { useState, useEffect, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import { FiCheckCircle, FiAlertTriangle, FiXCircle } from "react-icons/fi";

/**
 * RecitationResultsModal — Displays recitation performance results:
 * - Accuracy percentage & gauge
 * - Coverage percentage & progress bar
 * - Recitation errors list with side-by-side format: الخطأ ➔ الصحيح
 * - Extra / Out-of-context words list at the bottom
 * - Smooth entrance and exit animations (animate-modalIn / animate-modalOut)
 */
export default function RecitationResultsModal({ isOpen, onClose, summary, extras = [] }) {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  }, [isClosing, onClose]);

  if (!shouldRender || !summary) return null;

  // Helper to extract nested or flat properties
  const extractVal = (obj, ...keys) => {
    for (const key of keys) {
      if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
      if (obj?.metrics && obj.metrics[key] !== undefined && obj.metrics[key] !== null) return obj.metrics[key];
      if (obj?.Metrics && obj.Metrics[key] !== undefined && obj.Metrics[key] !== null) return obj.Metrics[key];
    }
    return undefined;
  };

  // Accuracy extraction
  let rawAccuracy =
    extractVal(
      summary,
      "accuracy",
      "Accuracy",
      "accuracyPercentage",
      "AccuracyPercentage",
      "accuracyPercent",
      "AccuracyPercent",
      "score",
      "Score"
    ) ?? 0;

  if (typeof rawAccuracy === "number" && rawAccuracy > 0 && rawAccuracy <= 1) {
    rawAccuracy = rawAccuracy * 100;
  }

  // Coverage extraction
  let rawCoverage =
    extractVal(
      summary,
      "coverage",
      "Coverage",
      "coveragePercentage",
      "CoveragePercentage",
      "coveragePercent",
      "CoveragePercent"
    ) ?? 0;

  if (typeof rawCoverage === "number" && rawCoverage > 0 && rawCoverage <= 1) {
    rawCoverage = rawCoverage * 100;
  }

  const accuracy = Number(rawAccuracy) || 0;
  const coverage = Number(rawCoverage) || 0;
  const rawIssues = extractVal(summary, "issues", "Issues") || [];
  const saved = extractVal(summary, "saved", "Saved") ?? false;

  // Helper to test if an issue item represents an extra word
  const isExtraItem = (issue) => {
    if (typeof issue === "string") {
      return issue.toLowerCase().includes("extra");
    }
    if (typeof issue === "object" && issue !== null) {
      const type = String(issue.type || issue.Type || issue.issueType || issue.IssueType || "").toLowerCase();
      if (type.includes("extra")) return true;
      if (issue.isExtra || issue.IsExtra) return true;
      const str = Object.values(issue).join(" ").toLowerCase();
      if (str.includes("extra")) return true;
    }
    return false;
  };

  // 1. Filter out extra words from main issues list
  const filteredIssues = rawIssues.filter((item) => !isExtraItem(item));

  // 2. Extract clean word text from extra issue items
  const cleanExtraText = (item) => {
    if (typeof item === "string") {
      return item.replace(/extra/gi, "").replace(/\d+/g, "").replace(/[-_:]/g, " ").trim();
    }
    const val =
      item?.actual ||
      item?.Actual ||
      item?.word ||
      item?.Word ||
      item?.text ||
      item?.Text ||
      item?.spoken ||
      item?.Spoken ||
      item?.recognizedText ||
      item?.RecognizedText ||
      "";
    if (val) return String(val).replace(/extra/gi, "").replace(/\d+/g, "").replace(/[-_:]/g, " ").trim();
    return Object.values(item)
      .filter((v) => typeof v === "string" || typeof v === "number")
      .join(" ")
      .replace(/extra/gi, "")
      .replace(/\d+/g, "")
      .replace(/[-_:]/g, " ")
      .trim();
  };

  // Combine extras prop + extra items from issues list
  const extraWordsFromIssues = rawIssues.filter(isExtraItem).map(cleanExtraText).filter(Boolean);
  const extraWordsFromProp = extras.map(cleanExtraText).filter(Boolean);

  const combinedExtras = Array.from(new Set([...extraWordsFromProp, ...extraWordsFromIssues])).filter(Boolean);

  // Parser for issue items into expected (correct) and actual (wrong spoken) words
  const parseIssue = (issue) => {
    if (typeof issue === "string") {
      const parts = issue
        .replace(/extra/gi, "")
        .replace(/\d+/g, "")
        .split(/[-─➔>:]/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (parts.length >= 2) {
        return { expected: parts[0], actual: parts[1] };
      } else if (parts.length === 1) {
        return { expected: parts[0], actual: "" };
      }
      return { expected: "", actual: "", message: issue };
    }

    if (typeof issue === "object" && issue !== null) {
      const expected =
        issue.expected ||
        issue.Expected ||
        issue.expectedWord ||
        issue.ExpectedWord ||
        issue.expectedText ||
        issue.ExpectedText ||
        "";

      let actual =
        issue.actual ||
        issue.Actual ||
        issue.actualWord ||
        issue.ActualWord ||
        issue.actualText ||
        issue.ActualText ||
        issue.spoken ||
        issue.Spoken ||
        issue.spokenWord ||
        issue.SpokenWord ||
        issue.spokenText ||
        issue.SpokenText ||
        issue.recognized ||
        issue.Recognized ||
        issue.recognizedText ||
        issue.RecognizedText ||
        issue.userWord ||
        issue.UserWord ||
        issue.userText ||
        issue.UserText ||
        issue.said ||
        issue.Said ||
        issue.got ||
        issue.Got ||
        issue.input ||
        issue.Input ||
        "";

      const message =
        issue.message ||
        issue.Message ||
        issue.description ||
        issue.Description ||
        issue.detail ||
        issue.Detail ||
        issue.text ||
        issue.Text ||
        "";

      if (!actual && message) {
        const parts = message
          .replace(/extra/gi, "")
          .replace(/\d+/g, "")
          .split(/[-─➔>:]/)
          .map((p) => p.trim())
          .filter(Boolean);
        if (parts.length >= 2) {
          actual = parts[1];
        }
      }

      return { expected, actual, message };
    }

    return { expected: "", actual: "", message: String(issue) };
  };

  // Grade based on accuracy
  const getGrade = (pct) => {
    if (pct >= 90) return { label: "ممتاز", color: "text-emerald-500", bg: "bg-emerald-500" };
    if (pct >= 75) return { label: "جيد جداً", color: "text-cyan-500", bg: "bg-cyan-500" };
    if (pct >= 60) return { label: "جيد", color: "text-amber-500", bg: "bg-amber-500" };
    return { label: "يحتاج مراجعة", color: "text-red-500", bg: "bg-red-500" };
  };

  const grade = getGrade(accuracy);

  // SVG circular progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, accuracy)) / 100) * circumference;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 ${
        isClosing ? "animate-backdropOut" : "animate-backdropIn"
      }`}
      onClick={handleClose}
      dir="rtl"
    >
      <div
        className={`bg-base-100 rounded-3xl shadow-2xl border border-base-300 w-full max-w-sm overflow-hidden ${
          isClosing ? "animate-modalOut" : "animate-modalIn"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-l from-cyan-600 to-teal-700 px-5 py-4 flex items-center justify-between">
          <h3 className="font-1 text-white text-lg font-bold">
            نتيجة التسميع
          </h3>
          <button
            onClick={handleClose}
            className="btn btn-circle btn-ghost btn-sm text-white/80 hover:text-white"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Accuracy Circle */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-32 h-32">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  className="text-base-300"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  className={grade.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`font-1 text-3xl font-bold ${grade.color}`}
                >
                  {Math.round(accuracy)}%
                </span>
                <span className="font-2 text-xs text-base-content/60">
                  الدقة
                </span>
              </div>
            </div>
            <span className={`font-2 text-sm font-semibold ${grade.color}`}>
              {grade.label}
            </span>
          </div>

          {/* Coverage Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-2 text-sm text-base-content/70">
                التغطية
              </span>
              <span className="font-2 text-sm font-semibold text-base-content">
                {Math.round(coverage)}%
              </span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${grade.bg} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(100, Math.max(0, coverage))}%` }}
              />
            </div>
          </div>

          {/* Main Recitation Errors List (Side-by-side: الخطأ ➔ الصحيح) */}
          {filteredIssues.length > 0 ? (
            <div className="space-y-2">
              <span className="font-2 text-sm text-base-content/70 block font-semibold">
                ملاحظات وأخطاء التسميع ({filteredIssues.length}):
              </span>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {filteredIssues.map((rawItem, i) => {
                  const { expected, actual, message } = parseIssue(rawItem);
                  const type = String(rawItem?.type || rawItem?.Type || "").toLowerCase();
                  const isMissing = type.includes("miss") || type.includes("skip");

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-base-200/70 rounded-xl px-3 py-2 border border-base-300/40"
                    >
                      {isMissing ? (
                        <FiXCircle className="text-red-500 shrink-0 text-sm" />
                      ) : (
                        <FiAlertTriangle className="text-amber-500 shrink-0 text-sm" />
                      )}
                      <div className="font-2 text-xs leading-relaxed flex items-center flex-wrap gap-2 w-full">
                        {actual ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-base-content/60">المنطوق:</span>
                            <strong className="text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded border border-red-200/60 dark:border-red-900/60">
                              {actual}
                            </strong>
                            <span className="text-base-content/40 font-bold">←</span>
                            <span className="text-base-content/60">الصحيح:</span>
                            <strong className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/60">
                              {expected}
                            </strong>
                          </div>
                        ) : expected ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-base-content/60">
                              {isMissing ? "الصحيح (كلمة متروكة):" : "الصحيح:"}
                            </span>
                            <strong className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/60">
                              {expected}
                            </strong>
                          </div>
                        ) : (
                          <span className="text-base-content font-medium">{message}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-4 py-3">
              <FiCheckCircle className="text-emerald-500 text-lg" />
              <span className="font-2 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                لا توجد أخطاء تسميع — أداء ممتاز!
              </span>
            </div>
          )}

          {/* Extra / Out of Context Words Section */}
          {combinedExtras.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-base-200 dark:border-base-800">
              <span className="font-2 text-xs text-red-600 dark:text-red-400 block font-semibold">
                الكلمات الزائدة / الخارجة عن السياق ({combinedExtras.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {combinedExtras.map((word, i) => (
                  <span
                    key={i}
                    className="inline-block bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-4 text-xs px-2.5 py-0.5 rounded-lg border border-red-200 dark:border-red-800/60"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Saved Status */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {saved ? (
              <span className="font-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <FiCheckCircle className="text-sm" />
                تم حفظ المحاولة
              </span>
            ) : (
              <span className="font-2 text-xs text-base-content/40">
                لم يتم حفظ هذه المحاولة
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
