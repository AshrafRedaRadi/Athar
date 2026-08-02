import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import {
  IoCloseOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoTvOutline,
  IoExpandOutline,
} from "react-icons/io5";
import { HiOutlineLocationMarker, HiOutlineAcademicCap } from "react-icons/hi";

const SMOOTH_SPRING = {
  type: "spring",
  stiffness: 210,
  damping: 24,
  mass: 0.75,
};

/**
 * Helper to render Markdown text cleanly in Arabic UI.
 * Pre-processes bracket types to «...» guillemets for visual consistency.
 */
function renderMarkdownText(text) {
  if (!text) return null;

  // Pre-process brackets to Arabic guillemets «...»
  const normalized = text
    .replace(/\(([^)]+)\)/g, (match, inner) => (/[\u0621-\u064A]/.test(inner) ? `«${inner.trim()}»` : match))
    .replace(/"([^"]+)"/g, (match, inner) => (/[\u0621-\u064A]/.test(inner) ? `«${inner.trim()}»` : match))
    .replace(/\u201C([^\u201D]+)\u201D/g, (match, inner) => (/[\u0621-\u064A]/.test(inner) ? `«${inner.trim()}»` : match));

  const lines = normalized.split("\n");

  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

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
        if (str[i] === "*" && str[i + 1] === "*") {
          const endBold = str.indexOf("**", i + 2);
          if (endBold !== -1) {
            flushBuffer();
            result.push(
              <strong
                key={`b${keyCounter++}`}
                className="font-bold text-cyan-900 dark:text-cyan-200 font-3 text-[13px] sm:text-base inline"
              >
                {str.slice(i + 2, endBold)}
              </strong>
            );
            i = endBold + 2;
            continue;
          }
        }

        if (str[i] === "«") {
          const endQuote = str.indexOf("»", i + 1);
          if (endQuote !== -1) {
            flushBuffer();
            const rawQuote = str.slice(i + 1, endQuote).trim().replace(/\*\*/g, "");
            result.push(
              <span
                key={`q${keyCounter++}`}
                className="inline-flex items-center px-2 py-0.5 rounded-lg bg-cyan-700/15 dark:bg-cyan-900/40 text-cyan-900 dark:text-cyan-200 font-bold font-3 text-[13px] sm:text-base border border-cyan-700/25 shadow-xs mx-0.5 my-0.5 align-baseline"
              >
                «{rawQuote}»
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

    if (trimmed.startsWith(">")) {
      const cleanContent = trimmed.replace(/^>\s*/, "").replace(/^«/, "").replace(/»$/, "").replace(/\*\*/g, "").trim();
      return (
        <p key={idx} className="font-2 text-sm sm:text-base leading-relaxed text-base-content/90 my-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-cyan-700/15 dark:bg-cyan-900/40 text-cyan-900 dark:text-cyan-200 font-bold font-3 text-[13px] sm:text-base border border-cyan-700/25 shadow-xs mx-0.5 my-0.5 align-baseline">
            «{cleanContent}»
          </span>
        </p>
      );
    }

    if (trimmed.startsWith("#")) {
      return (
        <h4 key={idx} className="font-3 font-bold text-base sm:text-lg text-cyan-800 dark:text-cyan-300 mt-5 mb-2">
          {trimmed.replace(/^#+\s*/, "")}
        </h4>
      );
    }

    if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.slice(2, -2).includes("**")) {
      return (
        <h4 key={idx} className="font-3 font-bold text-base sm:text-lg text-cyan-800 dark:text-cyan-300 mt-5 mb-2 border-r-2 border-cyan-700 pr-2">
          {trimmed.slice(2, -2)}
        </h4>
      );
    }

    if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      return (
        <li key={idx} className="font-2 text-sm sm:text-base leading-relaxed text-base-content/90 ms-4 list-disc mb-1.5">
          {formatInline(trimmed.replace(/^[\*\-\•]\s*/, ""))}
        </li>
      );
    }

    return (
      <p key={idx} className="font-2 text-sm sm:text-base leading-relaxed text-base-content/90 mb-2.5">
        {formatInline(trimmed)}
      </p>
    );
  });
}

/**
 * Reusable Header for Drawer & Bottom Sheet
 */
function DrawerHeader({ onClose }) {
  return (
    <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-100">
      <div className="flex items-center gap-2">
        <IoBookOutline className="text-lg text-cyan-700" />
        <span className="font-3 font-bold text-base">شرح الحديث</span>
      </div>
      <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle" aria-label="إغلاق">
        <IoCloseOutline className="text-xl" />
      </button>
    </div>
  );
}

/**
 * Main ExplanationPanel component — handles responsive drawer (Desktop & Mobile bottom sheet).
 */
export default function ExplanationPanel({ isOpen, onClose, activeTab, onTabChange, explanation, hadith }) {
  const [sheetHeight, setSheetHeight] = useState(70);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(70);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Reset height when closed
  useEffect(() => {
    if (!isOpen) {
      setSheetHeight(70);
      setIsDragging(false);
    }
  }, [isOpen]);

  // ── Drag Logic ──
  const handleDragStart = (clientY) => {
    setIsDragging(true);
    startY.current = clientY;
    startHeight.current = sheetHeight;
  };

  const handleDragMove = (clientY) => {
    if (!startY.current) return;
    const windowHeight = window.innerHeight || 800;
    const deltaVh = ((startY.current - clientY) / windowHeight) * 100;
    let nextHeight = startHeight.current + deltaVh;
    if (nextHeight < 15) nextHeight = 15;
    if (nextHeight > 94) nextHeight = 94;
    setSheetHeight(nextHeight);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    startY.current = 0;
    if (sheetHeight < 62) {
      onClose();
      setTimeout(() => setSheetHeight(70), 300);
    }
  };

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
      {/* Desktop Backdrop & Drawer */}
      <div
        className={`hidden lg:block fixed inset-0 bg-black/30 z-40 transition-opacity duration-500 ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full w-[450px] xl:w-[500px] z-50 bg-base-100 border-e border-base-300 shadow-2xl transition-transform duration-500 ease-in-out will-change-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        dir="rtl"
      >
        <DrawerHeader onClose={onClose} />
        <div className="flex-1 overflow-y-auto">
          <PanelContent
            isOpen={isOpen}
            activeTab={activeTab}
            onTabChange={onTabChange}
            explanation={explanation}
            hadith={hadith}
          />
        </div>
      </div>

      {/* Mobile Backdrop & Bottom Sheet */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/40 z-50 transition-opacity duration-500 ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        style={{ height: `${sheetHeight}vh` }}
        className={`lg:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col bg-base-100 rounded-t-2xl shadow-2xl ${
          isDragging ? "transition-none" : "transition-all duration-300 ease-out"
        } ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        dir="rtl"
      >
        {/* Drag Handle Area */}
        <div
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
          onMouseDown={onMouseDown}
          className="w-full pt-3 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none bg-base-100 rounded-t-2xl hover:bg-base-200/50 transition-colors touch-none"
        >
          <div className="w-12 h-1.5 bg-base-300 dark:bg-base-700 rounded-full" />
        </div>

        <DrawerHeader onClose={onClose} />

        <div className="flex-1 overflow-y-auto">
          <PanelContent
            isOpen={isOpen}
            activeTab={activeTab}
            onTabChange={onTabChange}
            explanation={explanation}
            hadith={hadith}
          />
        </div>
      </div>
    </>
  );
}

/**
 * Inner Panel Content containing Video vs Text Explanation tabs
 */
function PanelContent({ isOpen, activeTab, onTabChange, explanation, hadith }) {
  return (
    <div className="p-4">
      {/* Top Tabbar */}
      <div className="flex gap-1 mb-4 border-b border-base-300" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "video"}
          onClick={() => onTabChange("video")}
          className={`flex-1 py-2 font-2 text-sm text-center transition-all duration-300 relative ${
            activeTab === "video" ? "text-cyan-700 font-bold" : "text-base-content/50 hover:text-base-content"
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
            activeTab === "text" ? "text-cyan-700 font-bold" : "text-base-content/50 hover:text-base-content"
          }`}
        >
          الشرح النصي
          {activeTab === "text" && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-700 rounded-full transition-all duration-300" />
          )}
        </button>
      </div>

      {/* Cross-Fade Tab Transition */}
      <div className="grid grid-cols-1 grid-rows-1">
        <div
          className={`col-start-1 row-start-1 transition-all duration-300 ease-in-out ${
            activeTab === "text" ? "opacity-100 translate-y-0 pointer-events-auto z-10" : "opacity-0 translate-y-2 pointer-events-none z-0"
          }`}
        >
          <TextExplanation explanation={explanation} />
        </div>
        <div
          className={`col-start-1 row-start-1 transition-all duration-300 ease-in-out ${
            activeTab === "video" ? "opacity-100 translate-y-0 pointer-events-auto z-10" : "opacity-0 translate-y-2 pointer-events-none z-0"
          }`}
        >
          <VideoExplanation explanation={explanation} hadith={hadith} isOpen={isOpen} activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}

/**
 * TextExplanation Component for dual scholars (Osaimi vs Othaymeen)
 */
function TextExplanation({ explanation }) {
  const [scholarTab, setScholarTab] = useState("osaimi");

  let rawOsaimiText = "";
  let rawOthaymeenText = "";

  if (Array.isArray(explanation)) {
    const osaimiItem =
      explanation.find((item) => item.explanationBookId === 44 || (item.text && item.text.includes("العصيمي"))) ||
      explanation[0];
    if (osaimiItem) rawOsaimiText = osaimiItem.text || "";

    const othaymeenItem = explanation.find(
      (item) => item.explanationBookId === 45 || (item.text && item.text.includes("عثيمين"))
    );
    if (othaymeenItem) rawOthaymeenText = othaymeenItem.text || "";
  } else if (explanation && typeof explanation === "object") {
    if (explanation.text) {
      rawOsaimiText = explanation.text;
    } else {
      rawOsaimiText = explanation.osaimiText || explanation.osaimi?.summary || "";
      rawOthaymeenText = explanation.othaymeenText || explanation.othaymeen?.summary || "";
    }
  }

  const SCHOLARS = [
    { key: "osaimi", name: "صالح العصيمي", type: "(مختصر)" },
    { key: "othaymeen", name: "ابن عثيمين", type: "(مطول)" },
  ];

  return (
    <div className="space-y-3">
      {/* Scholar Selection Toggle */}
      <div className="flex bg-base-200/90 p-1 rounded-2xl gap-1 border border-base-300 shadow-inner">
        {SCHOLARS.map(({ key, name, type }) => (
          <button
            key={key}
            type="button"
            onClick={() => setScholarTab(key)}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold font-2 transition-all duration-300 cursor-pointer text-center ${
              scholarTab === key ? "bg-cyan-700 text-white shadow-md font-bold" : "text-base-content/70 hover:text-base-content"
            }`}
          >
            {name} <span className="text-[10px] opacity-80 font-normal ms-0.5">{type}</span>
          </button>
        ))}
      </div>

      {/* Selected Scholar Header */}
      <div className="bg-cyan-700/10 border border-cyan-700/20 rounded-xl p-2.5 text-center transition-all duration-300">
        <span className="font-3 font-bold text-sm text-cyan-800 dark:text-cyan-300">
          شرح {scholarTab === "osaimi" ? "الشيخ صالح العصيمي" : "الشيخ ابن عثيمين"}
        </span>
      </div>

      {/* Scholar Text Content */}
      <div className="grid grid-cols-1 grid-rows-1">
        <div
          className={`col-start-1 row-start-1 transition-all duration-300 ease-in-out ${
            scholarTab === "osaimi" ? "opacity-100 translate-y-0 pointer-events-auto z-10" : "opacity-0 translate-y-2 pointer-events-none z-0"
          }`}
        >
          <ScholarTextContent
            text={rawOsaimiText}
            emptyMsg="لا يوجد شرح متاح حالياً."
          />
        </div>

        <div
          className={`col-start-1 row-start-1 transition-all duration-300 ease-in-out ${
            scholarTab === "othaymeen" ? "opacity-100 translate-y-0 pointer-events-auto z-10" : "opacity-0 translate-y-2 pointer-events-none z-0"
          }`}
        >
          <ScholarTextContent
            text={rawOthaymeenText}
            emptyMsg="سيتم إضافة شرح فضيلة الشيخ محمد بن صالح العثيمين رحمه الله قريباً بمشيئة الله."
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Sub-component for rendering scholar text or empty state fallback
 */
function ScholarTextContent({ text, emptyMsg }) {
  if (text) {
    return <div className="space-y-1.5 bg-base-100 p-1 rounded-xl">{renderMarkdownText(text)}</div>;
  }

  return (
    <div className="p-5 text-center bg-base-200/50 rounded-2xl border border-dashed border-base-300 my-3">
      <p className="font-2 text-[13px] sm:text-base text-base-content/60 leading-relaxed">{emptyMsg}</p>
    </div>
  );
}

/**
 * VideoExplanation Component — handles YouTube IFrame API, dynamic duration, timestamp preservation, and Portal modal popup.
 */
function VideoExplanation({ explanation, hadith, isOpen, activeTab }) {
  const youtubeId = hadith?.videoExplanation?.trim();
  const [durationStr, setDurationStr] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartTime, setModalStartTime] = useState(0);
  
  const playerRef = useRef(null);
  const containerIdRef = useRef(`yt-player-${Math.random().toString(36).substring(2, 9)}`);
  
  const modalPlayerRef = useRef(null);
  const modalContainerIdRef = useRef(`yt-modal-player-${Math.random().toString(36).substring(2, 9)}`);

  const currentHadithIdRef = useRef(hadith?.id);

  const videoSpeaker = "الشيخ د. عثمان الخميس";
  const videoTitle = hadith?.title || "شرح الحديث الشريف";
  const isVideoActive = isOpen && activeTab === "video";

  const handleOpenModal = () => {
    let currentTime = 0;
    if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
      try {
        currentTime = playerRef.current.getCurrentTime() || 0;
        playerRef.current.pauseVideo();
      } catch (e) {}
    }
    setModalStartTime(Math.floor(currentTime));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (modalPlayerRef.current && typeof modalPlayerRef.current.getCurrentTime === "function") {
      try {
        const modalTime = modalPlayerRef.current.getCurrentTime() || 0;
        if (playerRef.current && typeof playerRef.current.seekTo === "function") {
          playerRef.current.seekTo(modalTime, true);
          playerRef.current.pauseVideo();
        }
      } catch (e) {}
    }
    setIsModalOpen(false);
  };

  const updateDuration = (player) => {
    if (!player || typeof player.getDuration !== "function") return;
    const durSec = player.getDuration();
    if (durSec && durSec > 0) {
      const mins = Math.floor(durSec / 60);
      const secs = Math.floor(durSec % 60);
      setDurationStr(`${mins}:${secs < 10 ? `0${secs}` : secs} دقيقة`);
    }
  };

  // ── Initialize Main Drawer Player ──
  useEffect(() => {
    if (!youtubeId) {
      setDurationStr("");
      return;
    }

    let isMounted = true;

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    const createOrUpdatePlayer = () => {
      if (!isMounted || !document.getElementById(containerIdRef.current)) return;

      if (playerRef.current && typeof playerRef.current.cueVideoById === "function") {
        if (currentHadithIdRef.current !== hadith?.id) {
          currentHadithIdRef.current = hadith?.id;
          setDurationStr("");
          playerRef.current.cueVideoById(youtubeId);
        }
        return;
      }

      playerRef.current = new window.YT.Player(containerIdRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event) => {
            currentHadithIdRef.current = hadith?.id;
            updateDuration(event.target);
          },
          onStateChange: (event) => {
            updateDuration(event.target);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createOrUpdatePlayer();
    } else {
      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(interval);
          createOrUpdatePlayer();
        }
      }, 200);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [youtubeId, hadith?.id]);

  // ── Initialize Modal Player with Exact Start Time ──
  useEffect(() => {
    if (!isModalOpen || !youtubeId) return;

    let isMounted = true;

    const initModalPlayer = () => {
      if (!isMounted || !document.getElementById(modalContainerIdRef.current)) return;

      modalPlayerRef.current = new window.YT.Player(modalContainerIdRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          start: modalStartTime,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          fs: 0,
          iv_load_policy: 3,
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initModalPlayer();
    } else {
      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(interval);
          initModalPlayer();
        }
      }, 150);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [isModalOpen, youtubeId, modalStartTime]);

  // Pause video when panel is closed or active tab is changed
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
      if (!isVideoActive) {
        playerRef.current.pauseVideo();
      }
    }
  }, [isVideoActive]);

  return (
    <div className="space-y-4">
      {youtubeId ? (
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video shadow-xl border border-cyan-700/20 ring-1 ring-cyan-700/10 transition-all duration-300 group">
          <div id={containerIdRef.current} className="w-full h-full border-0" />
          
          <button
            type="button"
            onClick={handleOpenModal}
            className="absolute top-2.5 left-2.5 z-20 btn btn-xs sm:btn-sm btn-circle bg-slate-900/80 hover:bg-cyan-700 text-white border-white/20 backdrop-blur-md shadow-md transition-all duration-200"
            title="تكبير الشرح المرئي في نافذة منبثقة"
          >
            <IoExpandOutline className="text-sm sm:text-base" />
          </button>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-base-200/80 to-base-300/40 border border-dashed border-base-300 aspect-video flex flex-col items-center justify-center p-6 text-center space-y-3 shadow-inner">
          <div className="w-14 h-14 rounded-2xl bg-cyan-700/10 text-cyan-700 flex items-center justify-center border border-cyan-700/20 shadow-sm">
            <IoPlayCircleOutline className="text-4xl" />
          </div>
          <div>
            <p className="font-3 font-bold text-sm sm:text-base text-base-content">
              لا يوجد شرح مرئي متاح لهذا الحديث حالياً
            </p>
            <p className="font-2 text-xs text-base-content/50 mt-1">
              سيتم إضافة المرئيات قريباً بمشيئة الله
            </p>
          </div>
        </div>
      )}

      {/* Large Floating Video Modal (Rendered via Portal into document.body) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isModalOpen && youtubeId && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6" dir="rtl">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  onClick={handleCloseModal}
                  className="fixed inset-0 bg-black/75 backdrop-blur-md z-40 cursor-pointer"
                />

                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 10 }}
                  transition={SMOOTH_SPRING}
                  className="relative card bg-base-100 border border-base-200/80 shadow-2xl w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl overflow-hidden rounded-3xl z-50 flex flex-col origin-center"
                >
                  <div className="p-4 sm:p-5 flex items-center justify-between border-b border-base-200 bg-base-100 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-cyan-700/10 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-700/20 shadow-sm">
                        <HiOutlineAcademicCap className="text-xl" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-3 font-bold text-sm sm:text-base lg:text-lg text-base-content truncate">
                          {videoTitle}
                        </h3>
                        <p className="font-2 text-xs text-base-content/60 truncate">
                          {videoSpeaker} {durationStr ? `• ${durationStr}` : ""}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleCloseModal}
                      className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 text-base-content border-none shrink-0 shadow-sm transition-colors"
                      aria-label="إغلاق"
                    >
                      <FiX className="text-lg" />
                    </button>
                  </div>

                  <div className="relative aspect-video w-full bg-slate-950">
                    <div id={modalContainerIdRef.current} className="w-full h-full border-0" />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Video Details Card */}
      <div className="p-4 rounded-2xl bg-base-200/60 border border-base-300/80 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-700/10 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-700/20 shadow-sm">
            <HiOutlineAcademicCap className="text-xl" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block text-[11px] font-bold text-cyan-700 bg-cyan-700/10 px-2 py-0.5 rounded-md mb-0.5 border border-cyan-700/15">
              مُحاضر الشرح
            </span>
            <h4 className="font-3 font-bold text-sm sm:text-base text-base-content truncate">
              {videoSpeaker} {durationStr ? `• ${durationStr}` : ""}
            </h4>
          </div>
        </div>

        <div className="pt-2.5 border-t border-base-300/60 flex items-start gap-2.5">
          <IoTvOutline className="text-cyan-700 mt-0.5 text-base shrink-0" />
          <p className="font-2 text-xs sm:text-sm text-base-content/80 leading-relaxed font-semibold">
            {videoTitle}
          </p>
        </div>
      </div>

      {/* Key Points */}
      {explanation?.keyPoints && (
        <div className="bg-base-200 rounded-xl p-3.5 border border-base-300/60">
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
