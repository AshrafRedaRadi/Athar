import React, { useState, useEffect } from "react";
import { HiOutlineSparkles, HiOutlineXMark } from "react-icons/hi2";
import RagTestSandbox from "../ai-management/RagTestSandbox";

/**
 * Large popup modal dialog for AI Assistant Chat
 * Available across Home, Library, Study, and general app pages.
 */
export default function AiChatModal({ isOpen, onClose }) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (isOpen) {
      setIsRendered(true);
      const frame1 = requestAnimationFrame(() => {
        const frame2 = requestAnimationFrame(() => {
          setIsVisible(true);
        });
        timeoutId = frame2;
      });
      timeoutId = frame1;
    } else {
      setIsVisible(false);
      timeoutId = setTimeout(() => {
        setIsRendered(false);
      }, 300);
    }

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(timeoutId);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isRendered) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6"
      role="dialog"
      aria-modal="true"
      dir="rtl"
    >
      {/* ── Blurred Backdrop ── */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ease-out cursor-pointer ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ── Large Dialog Card ── */}
      <div
        className={`relative z-10 w-full max-w-6xl h-[92vh] sm:h-[86vh] max-h-[900px] bg-base-100 dark:bg-slate-900 border border-cyan-500/20 dark:border-cyan-500/30 rounded-3xl sm:rounded-4xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
          isVisible
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-[0.94] translate-y-4 opacity-0"
        }`}
      >
        {/* ── Sleek Modal Top Bar ── */}
        <div className="px-5 sm:px-7 py-3.5 border-b border-base-200 dark:border-slate-800 bg-base-100/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0 font-2">
          {/* Header Title with Sparkling Icon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-700 via-cyan-600 to-cyan-500 text-white flex items-center justify-center text-xl shadow-md shadow-cyan-600/30 shrink-0">
              <HiOutlineSparkles className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-1 font-bold text-base sm:text-lg text-base-content flex items-center gap-2">
                <span>مساعد أثر الذكي</span>
                <span className="badge badge-sm bg-cyan-700/10 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-700/20 rounded-lg px-2 py-0.5 text-[10px] hidden sm:inline-flex">
                  أثر AI
                </span>
              </h3>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-base-200 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-base-content/70 flex items-center justify-center text-xl transition-all duration-200 cursor-pointer active:scale-90"
            title="إغلاق النافذة (Esc)"
            aria-label="إغلاق"
          >
            <HiOutlineXMark />
          </button>
        </div>

        {/* ── Modal Main Chat Area ── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <RagTestSandbox isModal={true} />
        </div>
      </div>
    </div>
  );
}
