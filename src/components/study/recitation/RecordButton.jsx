import React, { useState, useRef, useEffect } from "react";
import { BsMicFill, BsStopFill } from "react-icons/bs";
import { IoPlaySharp, IoPauseSharp, IoClose } from "react-icons/io5";
import { HiOutlineSpeakerWave } from "react-icons/hi2";

/**
 * RecordButton — glowing gradient action button for Study mode.
 */
export default function RecordButton({
  isRecording = false,
  isConnecting = false,
  onToggle,
  onListen,
  onRecite,
  isListenModeActive = false,
  isAudioPlaying = false,
  onAudioToggle
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [isListenReady, setIsListenReady] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const timerRef = useRef(null);
  const isLongPress = useRef(false);
  const touchStartedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startPressTimer = (e) => {
    if (window.innerWidth >= 1024) return;

    // Prevent double execution from touchstart + synthetic mousedown
    if (e?.type === "touchstart") {
      touchStartedRef.current = true;
    } else if (e?.type === "mousedown" && touchStartedRef.current) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      setShowOptions(true);
      timerRef.current = null;
    }, 650); // 650ms intentional long press
  };

  const cancelPressTimer = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (e?.type === "touchend" || e?.type === "touchcancel") {
      setTimeout(() => {
        touchStartedRef.current = false;
      }, 400);
    }
  };

  const handleClick = (e) => {
    if (isConnecting) return;

    // If options popup is currently open, clicking the button closes it
    if (showOptions) {
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      setShowOptions(false);
      isLongPress.current = false;
      return;
    }

    // If long press triggered the options menu, don't execute regular click action
    if (isLongPress.current) {
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      isLongPress.current = false;
      return;
    }

    if (isRecording) {
      if (onToggle) onToggle();
      return;
    }

    // On mobile (< 1024px), if in listening mode, toggle audio playback
    if (window.innerWidth < 1024 && (isListenModeActive || isListenReady)) {
      if (onAudioToggle) {
        onAudioToggle();
      } else if (onListen) {
        onListen();
      }
      return;
    }

    // On Desktop or default mode, act as Mic recitation toggle
    if (onToggle) onToggle();
  };

  const handleSelectOption = (option) => {
    setShowOptions(false);
    if (option === "listen") {
      setIsListenReady(true);
      setIsPlayingAudio(false);
      if (onListen) onListen();
    } else if (option === "recite") {
      setIsListenReady(false);
      setIsPlayingAudio(false);
      if (onRecite) onRecite();
      else if (onToggle) onToggle();
    }
  };

  return (
    <>
      {/* Full Page Overlay (covers everything including the button and bottom navigation) */}
      {showOptions && (
        <div
          className="fixed inset-0 z-60 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn lg:hidden"
          onClick={() => setShowOptions(false)}
        />
      )}

      {/* Options Popup Card (Floating ABOVE the overlay at z-70) */}
      {showOptions && (
        <div
          className="lg:hidden fixed bottom-[150px] right-2 z-70
                     bg-base-100 dark:bg-slate-900 border border-base-300 dark:border-slate-700 shadow-2xl rounded-2xl p-2.5
                     flex flex-col gap-1.5 w-40 animate-slideUp"
          dir="rtl"
        >
          <p className="text-[11px] font-2 text-center text-base-content/60 border-b border-base-200 dark:border-slate-800 pb-1.5 mb-0.5 font-medium">
            اختر نوع الإجراء
          </p>
          <button
            onClick={() => handleSelectOption("listen")}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-2
                       hover:bg-cyan-50 dark:hover:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400
                       active:scale-95 transition-all cursor-pointer font-medium"
          >
            <HiOutlineSpeakerWave className="text-base" />
            <span>استمع</span>
          </button>
          <button
            onClick={() => handleSelectOption("recite")}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-2
                       hover:bg-red-50 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400
                       active:scale-95 transition-all cursor-pointer font-medium"
          >
            <BsMicFill className="text-base" />
            <span>تلاوة (تسميع)</span>
          </button>
        </div>
      )}

      {/* Floating Action Button (preserves its blue/cyan gradient under the overlay) */}
      <div
        className="fixed z-45 transition-all duration-300
                   bottom-[72px] right-2
                   lg:bottom-3 lg:left-[calc(50%+323px)] lg:right-auto lg:translate-x-0"
        dir="rtl"
      >
        <button
          onClick={handleClick}
          disabled={isConnecting}
          onMouseDown={startPressTimer}
          onMouseUp={cancelPressTimer}
          onMouseLeave={cancelPressTimer}
          onTouchStart={startPressTimer}
          onTouchEnd={cancelPressTimer}
          onTouchMove={cancelPressTimer}
          onTouchCancel={cancelPressTimer}
          onContextMenu={(e) => {
            if (window.innerWidth < 1024) e.preventDefault();
          }}
          className={`
            btn btn-circle w-16 h-16 lg:w-16 lg:h-16 min-h-0 border-none text-white flex items-center justify-center
            transition-all duration-300 transform hover:scale-105 active:scale-95
            ${isConnecting
              ? "bg-cyan-700 opacity-90 shadow-md cursor-wait animate-pulse"
              : isRecording
                ? "bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 shadow-[0_0_30px_rgba(239,68,68,0.7)] animate-pulse"
                : "bg-gradient-to-tr from-cyan-600 via-cyan-400 to-sky-300 shadow-[0_0_28px_rgba(6,182,212,0.65)] hover:shadow-[0_0_36px_rgba(6,182,212,0.85)]"}
          `}
          aria-label={isConnecting ? "جاري الاتصال..." : showOptions ? "إغلاق الخيارات" : isRecording ? "إيقاف التسميع" : "بدء التسميع"}
          title={isConnecting ? "جاري الاتصال..." : showOptions ? "إغلاق الخيارات" : isRecording ? "إيقاف التسميع" : "بدء التسميع"}
        >
          {isConnecting ? (
            <span className="loading loading-spinner loading-md text-white"></span>
          ) : showOptions ? (
            <IoClose className="text-3xl text-white transition-transform duration-300" />
          ) : isRecording ? (
            <BsStopFill className="text-3xl lg:text-3xl" />
          ) : (
            <>
              {/* Mobile (< lg): show Play/Pause icon if listening mode active */}
              {(isAudioPlaying || isPlayingAudio) ? (
                <IoPauseSharp className="text-3xl lg:hidden" />
              ) : (isListenModeActive || isListenReady) ? (
                <IoPlaySharp className="text-3xl translate-x-[3px] lg:hidden" />
              ) : (
                <BsMicFill className="text-3xl lg:hidden" />
              )}

              {/* Desktop (>= lg): ALWAYS show Mic icon */}
              <BsMicFill className="text-3xl hidden lg:block" />
            </>
          )}
        </button>
      </div>
    </>
  );
}
