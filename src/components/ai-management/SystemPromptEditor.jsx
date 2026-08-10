import React, { useState, useEffect } from "react";
import { HiOutlineSparkles, HiOutlineSave, HiOutlineRefresh, HiOutlineTag, HiOutlineCheck } from "react-icons/hi";
import { DEFAULT_SYSTEM_PROMPT } from "../../services/aiAssistantService";

const PROMPT_PRESETS = [
  {
    id: "default",
    name: "مساعد شرح الأحاديث القياسي",
    description: "البرومبت الرسمي القياسي للإجابة والشرح مع الاستشهاد بالمتون والأحاديث.",
    prompt: DEFAULT_SYSTEM_PROMPT,
  },
  {
    id: "short_explanation",
    name: "مساعد الرد المكتنز والمختصر",
    description: "تركيز الإجابة في نقاط سريعة ومختصرة يناسب المراجعة السريعة قبل التسميع.",
    prompt: `أنت "مساعد أثر للمراجعة السريعة".
أجب عن سؤال المستخدم ({user_query}) باختصار شديد ومباشر في نقاط محددة مستعيناً بالسياق ({context}).
- اذكر الحديث الشريف فوراً.
- اذكر الراوي والمصدر بدون مطولات.`,
  },
  {
    id: "recitation_assistant",
    name: "مساعد التصحيح والتسميع والتشجيع",
    description: "أسلوب تشجيعي مع التركيز على دقة الألفاظ والتصويب الأكاديمي.",
    prompt: `أنت "المعلم الذكي لمنصة أثر".
مهتك مساعدة الطالب في فهم ومراجعة متون الأحاديث.
استعن بالسياق ({context}) لإعطاء التوجيه والتشجيع المناسب لسؤال المستخدم ({user_query}).`,
  },
];

/**
 * SystemPromptEditor - Dedicated Editor for tuning the RAG System Prompt.
 */
export default function SystemPromptEditor({ initialPrompt, onSavePrompt, isSaving }) {
  const [promptText, setPromptText] = useState(initialPrompt || DEFAULT_SYSTEM_PROMPT);
  const [activePreset, setActivePreset] = useState("default");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");

  useEffect(() => {
    if (initialPrompt) {
      setPromptText(initialPrompt);
    }
  }, [initialPrompt]);

  const handleInsertVariable = (varName) => {
    setPromptText((prev) => `${prev} ${varName}`);
  };

  const handleApplyPreset = (preset) => {
    setActivePreset(preset.id);
    setPromptText(preset.prompt);
  };

  const handleResetDefault = () => {
    setActivePreset("default");
    setPromptText(DEFAULT_SYSTEM_PROMPT);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccessMessage("");
    await onSavePrompt(promptText);
    setSaveSuccessMessage("تم حفظ وتطبيق البرومبت المخصص في محرك المساعد الذكي بنجاح!");
    setTimeout(() => setSaveSuccessMessage(""), 4000);
  };

  return (
    <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-xs font-2 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
        <div>
          <h2 className="font-1 font-bold text-lg text-base-content flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-base">
              <HiOutlineSparkles />
            </span>
            <span>البرومبت المخصص للمساعد الذكي (System Prompt Tuning)</span>
          </h2>
          <p className="text-xs text-base-content/60 mt-1">
            هذا النص يُرسل تلقائياً مع كل سؤال من المستخدم ليعين المساعد على صياغة الإجابة بدقة من سياق متون أثر.
          </p>
        </div>

        {/* Preset Selectors */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefault}
            className="btn btn-ghost btn-sm text-xs rounded-xl gap-1"
            title="إعادة ضبط على البرومبت الافتراضي"
          >
            <HiOutlineRefresh className="text-sm" />
            <span>إعادة الضبط</span>
          </button>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="alert alert-success text-xs text-white rounded-xl flex items-center gap-2 py-3 px-4 font-bold">
          <HiOutlineCheck className="text-lg shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Preset Cards Quick Picker */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-base-content/80">
          اختر من النماذج والأنماط المجهزة سلفاً (Preset Templates):
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PROMPT_PRESETS.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-cyan-700 bg-cyan-50/50 dark:bg-cyan-950/30 ring-1 ring-cyan-700"
                    : "border-base-200 hover:border-cyan-500 bg-base-100"
                }`}
              >
                <div>
                  <span className="font-bold text-xs text-base-content font-1 block mb-1">
                    {p.name}
                  </span>
                  <p className="text-[11px] text-base-content/60 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Variables Tag Inserter Strip */}
      <div className="bg-base-200/40 p-3.5 rounded-2xl border border-base-200 space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-base-content/80 font-semibold">
          <HiOutlineTag className="text-cyan-700 text-sm" />
          <span>المتغيرات الديناميكية (اضغط لإدراج المتغير في مكان مؤشر الكتابة):</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleInsertVariable("{context}")}
            className="btn btn-xs bg-cyan-700/10 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-700 hover:text-white border-transparent rounded-lg font-mono text-[11px]"
          >
            &#123;context&#125; - السياق المسترجع من الكتب
          </button>
          <button
            type="button"
            onClick={() => handleInsertVariable("{user_query}")}
            className="btn btn-xs bg-cyan-700/10 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-700 hover:text-white border-transparent rounded-lg font-mono text-[11px]"
          >
            &#123;user_query&#125; - سؤال المستخدم الأصلي
          </button>
          <button
            type="button"
            onClick={() => handleInsertVariable("{hadith_source}")}
            className="btn btn-xs bg-cyan-700/10 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-700 hover:text-white border-transparent rounded-lg font-mono text-[11px]"
          >
            &#123;hadith_source&#125; - اسم الكتاب والراوي
          </button>
          <button
            type="button"
            onClick={() => handleInsertVariable("{user_level}")}
            className="btn btn-xs bg-cyan-700/10 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-700 hover:text-white border-transparent rounded-lg font-mono text-[11px]"
          >
            &#123;user_level&#125; - مستوى طالب العلم
          </button>
        </div>
      </div>

      {/* Textarea Editor */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-base-content/80 mb-2">
            محتوى البرومبت النظامي الحاكم (System Prompt Content):
          </label>
          <textarea
            rows={10}
            required
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="اكتب البرومبت الحاكم هنا..."
            className="w-full p-4 rounded-2xl border border-base-300 bg-base-100 font-mono text-xs leading-relaxed text-base-content focus:outline-hidden focus:border-cyan-600 shadow-xs"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-base-content/50">
            عدد الأحرف: {promptText.length} حرف
          </span>

          <button
            type="submit"
            disabled={isSaving}
            className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold px-8 shadow-md gap-2"
          >
            {isSaving ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                <span>جاري الحفظ في الباكإند...</span>
              </>
            ) : (
              <>
                <HiOutlineSave className="text-base" />
                <span>حفظ وتطبيق البرومبت الجديد</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
