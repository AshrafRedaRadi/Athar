import React, { useState, useEffect, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiLock } from "react-icons/fi";
import { useSubscription } from "../../../context/SubscriptionContext";

/**
 * RecitationResultsModal — Displays recitation performance results:
 * - Accuracy percentage & gauge
 * - Coverage percentage & progress bar
 * - Recitation errors list with side-by-side format: الخطأ ➔ الصحيح
 * - Extra / Out-of-context words list at the bottom
 * - Smooth entrance and exit animations (animate-modalIn / animate-modalOut)
 */
export default function RecitationResultsModal({ isOpen, onClose, summary, extras = [] }) {
  const { isAdvancedStatsLocked, showUpgradeModal } = useSubscription();
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
      if (str.includes("extra") || str.includes("زائدة") || str.includes("غير موجودة")) return true;
    }
    return false;
  };

  // Split issues into main errors vs extra words
  const extraWordsFromIssues = [];
  const filteredIssues = [];

  rawIssues.forEach((issue) => {
    if (isExtraItem(issue)) {
      const word =
        (typeof issue === "object" && issue !== null)
          ? issue.actual || issue.Actual || issue.spoken || issue.Spoken || issue.word || issue.Word || issue.text || issue.Text || issue.message || issue.Message
          : String(issue);
      if (word) extraWordsFromIssues.push(word);
    } else {
      filteredIssues.push(issue);
    }
  });

  // Combine extras from stream and issues list
  const combinedExtras = Array.from(new Set([...(extras || []), ...extraWordsFromIssues])).filter(Boolean);

  // Grade determination with elegant cyan-blue color palette
  const getGrade = (acc) => {
    if (acc >= 90) return { label: "ممتاز", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-600 dark:bg-cyan-400" };
    if (acc >= 75) return { label: "جيد جداً", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-600 dark:bg-sky-400" };
    if (acc >= 60) return { label: "جيد", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-600 dark:bg-teal-400" };
    return { label: "يحتاج تدريب", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-600 dark:bg-rose-400" };
  };

  const grade = getGrade(accuracy);

  // Circular progress calculations
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, accuracy)) / 100) * circumference;

  // Helper to parse each issue format
  const parseIssue = (issue) => {
    if (typeof issue === "string") {
      return { message: issue };
    }
    return {
      expected: issue.expected || issue.Expected || issue.correct || issue.Correct || issue.expectedWord || issue.ExpectedWord || null,
      actual: issue.actual || issue.Actual || issue.spoken || issue.Spoken || issue.recognized || issue.Recognized || null,
      message: issue.message || issue.Message || issue.description || issue.Description || null,
    };
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      dir="rtl"
      onClick={handleClose}
    >
      <div
        className={`bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-3xl shadow-2xl w-full max-w-[360px] sm:max-w-[390px] overflow-hidden transform transition-transform duration-200 ${
          isClosing ? "scale-95 animate-modalOut" : "scale-100 animate-modalIn"
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
            className="btn btn-circle btn-ghost btn-sm text-white/80 hover:text-white cursor-pointer"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Body */}
        {isAdvancedStatsLocked ? (
          <div className="p-6 text-center space-y-4">
            {/* Lock Icon */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center text-3xl mx-auto shadow-sm">
              <FiLock />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-1 font-bold text-base sm:text-lg text-base-content">
                إحصائيات التسميع المتقدمة 🔒
              </h4>
              <p className="font-2 text-xs sm:text-sm text-base-content/70 leading-relaxed">
                تقارير دقة التسميع، ونسبة تغطية الحديث، والتحليل المفصل للأخطاء والكلمات الزائدة متاحة حصرياً لمشتركي <strong className="text-cyan-700 dark:text-cyan-400 font-bold">الباقة القياسية</strong>.
              </p>
            </div>

            {/* Blurred Teaser Preview */}
            <div className="relative rounded-2xl p-4 bg-base-200/50 dark:bg-slate-800/50 border border-base-300 dark:border-slate-700 overflow-hidden">
              <div className="filter blur-[3px] opacity-35 select-none pointer-events-none space-y-2.5">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500 mx-auto flex items-center justify-center">
                  <span className="text-sm font-bold">100%</span>
                </div>
                <div className="h-2 bg-base-300 rounded-full w-3/4 mx-auto" />
                <div className="text-[11px] text-base-content/60">تحليل الأخطاء والكلمات الزائدة</div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-3 py-1 rounded-full bg-slate-900/90 text-amber-300 text-xs font-bold shadow-md border border-amber-400/40">
                  ميزة مقفلة
                </span>
              </div>
            </div>

            {/* Upgrade CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  showUpgradeModal("إحصائيات التسميع المتقدمة");
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-l from-cyan-700 via-cyan-600 to-cyan-700 hover:from-cyan-800 hover:to-cyan-700 text-white text-sm font-bold shadow-md shadow-cyan-900/20 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>ترقية الآن</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Accuracy Circle */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-36 h-36">
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
                    className="text-base-300 dark:text-base-700"
                    strokeWidth="7"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    className={grade.color}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span
                    className={`font-1 text-2xl font-bold tracking-tight ${grade.color} leading-none mb-1`}
                  >
                    {Math.round(accuracy)}%
                  </span>
                  <span className="font-2 text-xs text-base-content/60 leading-none">
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
                <span className="font-2 text-xs sm:text-sm text-base-content/80 font-medium">
                  التغطية <span className="text-[11px] text-base-content/50 font-normal">(ما تم تسميعه من الحديث)</span>
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
              <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-900/60 rounded-xl px-4 py-3">
                <FiCheckCircle className="text-cyan-600 dark:text-cyan-400 text-lg" />
                <span className="font-2 text-sm text-cyan-700 dark:text-cyan-300 font-medium">
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
                <span className="font-2 text-xs text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-medium">
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
        )}
      </div>
    </div>
  );
}
