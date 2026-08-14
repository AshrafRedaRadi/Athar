import React, { useState, useEffect } from "react";
import {
  HiOutlineCommandLine,
  HiOutlineBookmark,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineArrowPath,
  HiOutlineEye,
  HiOutlineXMark,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { aiAssistantService } from "../../services/aiAssistantService";

export default function SystemPromptEditor() {
  const [promptText, setPromptText] = useState("");
  const [currentPromptData, setCurrentPromptData] = useState(null);
  const [promptHistory, setPromptHistory] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Modals States
  const [previewItem, setPreviewItem] = useState(null);
  const [confirmRestoreItem, setConfirmRestoreItem] = useState(null);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  // Load current active prompt and history on mount
  const loadPromptData = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [currRes, historyRes] = await Promise.all([
        aiAssistantService.getCurrentPrompt().catch(() => null),
        aiAssistantService.getPromptHistory().catch(() => []),
      ]);

      if (currRes) {
        const payload = currRes.data || currRes;
        const text =
          typeof payload === "string"
            ? payload
            : payload.content ||
              payload.promptText ||
              payload.systemPrompt ||
              "";

        setPromptText(text);
        setCurrentPromptData(typeof payload === "object" ? payload : null);
      }

      const historyList = Array.isArray(historyRes)
        ? historyRes
        : Array.isArray(historyRes?.data)
        ? historyRes.data
        : [];

      // Sort descending by version or createdAt
      setPromptHistory(
        historyList.sort(
          (a, b) => (b.version || b.id || 0) - (a.version || a.id || 0)
        )
      );
    } catch (err) {
      console.warn("Could not load prompt data:", err.message);
      setErrorMessage("تعذر جلب بيانات البرومبت من السيرفر.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromptData();
  }, []);

  // Submit / Update active prompt (PUT /api/admin/chat-prompts)
  const handleExecuteSave = async () => {
    if (!promptText.trim()) return;

    setIsSaving(true);
    setErrorMessage("");
    setSaveSuccessMessage("");
    setIsConfirmSaveOpen(false);

    try {
      const res = await aiAssistantService.updatePrompt({
        content: promptText.trim(),
      });

      const updated = res?.data || res;
      setSaveSuccessMessage(
        `تم حفظ وتفعيل التوجيه كإصدار جديد (النسخة #${updated?.version || ""}) بنجاح! 🎉`
      );

      // Refresh data
      await loadPromptData();

      setTimeout(() => setSaveSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Error updating prompt:", err);
      setErrorMessage(
        err?.message ||
          err?.errors?.Content?.[0] ||
          "تعذر حفظ وتحديث البرومبت في السيرفر."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Restore prompt from history (POST /api/admin/chat-prompts/{id}/restore)
  const handleExecuteRestore = async () => {
    if (!confirmRestoreItem) return;
    const historyId = confirmRestoreItem.id;

    setActionLoadingId(`restore-${historyId}`);
    setErrorMessage("");
    setSaveSuccessMessage("");
    const targetVer = confirmRestoreItem.version;
    setConfirmRestoreItem(null);

    try {
      await aiAssistantService.restorePrompt(historyId);

      setSaveSuccessMessage(
        `تمت استعادة وتفعيل محتوى النسخة (#${targetVer || historyId}) كإصدار نشط جديد بنجاح!`
      );

      // Refresh
      await loadPromptData();

      setTimeout(() => setSaveSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Error restoring prompt:", err);
      setErrorMessage(err?.message || "تعذر استعادة نسخة البرومبت المحددة.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div
      className="bg-base-100 dark:bg-slate-900 border border-base-300 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm font-2 space-y-6 transition-all"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-base-200 dark:border-slate-800">
        <div>
          <h2 className="font-1 font-bold text-lg sm:text-xl text-base-content flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-cyan-700/10 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xl shrink-0 shadow-xs">
              <HiOutlineCommandLine />
            </span>
            <span>توجيهات النظام الحاكمة (System Prompt)</span>
          </h2>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1 font-2">
            البرومبت الرئيسي الذي يُرسله السيرفر لنموذج الذكاء الاصطناعي لتوجيه طريقة الإجابة، الشرح، ودقة الاستناد لكتب ومتون أثر.
          </p>
        </div>

        {/* Current Active Version Indicator */}
        {currentPromptData?.version && (
          <div className="flex items-center gap-2">
            <span className="bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-300/40 dark:border-cyan-800/60 font-bold font-2 text-xs sm:text-sm rounded-xl px-3.5 py-1.5 whitespace-nowrap shadow-xs inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-pulse" />
              <span>النسخة النشطة: الإصدار #{currentPromptData.version}</span>
            </span>
          </div>
        )}
      </div>

      {/* Success Alert */}
      {saveSuccessMessage && (
        <div className="alert alert-success text-xs sm:text-sm rounded-2xl flex items-center gap-2 py-3 px-4 font-bold shadow-xs animate-fadeIn font-2 text-white">
          <HiOutlineCheck className="text-xl shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="alert alert-error text-xs sm:text-sm rounded-2xl flex items-center gap-2 py-3 px-4 font-medium shadow-xs font-2 text-white">
          <HiOutlineExclamationCircle className="text-xl shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="py-14 text-center space-y-2">
          <span className="loading loading-spinner loading-md text-cyan-700" />
          <p className="text-xs text-base-content/70 font-2">جاري جلب بيانات البرومبت الحاكم من السيرفر...</p>
        </div>
      ) : (
        /* Prompt Form & Textarea */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsConfirmSaveOpen(true);
          }}
          className="space-y-4 font-2"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-semibold text-base-content font-2">
                نص التوجيه الحاكم الشامل (System Prompt Content):
              </label>
              <span className="text-xs text-base-content/60 font-mono">
                الحد الأقصى: 12,000 حرف
              </span>
            </div>

            <textarea
              rows={11}
              required
              maxLength={12000}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="اكتب هنا جميع التعليمات والقواعد الحاكمة للمساعد الذكي..."
              className="textarea textarea-bordered w-full rounded-2xl font-2 text-xs sm:text-sm leading-relaxed text-base-content bg-base-100 dark:bg-slate-800 border-base-300 dark:border-slate-700 p-4 min-h-[220px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <span className="text-xs sm:text-sm text-base-content/70 font-2">
              عدد الأحرف:{" "}
              <span
                className={`font-bold font-mono text-sm ${
                  promptText.length > 11500
                    ? "text-error"
                    : "text-cyan-700 dark:text-cyan-400"
                }`}
              >
                {promptText.length.toLocaleString("en-US")}
              </span>{" "}
              / 12,000 حرف
            </span>

            <button
              type="submit"
              disabled={isSaving || !promptText.trim()}
              className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-2xl font-2 font-bold text-xs sm:text-sm px-7 h-11 shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  <span>جاري الحفظ والتطبيق...</span>
                </>
              ) : (
                <>
                  <HiOutlineBookmark className="text-base" />
                  <span>حفظ وتفعيل كإصدار جديد</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── Prompt Version History Section ── */}
      {promptHistory.length > 0 && (
        <div className="pt-5 border-t border-base-200 dark:border-slate-800 space-y-3.5 font-2">
          <div className="flex items-center justify-between">
            <h3 className="font-1 font-bold text-sm sm:text-base text-base-content flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-cyan-700/10 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-sm shadow-xs">
                <HiOutlineClock />
              </span>
              <span>سجل إصدارات البرومبت ({promptHistory.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-base-300 dark:border-slate-800">
            <table className="table w-full text-right align-middle font-2">
              <thead>
                <tr className="bg-base-200/70 dark:bg-slate-800/80 text-base-content/80 font-bold border-b border-base-300 dark:border-slate-800 text-[11px] sm:text-xs font-1">
                  <th className="text-right py-3 px-4">رقم الإصدار (Version)</th>
                  <th className="text-center py-3 px-4">الحالة</th>
                  <th className="text-center py-3 px-4">تاريخ الحفظ</th>
                  <th className="text-center py-3 px-4">المعاينة</th>
                  <th className="text-center py-3 px-4">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200/70 dark:divide-slate-800/70 text-xs">
                {promptHistory.map((item) => {
                  const itemId = item.id;
                  const itemVer = item.version || itemId;
                  const isActive = !!item.isActive;
                  return (
                    <tr
                      key={itemId}
                      className="hover:bg-base-200/40 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Version */}
                      <td className="text-right font-bold text-base-content py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <HiOutlineSparkles className="text-cyan-700 dark:text-cyan-400 text-sm shrink-0" />
                          <span>الإصدار #{itemVer}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="text-center py-3.5 px-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold text-[11px] rounded-xl px-2.5 py-1 whitespace-nowrap inline-flex items-center justify-center">
                            النشط حالياً
                          </span>
                        ) : (
                          <span className="badge badge-ghost text-base-content/60 text-[11px] rounded-xl px-2.5 py-1 whitespace-nowrap inline-flex items-center justify-center">
                            سابق
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="text-center text-base-content/70 font-mono text-xs py-3.5 px-4 whitespace-nowrap">
                        {item.createdAt
                          ? new Date(item.createdAt).toISOString().split("T")[0]
                          : "—"}
                      </td>

                      {/* Preview Button */}
                      <td className="text-center py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="btn btn-xs btn-ghost text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 rounded-xl gap-1 font-bold text-xs"
                          title="عرض ومعاينة النص الكامل للنسخة"
                        >
                          <HiOutlineEye className="text-sm" />
                          <span>معاينة</span>
                        </button>
                      </td>

                      {/* Actions (Restore button only for inactive) */}
                      <td className="text-center py-3.5 px-4 whitespace-nowrap">
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => setConfirmRestoreItem(item)}
                            disabled={actionLoadingId === `restore-${itemId}`}
                            className="btn btn-xs btn-outline border-cyan-600 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-700 hover:text-white rounded-xl gap-1 font-bold font-2 px-3 shadow-xs active:scale-95"
                          >
                            {actionLoadingId === `restore-${itemId}` ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <HiOutlineArrowPath className="text-xs" />
                            )}
                            <span>استعادة</span>
                          </button>
                        ) : (
                          <span className="text-xs text-base-content/50 font-medium font-2 whitespace-nowrap">
                            مفعّل
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 1. Save Confirmation Modal ── */}
      {isConfirmSaveOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          dir="rtl"
        >
          <div className="bg-base-100 dark:bg-slate-900 border border-base-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-2 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-base-200 dark:border-slate-800">
              <h3 className="font-1 font-bold text-base sm:text-lg text-base-content flex items-center gap-2">
                <HiOutlineBookmark className="text-cyan-700 dark:text-cyan-400 text-xl" />
                <span>تأكيد حفظ التوجيه الحاكم</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsConfirmSaveOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <HiOutlineXMark className="text-lg" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed font-2">
              سيقوم السيرفر بتعطيل النسخة الحالية وإنشاء <strong>إصدار نشط جديد (Version)</strong> يحكم كافة إجابات المساعد الذكي في المحادثات الجديدة فوراً.
            </p>

            <div className="p-3 bg-cyan-50/60 dark:bg-cyan-950/30 rounded-2xl border border-cyan-200/60 dark:border-cyan-900/40 text-xs text-cyan-900 dark:text-cyan-300">
              💡 تظل النسخ السابقة محفوظة في السجل ويمكنك الرجوع إليها في أي وقت.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmSaveOpen(false)}
                className="btn btn-sm btn-ghost rounded-xl text-xs sm:text-sm"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleExecuteSave}
                disabled={isSaving}
                className="btn btn-sm bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-bold text-xs sm:text-sm px-4"
              >
                تأكيد الحفظ والتفعيل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Restore Confirmation Modal ── */}
      {confirmRestoreItem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          dir="rtl"
        >
          <div className="bg-base-100 dark:bg-slate-900 border border-base-300 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-2 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-base-200 dark:border-slate-800">
              <h3 className="font-1 font-bold text-base sm:text-lg text-base-content flex items-center gap-2">
                <HiOutlineArrowPath className="text-cyan-700 dark:text-cyan-400 text-xl" />
                <span>تأكيد استعادة النسخة #{confirmRestoreItem.version || confirmRestoreItem.id}</span>
              </h3>
              <button
                type="button"
                onClick={() => setConfirmRestoreItem(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <HiOutlineXMark className="text-lg" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed font-2">
              سيقوم السيرفر بنسخ هذا المحتوى وإنشاء <strong>إصدار جديد نشط</strong> وتفعيله مباشرة للمحادثات القادمة دون مساس بالسجل التاريخي القديم.
            </p>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-base-content/70 block">
                معاينة محتوى النسخة المستعادة:
              </span>
              <div className="p-3 bg-base-200/70 dark:bg-slate-800 rounded-2xl max-h-40 overflow-y-auto font-mono text-xs leading-relaxed text-base-content/90 border border-base-300 dark:border-slate-700 whitespace-pre-wrap">
                {confirmRestoreItem.content || confirmRestoreItem.promptText || confirmRestoreItem.prompt}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRestoreItem(null)}
                className="btn btn-sm btn-ghost rounded-xl text-xs sm:text-sm"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleExecuteRestore}
                disabled={actionLoadingId === `restore-${confirmRestoreItem.id}`}
                className="btn btn-sm bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-bold text-xs sm:text-sm px-5"
              >
                استعادة كنسخة جديدة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Full Text Preview Modal ── */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          dir="rtl"
        >
          <div className="bg-base-100 dark:bg-slate-900 border border-base-300 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 font-2 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-base-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="font-1 font-bold text-base sm:text-lg text-base-content">
                  معاينة الإصدار #{previewItem.version || previewItem.id}
                </h3>
                {previewItem.isActive ? (
                  <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-xl px-2.5 py-0.5">
                    النشط حالياً
                  </span>
                ) : (
                  <span className="badge badge-ghost text-xs rounded-xl px-2.5">
                    سابق
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <HiOutlineXMark className="text-lg" />
              </button>
            </div>

            <div className="p-4 bg-base-200/70 dark:bg-slate-800 rounded-2xl max-h-[380px] overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed text-base-content border border-base-300 dark:border-slate-700 whitespace-pre-wrap">
              {previewItem.content || previewItem.promptText || previewItem.prompt}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-base-content/60 font-mono">
                تاريخ الإنشاء: {previewItem.createdAt ? new Date(previewItem.createdAt).toLocaleString("ar-EG") : "—"}
              </span>

              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="btn btn-sm bg-cyan-700 text-white rounded-xl px-5 text-xs sm:text-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
