import React, { useState, useEffect, useRef } from "react";
import { IoCloseOutline, IoBookOutline, IoPlayCircleOutline } from "react-icons/io5";
import { HiOutlineLocationMarker } from "react-icons/hi";

/**
 * Helper function to render Markdown text cleanly in Arabic UI.
 * Pre-processes all bracket types to «...» guillemets for consistency.
 */
function renderMarkdownText(text) {
  if (!text) return null;

  // ── Pre-processing: Normalize ALL bracket types to «...» ──
  text = text.replace(/\(([^)]+)\)/g, (match, inner) => {
    if (/[\u0621-\u064A]/.test(inner)) return `«${inner.trim()}»`;
    return match;
  });
  text = text.replace(/"([^"]+)"/g, (match, inner) => {
    if (/[\u0621-\u064A]/.test(inner)) return `«${inner.trim()}»`;
    return match;
  });
  text = text.replace(/\u201C([^\u201D]+)\u201D/g, (match, inner) => {
    if (/[\u0621-\u064A]/.test(inner)) return `«${inner.trim()}»`;
    return match;
  });

  const lines = text.split("\n");

  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    /**
     * Sequential parser for inline formatting.
     * Scans left-to-right finding ** (bold) and « » (quote) markers.
     */
    const formatInline = (str) => {
      if (!str) return str;

      const result = [];
      let i = 0;
      let buffer = "";
      let keyCounter = 0;

      const flushBuffer = () => {
        if (buffer) {
          result.push(buffer);
          buffer = "";
        }
      };

      while (i < str.length) {
        // Check for bold marker **
        if (str[i] === "*" && str[i + 1] === "*") {
          const endBold = str.indexOf("**", i + 2);
          if (endBold !== -1) {
            flushBuffer();
            const boldContent = str.slice(i + 2, endBold);
            result.push(
              <strong
                key={`b${keyCounter++}`}
                className="font-bold text-cyan-900 dark:text-cyan-200 font-3 text-[13px] sm:text-base inline"
              >
                {boldContent}
              </strong>
            );
            i = endBold + 2;
            continue;
          }
        }

        // Check for guillemet quote «
        if (str[i] === "«") {
          const endQuote = str.indexOf("»", i + 1);
          if (endQuote !== -1) {
            flushBuffer();
            const rawQuote = str.slice(i + 1, endQuote).trim();
            const quoteContent = rawQuote.replace(/\*\*/g, "");
            result.push(
              <span
                key={`q${keyCounter++}`}
                className="inline-flex items-center px-2 py-0.5 rounded-lg bg-cyan-700/15 dark:bg-cyan-900/40 text-cyan-900 dark:text-cyan-200 font-bold font-3 text-[13px] sm:text-base border border-cyan-700/25 shadow-xs mx-0.5 my-0.5 align-baseline"
              >
                «{quoteContent}»
              </span>
            );
            i = endQuote + 1;
            continue;
          }
        }

        buffer += str[i];
        i++;
      }

      flushBuffer();
      return result.length === 1 && typeof result[0] === "string" ? result[0] : result;
    };

    // ── Line-level rendering ──

    // Blockquote line (starting with >)
    if (trimmed.startsWith(">")) {
      const quoteContent = trimmed.replace(/^>\s*/, "");
      const cleanContent = quoteContent.replace(/^«/, "").replace(/»$/, "").replace(/\*\*/g, "").trim();
      return (
        <p key={idx} className="font-2 text-sm sm:text-base leading-relaxed text-base-content/90 my-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-cyan-700/15 dark:bg-cyan-900/40 text-cyan-900 dark:text-cyan-200 font-bold font-3 text-[13px] sm:text-base border border-cyan-700/25 shadow-xs mx-0.5 my-0.5 align-baseline">
            «{cleanContent}»
          </span>
        </p>
      );
    }

    // Header line (starting with #)
    if (trimmed.startsWith("#")) {
      const cleanHeader = trimmed.replace(/^#+\s*/, "");
      return (
        <h4
          key={idx}
          className="font-3 font-bold text-base sm:text-lg text-cyan-800 dark:text-cyan-300 mt-5 mb-2"
        >
          {cleanHeader}
        </h4>
      );
    }

    // Section title (whole line is **bold**)
    if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.slice(2, -2).includes("**")) {
      return (
        <h4
          key={idx}
          className="font-3 font-bold text-base sm:text-lg text-cyan-800 dark:text-cyan-300 mt-5 mb-2 border-r-2 border-cyan-700 pr-2"
        >
          {trimmed.slice(2, -2)}
        </h4>
      );
    }

    // List item
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const itemText = trimmed.replace(/^[\*\-\•]\s*/, "");
      return (
        <li
          key={idx}
          className="font-2 text-sm sm:text-base leading-relaxed text-base-content/90 ms-4 list-disc mb-1.5"
        >
          {formatInline(itemText)}
        </li>
      );
    }

    // Regular paragraph
    return (
      <p
        key={idx}
        className="font-2 text-sm sm:text-base leading-relaxed text-base-content/90 mb-2.5"
      >
        {formatInline(trimmed)}
      </p>
    );
  });
}

/**
 * ExplanationPanel — sliding drawer for Study mode with dual scholar text explanations.
 */
export default function ExplanationPanel({ isOpen, onClose, activeTab, onTabChange, explanation }) {
  const [sheetHeight, setSheetHeight] = useState(70); // Height in vh
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(70);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Reset expansion height when closed
  useEffect(() => {
    if (!isOpen) {
      setSheetHeight(70);
      setIsDragging(false);
    }
  }, [isOpen]);

  // ── Drag Handlers ──
  const handleDragStart = (clientY) => {
    setIsDragging(true);
    startY.current = clientY;
    startHeight.current = sheetHeight;
  };

  const handleDragMove = (clientY) => {
    if (!startY.current) return;
    const windowHeight = window.innerHeight || 800;
    const deltaPixels = startY.current - clientY; // Positive = Dragged UP, Negative = Dragged DOWN
    const deltaVh = (deltaPixels / windowHeight) * 100;
    let nextHeight = startHeight.current + deltaVh;

    // Clamp between 15vh and 94vh
    if (nextHeight < 15) nextHeight = 15;
    if (nextHeight > 94) nextHeight = 94;

    setSheetHeight(nextHeight);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    startY.current = 0;

    // Close panel if pulled down past the default level (< 62vh)
    if (sheetHeight < 62) {
      onClose();
      setTimeout(() => setSheetHeight(70), 300);
    }
  };

  // Touch Events
  const onTouchStart = (e) => {
    handleDragStart(e.touches[0].clientY);
  };

  const onTouchMove = (e) => {
    handleDragMove(e.touches[0].clientY);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse Events
  const onMouseDown = (e) => {
    handleDragStart(e.clientY);
    const onMouseMove = (moveEvt) => handleDragMove(moveEvt.clientY);
    const onMouseUp = () => {
      handleDragEnd();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <>
      {/* Backdrop Desktop */}
      <div
        className={`hidden lg:block fixed inset-0 bg-black/30 z-40
                    transition-opacity duration-500 ease-in-out
                    ${isOpen
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer Panel Desktop */}
      <div
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full w-[450px] xl:w-[500px] z-50
                    bg-base-100 border-e border-base-300 shadow-2xl
                    transition-transform duration-500 ease-in-out will-change-transform
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        dir="rtl"
      >
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

        <div className="flex-1 overflow-y-auto">
          <PanelContent
            activeTab={activeTab}
            onTabChange={onTabChange}
            explanation={explanation}
          />
        </div>
      </div>

      {/* Backdrop Mobile */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/40 z-50
                    transition-opacity duration-500 ease-in-out
                    ${isOpen
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Bottom Sheet Mobile */}
      <div
        style={{ height: `${sheetHeight}vh` }}
        className={`lg:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col
                    bg-base-100 rounded-t-2xl shadow-2xl
                    ${isDragging ? "transition-none" : "transition-all duration-300 ease-out"}
                    ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        dir="rtl"
      >
        {/* Interactive Drag Handle Area */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          className="w-full pt-3 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none bg-base-100 rounded-t-2xl hover:bg-base-200/50 transition-colors touch-none"
        >
          <div className="w-12 h-1.5 bg-base-300 dark:bg-base-700 rounded-full" />
        </div>

        {/* Header Bar */}
        <div className="shrink-0 flex items-center justify-between px-4 pb-3 pt-1 border-b border-base-300 bg-base-100">
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

        <div className="flex-1 overflow-y-auto">
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

function PanelContent({ activeTab, onTabChange, explanation }) {
  return (
    <div className="p-4">
      {/* Top Tabbar: Video vs Text Explanation */}
      <div className="flex gap-1 mb-4 border-b border-base-300" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "video"}
          onClick={() => onTabChange("video")}
          className={`flex-1 py-2 font-2 text-sm text-center transition-all duration-300 relative ${
            activeTab === "video"
              ? "text-cyan-700 font-bold"
              : "text-base-content/50 hover:text-base-content"
          }`}
        >
          الشرح المرئي
          {activeTab === "video" && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-700 rounded-full transition-all duration-300" />
          )}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "text"}
          onClick={() => onTabChange("text")}
          className={`flex-1 py-2 font-2 text-sm text-center transition-all duration-300 relative ${
            activeTab === "text"
              ? "text-cyan-700 font-bold"
              : "text-base-content/50 hover:text-base-content"
          }`}
        >
          الشرح النصي
          {activeTab === "text" && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-700 rounded-full transition-all duration-300" />
          )}
        </button>
      </div>

      {/* Grid Stack Ultra-Smooth Cross-Fade Transition */}
      <div className="grid grid-cols-1 grid-rows-1">
        <div
          className={`col-start-1 row-start-1 transition-all duration-300 ease-in-out ${
            activeTab === "text"
              ? "opacity-100 translate-y-0 pointer-events-auto z-10"
              : "opacity-0 translate-y-2 pointer-events-none z-0"
          }`}
        >
          <TextExplanation explanation={explanation} />
        </div>
        <div
          className={`col-start-1 row-start-1 transition-all duration-300 ease-in-out ${
            activeTab === "video"
              ? "opacity-100 translate-y-0 pointer-events-auto z-10"
              : "opacity-0 translate-y-2 pointer-events-none z-0"
          }`}
        >
          <VideoExplanation explanation={explanation} />
        </div>
      </div>
    </div>
  );
}

/**
 * TextExplanation Component with sub-tabs for Scholars:
 * 1. الشيخ صالح العصيمي
 * 2. الشيخ ابن عثيمين
 */
function TextExplanation({ explanation }) {
  const [scholarTab, setScholarTab] = useState("osaimi"); // "osaimi" | "othaymeen"

  // Process explanation data passed from API
  let rawOsaimiText = "";
  let rawOthaymeenText = "";

  if (Array.isArray(explanation)) {
    const osaimiItem = explanation.find(
      (item) => item.explanationBookId === 44 || (item.text && item.text.includes("العصيمي"))
    ) || explanation[0];
    
    if (osaimiItem) {
      rawOsaimiText = osaimiItem.text || "";
    }

    const othaymeenItem = explanation.find(
      (item) => item.explanationBookId === 45 || (item.text && item.text.includes("عثيمين"))
    );
    if (othaymeenItem) {
      rawOthaymeenText = othaymeenItem.text || "";
    }
  } else if (explanation && typeof explanation === "object") {
    if (explanation.text) {
      rawOsaimiText = explanation.text;
    } else {
      rawOsaimiText = explanation.osaimiText || explanation.osaimi?.summary || "";
      rawOthaymeenText = explanation.othaymeenText || explanation.othaymeen?.summary || "";
    }
  }

  return (
    <div className="space-y-3">
      {/* Pill Toggle for Scholar Selection */}
      <div className="flex bg-base-200/90 p-1 rounded-2xl gap-1 border border-base-300 shadow-inner">
        <button
          type="button"
          onClick={() => setScholarTab("osaimi")}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold font-2 transition-all duration-300 cursor-pointer text-center ${
            scholarTab === "osaimi"
              ? "bg-cyan-700 text-white shadow-md font-bold"
              : "text-base-content/70 hover:text-base-content"
          }`}
        >
          صالح العصيمي <span className="text-[10px] opacity-80 font-normal ms-0.5">(مختصر)</span>
        </button>

        <button
          type="button"
          onClick={() => setScholarTab("othaymeen")}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold font-2 transition-all duration-300 cursor-pointer text-center ${
            scholarTab === "othaymeen"
              ? "bg-cyan-700 text-white shadow-md font-bold"
              : "text-base-content/70 hover:text-base-content"
          }`}
        >
          ابن عثيمين <span className="text-[10px] opacity-80 font-normal ms-0.5">(مطول)</span>
        </button>
      </div>

      {/* Selected Scholar Title Header */}
      <div className="bg-cyan-700/10 border border-cyan-700/20 rounded-xl p-2.5 text-center transition-all duration-300">
        <span className="font-3 font-bold text-sm text-cyan-800 dark:text-cyan-300">
          شرح {scholarTab === "osaimi" ? "الشيخ صالح العصيمي" : "الشيخ ابن عثيمين"}
        </span>
      </div>

      {/* Grid Stack Ultra-Smooth Cross-Fade Transition for Scholar Content */}
      <div className="grid grid-cols-1 grid-rows-1">
        {/* Osaimi Content */}
        <div
          className={`col-start-1 row-start-1 transition-all duration-300 ease-in-out ${
            scholarTab === "osaimi"
              ? "opacity-100 translate-y-0 pointer-events-auto z-10"
              : "opacity-0 translate-y-2 pointer-events-none z-0"
          }`}
        >
          {rawOsaimiText ? (
            <div className="space-y-1.5 bg-base-100 p-1 rounded-xl">
              {renderMarkdownText(rawOsaimiText)}
            </div>
          ) : (
            <div className="p-5 text-center bg-base-200/50 rounded-2xl border border-dashed border-base-300 my-3">
              <p className="font-2 text-[13px] sm:text-base text-base-content/60 leading-relaxed">
                لا يوجد شرح متاح حالياً.
              </p>
            </div>
          )}
        </div>

        {/* Othaymeen Content */}
        <div
          className={`col-start-1 row-start-1 transition-all duration-300 ease-in-out ${
            scholarTab === "othaymeen"
              ? "opacity-100 translate-y-0 pointer-events-auto z-10"
              : "opacity-0 translate-y-2 pointer-events-none z-0"
          }`}
        >
          {rawOthaymeenText ? (
            <div className="space-y-1.5 bg-base-100 p-1 rounded-xl">
              {renderMarkdownText(rawOthaymeenText)}
            </div>
          ) : (
            <div className="p-5 text-center bg-base-200/50 rounded-2xl border border-dashed border-base-300 my-3">
              <p className="font-2 text-[13px] sm:text-base text-base-content/60 leading-relaxed">
                سيتم إضافة شرح فضيلة الشيخ محمد بن صالح العثيمين رحمه الله قريباً بمشيئة الله.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoExplanation({ explanation }) {
  const videoSpeaker = explanation?.videoSpeaker || "الشيخ د. صالح العصيمي";
  const videoTitle = explanation?.videoTitle || "شرح المعنى والفوائد الاستنباطية للحديث الشريف";
  const videoDuration = explanation?.videoDuration || "15:20 دقيقة";
  const videoUrl = explanation?.videoUrl;

  return (
    <div className="space-y-4">
      {videoUrl ? (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-md">
          <iframe
            src={videoUrl}
            title={videoTitle}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-base-300 aspect-video flex items-center justify-center cursor-pointer group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <IoPlayCircleOutline className="text-5xl text-white drop-shadow-lg z-10 group-hover:scale-110 transition-transform" />
          <div className="absolute bottom-3 right-3 z-10">
            <p className="font-2 text-xs text-white/80">
              {videoSpeaker}
            </p>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-3 font-bold text-sm sm:text-base text-base-content">
          {videoTitle}
        </h3>
        <p className="font-2 text-xs sm:text-sm text-base-content/50 mt-1">
          {videoSpeaker} - {videoDuration}
        </p>
      </div>

      {explanation?.keyPoints && (
        <div className="bg-base-200 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineLocationMarker className="text-cyan-700" />
            <h4 className="font-3 font-bold text-sm sm:text-base text-base-content">النقاط الرئيسية</h4>
          </div>
          <ul className="font-2 text-sm sm:text-base text-base-content/80 space-y-1.5">
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
