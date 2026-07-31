import { useState, useRef, useEffect } from "react";
import { BsMicFill, BsStopFill } from "react-icons/bs";
import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";
import { HiOutlineSpeakerWave } from "react-icons/hi2";

/**
 * RecordButton — glowing gradient action button.
 * - On Mobile (< lg): Long-press menu provides "استمع" (Listen) and "تلاوة" (Recite).
 *   - Selecting "استمع" turns button icon to Play (IoPlaySharp ▶).
 *   - Playing audio turns button icon to Pause (IoPauseSharp ||).
 *   - Reciting turns button icon to Stop square (BsStopFill ⏹).
 *   - Stopping resets button icon back to Mic (BsMicFill 🎙️).
 * - On Desktop (lg+): Direct toggle for recitation.
 */
export default function RecordButton({ 
  isRecording = false, 
  onToggle,
  onListen,
  onRecite 
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [isListenReady, setIsListenReady] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const timerRef = useRef(null);
  const isLongPress = useRef(false);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startPressTimer = () => {
    // Enable long press menu ONLY on mobile/small screens (< 1024px)
    if (window.innerWidth >= 1024) return;

    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      setShowOptions(true);
    }, 500); // 500ms long press threshold
  };

  const cancelPressTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e) => {
    if (isLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
      isLongPress.current = false;
      return;
    }

    // If currently reciting -> stop recitation and reset to mic
    if (isRecording) {
      if (onToggle) onToggle();
      return;
    }

    // If currently playing audio -> pause audio playback (turn into Play ready ▶)
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      setIsListenReady(true);
      return;
    }

    // Listening mode ready (Play ▶) -> user clicks Play to start playback (turns into Pause ||)
    if (isListenReady) {
      setIsPlayingAudio(true);
      if (onListen) onListen();
      return;
    }

    // Default mode -> toggle recitation
    if (onToggle) onToggle();
  };

  const handleSelectOption = (option) => {
    setShowOptions(false);
    if (option === "listen") {
      setIsListenReady(true);
      setIsPlayingAudio(false);
    } else if (option === "recite") {
      setIsListenReady(false);
      setIsPlayingAudio(false);
      if (onRecite) onRecite();
      else if (onToggle) onToggle();
    }
  };

  return (
    <>
      {/* Overlay to dismiss options menu when clicking outside */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setShowOptions(false)}
        />
      )}

      {/* Position container:
          - Mobile (< lg): bottom-20 right-6 (just above mobile Dock)
          - Desktop (lg+): next to AudioPlayer (bottom-1.5, offset from center)
      */}
      <div 
        className="fixed z-45 transition-all duration-300
                   bottom-20 right-6
                   lg:bottom-1.5 lg:left-[calc(50%+265px)] lg:right-auto lg:translate-x-0"
        dir="rtl"
      >
        {/* Options Popup Menu (on long press — Mobile ONLY) */}
        {showOptions && (
          <div 
            className="lg:hidden absolute bottom-20 right-0 z-50
                       bg-base-100 border border-base-300 shadow-xl rounded-2xl p-2
                       flex flex-col gap-1 w-36 animate-slideUp"
          >
            <p className="text-[11px] font-2 text-center text-base-content/50 border-b border-base-200 pb-1 mb-1">
              اختر نوع الإجراء
            </p>
            <button
              onClick={() => handleSelectOption("listen")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-2
                         hover:bg-cyan-50 dark:hover:bg-cyan-950 text-cyan-700 dark:text-cyan-400
                         transition-colors"
            >
              <HiOutlineSpeakerWave className="text-base" />
              <span>استمع</span>
            </button>
            <button
              onClick={() => handleSelectOption("recite")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-2
                         hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400
                         transition-colors"
            >
              <BsMicFill className="text-base" />
              <span>تلاوة (تسميع)</span>
            </button>
          </div>
        )}

        {/* Glowing Gradient Action Button */}
        <button
          onClick={handleClick}
          onMouseDown={startPressTimer}
          onMouseUp={cancelPressTimer}
          onMouseLeave={cancelPressTimer}
          onTouchStart={startPressTimer}
          onTouchEnd={cancelPressTimer}
          className={`
            btn btn-circle w-16 h-16 lg:w-14 lg:h-14 min-h-0 border-none text-white flex items-center justify-center
            transition-all duration-300 transform hover:scale-105 active:scale-95
            ${isRecording
              ? "bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 shadow-[0_0_30px_rgba(239,68,68,0.7)] animate-pulse"
              : "bg-gradient-to-tr from-cyan-600 via-cyan-400 to-sky-300 shadow-[0_0_28px_rgba(6,182,212,0.65)] hover:shadow-[0_0_36px_rgba(6,182,212,0.85)]"}
          `}
          aria-label={isRecording ? "إيقاف التسميع" : isPlayingAudio ? "إيقاف مؤقت" : isListenReady ? "تشغيل الصوت" : "بدء التسميع"}
          title={isRecording ? "إيقاف التسميع" : isPlayingAudio ? "إيقاف مؤقت" : isListenReady ? "تشغيل الصوت" : "بدء التسميع"}
        >
          {isRecording ? (
            <BsStopFill className="text-3xl lg:text-2xl" />
          ) : isPlayingAudio ? (
            <IoPauseSharp className="text-3xl lg:text-2xl" />
          ) : isListenReady ? (
            <IoPlaySharp className="text-3xl lg:text-2xl translate-x-[3px]" />
          ) : (
            <BsMicFill className="text-3xl lg:text-2xl" />
          )}
        </button>
      </div>
    </>
  );
}
