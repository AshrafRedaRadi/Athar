import { useEffect, useRef } from "react";
import { IoCloseOutline, IoBookOutline } from "react-icons/io5";
import { IoPlayCircleOutline } from "react-icons/io5";
import { HiOutlineLocationMarker } from "react-icons/hi";

/**
 * ExplanationPanel — sliding drawer from the LEFT on desktop,
 * bottom-sheet on mobile/tablet.
 *
 * Always rendered in the DOM so CSS transitions work for both open and close.
 *
 * Props:
 *  - isOpen     {boolean}   Whether the panel is visible
 *  - onClose    {function}  Callback to close the panel
 *  - activeTab  {string}    "text" | "video"
 *  - onTabChange {function} Callback when tab changes
 *  - explanation {object}   { summary, sections[], videoTitle, videoDuration, videoSpeaker, keyPoints[] }
 */
export default function ExplanationPanel({ isOpen, onClose, activeTab, onTabChange, explanation }) {
  const panelRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* ═══════════════════════════════════════════
          ── Desktop (lg+): Slide-in drawer from LEFT ──
          ═══════════════════════════════════════════ */}

      {/* Overlay */}
      <div
        className={`hidden lg:block fixed inset-0 bg-black/30 z-40
                    transition-opacity duration-500 ease-in-out
                    ${isOpen
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        ref={panelRef}
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full w-[340px] z-50
                    bg-base-100 border-e border-base-300 shadow-2xl
                    transition-transform duration-500 ease-in-out will-change-transform
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <IoBookOutline className="text-lg text-cyan-700" />
            <span className="font-3 font-bold text-base">شرح الحديث</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="إغلاق"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <PanelContent
            activeTab={activeTab}
            onTabChange={onTabChange}
            explanation={explanation}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          ── Mobile/Tablet (<lg): Bottom-sheet ──
          Always in DOM for smooth open/close transitions
          ═══════════════════════════════════════════ */}

      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/40 z-50
                    transition-opacity duration-500 ease-in-out
                    ${isOpen
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-50
                    bg-base-100 rounded-t-2xl max-h-[80vh] overflow-y-auto shadow-2xl
                    transition-transform duration-500 ease-in-out will-change-transform
                    ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-base-100 flex items-center justify-between p-4 border-b border-base-300 z-10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <IoBookOutline className="text-lg text-cyan-700" />
            <span className="font-3 font-bold text-base">شرح الحديث</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="إغلاق"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <div className="p-4">
          <PanelContent
            activeTab={activeTab}
            onTabChange={onTabChange}
            explanation={explanation}
          />
        </div>
      </div>
    </>
  );
}

/* ── Shared content for both desktop & mobile ── */
function PanelContent({ activeTab, onTabChange, explanation }) {
  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-base-300" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "video"}
          onClick={() => onTabChange("video")}
          className={`flex-1 py-2.5 font-2 text-sm text-center transition-colors ${
            activeTab === "video"
              ? "text-cyan-700 border-b-2 border-cyan-700 font-bold"
              : "text-base-content/50 hover:text-base-content"
          }`}
        >
          الشرح المرئي
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "text"}
          onClick={() => onTabChange("text")}
          className={`flex-1 py-2.5 font-2 text-sm text-center transition-colors ${
            activeTab === "text"
              ? "text-cyan-700 border-b-2 border-cyan-700 font-bold"
              : "text-base-content/50 hover:text-base-content"
          }`}
        >
          الشرح النصي
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "text" ? (
        <TextExplanation explanation={explanation} />
      ) : (
        <VideoExplanation explanation={explanation} />
      )}
    </div>
  );
}

/* ── Text Explanation Tab ── */
function TextExplanation({ explanation }) {
  return (
    <div className="space-y-5">
      {/* Summary */}
      {explanation?.summary && (
        <div>
          <h3 className="font-3 font-bold text-base mb-2 text-cyan-800">المعنى الإجمالي:</h3>
          <p className="font-2 text-sm leading-7 text-base-content/80">
            {explanation.summary}
          </p>
        </div>
      )}

      {/* Sections */}
      {explanation?.sections?.map((section, i) => (
        <div key={i}>
          <h3 className="font-3 font-bold text-base mb-2 text-cyan-800">{section.title}:</h3>
          {section.items ? (
            <ul className="font-2 text-sm leading-7 text-base-content/80 space-y-1 list-disc list-inside">
              {section.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="font-2 text-sm leading-7 text-base-content/80">
              {section.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Video Explanation Tab ── */
function VideoExplanation({ explanation }) {
  return (
    <div className="space-y-5">
      {/* Video thumbnail placeholder */}
      <div className="relative rounded-xl overflow-hidden bg-base-300 aspect-video flex items-center justify-center cursor-pointer group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <IoPlayCircleOutline className="text-5xl text-white drop-shadow-lg z-10 group-hover:scale-110 transition-transform" />
        <div className="absolute bottom-3 right-3 z-10">
          <p className="font-2 text-xs text-white/80">
            {explanation?.videoSpeaker}
          </p>
        </div>
      </div>

      {/* Video title */}
      <div>
        <h3 className="font-3 font-bold text-sm text-base-content">
          {explanation?.videoTitle}
        </h3>
        <p className="font-2 text-xs text-base-content/50 mt-1">
          {explanation?.videoSpeaker} - {explanation?.videoDuration}
        </p>
      </div>

      {/* Key points */}
      {explanation?.keyPoints && (
        <div className="bg-base-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineLocationMarker className="text-cyan-700" />
            <h4 className="font-3 font-bold text-sm text-base-content">النقاط الرئيسية</h4>
          </div>
          <ul className="font-2 text-sm text-base-content/70 space-y-2">
            {explanation.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cyan-700 mt-0.5">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
