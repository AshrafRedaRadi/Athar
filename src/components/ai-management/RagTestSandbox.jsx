import React, { useState } from "react";
import { HiOutlineSparkles, HiOutlinePaperAirplane, HiOutlineDatabase, HiOutlineBookOpen } from "react-icons/hi";

const SAMPLE_QUERIES = [
  "ما حديث الأعمال بالنيات وفي أي كتاب ذُكر؟",
  "اذكر لي الحديث الشريف في فضل العلم وطالب العلم.",
  "ما شروط التوبة الصادقة من الأحاديث المتاحة؟",
];

/**
 * RagTestSandbox - Playground for live RAG response & vector retrieval testing.
 */
export default function RagTestSandbox({ onTestQuery, currentPrompt }) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleRunTest = async (queryText = query) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setTestResult(null);

    try {
      const res = await onTestQuery(queryText, currentPrompt);
      setTestResult(res);
    } catch {
      setTestResult({
        answer: "حدث خطأ أثناء الاتصال بمحرك الاختيار التجريبي.",
        retrievedChunks: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-xs font-2 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-base-200">
        <div>
          <h2 className="font-1 font-bold text-lg text-base-content flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-base">
              <HiOutlineSparkles />
            </span>
            <span>مختبر التجارب الفوري (RAG Sandbox Playground)</span>
          </h2>
          <p className="text-xs text-base-content/60 mt-1">
            اختبر استجابة المساعد الذكي ورؤية الأجزاء المسترجعة من الـ Vector DB مباشرة قبل نشر التعديلات للطلاب.
          </p>
        </div>
      </div>

      {/* Query Input */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-base-content/80">
          اكتب سؤالاً أو اختيار عينة سريعة لاختبار استجابة النظام:
        </label>

        {/* Quick Sample Queries */}
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUERIES.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(q);
                handleRunTest(q);
              }}
              className="btn btn-xs btn-outline border-base-300 font-2 rounded-xl text-[11px] hover:bg-cyan-700 hover:text-white"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRunTest()}
            placeholder="اكتب السؤال هنا واضغط اختبر..."
            className="input input-bordered w-full rounded-2xl text-xs font-2"
          />

          <button
            type="button"
            onClick={() => handleRunTest()}
            disabled={isLoading || !query.trim()}
            className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-2xl text-xs font-bold px-6 gap-2 shrink-0 shadow-xs"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <>
                <HiOutlinePaperAirplane className="text-base rotate-180" />
                <span>اختبر الاستجابة</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {testResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Output Answer */}
          <div className="bg-base-200/40 p-5 rounded-2xl border border-base-200 space-y-3">
            <h4 className="font-1 font-bold text-sm text-cyan-800 dark:text-cyan-400 flex items-center gap-2">
              <HiOutlineSparkles className="text-base" />
              <span>إجابة المساعد الذكي (AI Response):</span>
            </h4>
            <div className="bg-base-100 p-4 rounded-xl border border-base-300 font-2 text-xs leading-relaxed whitespace-pre-line text-base-content">
              {testResult.answer}
            </div>
          </div>

          {/* Retrieved Vector Chunks */}
          <div className="bg-base-200/40 p-5 rounded-2xl border border-base-200 space-y-3">
            <h4 className="font-1 font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <HiOutlineDatabase className="text-base" />
              <span>النصوص والأجزاء المسترجعة (Retrieved RAG Chunks):</span>
            </h4>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {testResult.retrievedChunks?.map((chunk, idx) => (
                <div key={idx} className="bg-base-100 p-3.5 rounded-xl border border-base-300 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1">
                      <HiOutlineBookOpen className="text-sm" />
                      <span>{chunk.bookTitle}</span>
                    </span>
                    <span className="badge badge-success badge-xs font-mono text-[10px] text-white">
                      دقة: {(chunk.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-base-content/80 font-4 leading-relaxed bg-base-200/30 p-2 rounded-lg">
                    "{chunk.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
