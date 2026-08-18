import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoPlaySharp, IoPauseSharp, IoChevronUp, IoChevronDown } from "react-icons/io5";
import { RiForward10Line, RiReplay10Line } from "react-icons/ri";
import AudioSeekbar from "./player/AudioSeekbar";
import AudioSpeedMenu from "./player/AudioSpeedMenu";
import { AudioMuteButton, AudioLoopButton } from "./player/AudioControlButtons";

/**
 * MobileAudioPlayer — Clean modular mobile player (< lg).
 * Contains compact mini pill and expandable floating audio card without click bleed-through.
 */
export default function MobileAudioPlayer({
  isMobileListening,
  audioSrc,
  isPlaying,
  togglePlay,
  isMobileExpanded,
  setIsMobileExpanded,
  reader,
  currentTimeSec,
  durationSec,
  formatTime,
  progress,
  handleSeek,
  skipTime,
  playbackSpeed,
  setPlaybackSpeed,
  isLooping,
  setIsLooping,
  isMuted,
  setIsMuted
}) {
  return (
    <>
      {/* ── MOBILE MINI PILL (Visible on Mobile < lg ONLY when listening mode is active) ── */}
      {isMobileListening && (
        <div className="lg:hidden pointer-events-auto flex items-center justify-center gap-1.5 px-2 py-1
                        bg-base-100/95 dark:bg-slate-900/95 backdrop-blur-xl border border-cyan-700/25 
                        rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.18)] shrink-0">
          {/* Main Play / Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            disabled={!audioSrc}
            className={`btn btn-circle btn-sm shadow-md border-none flex items-center justify-center p-0 transition-transform active:scale-95 shrink-0 ${
              audioSrc
                ? "bg-cyan-700 hover:bg-cyan-800 text-white cursor-pointer"
                : "bg-base-300 text-base-content/40 cursor-not-allowed"
            }`}
            title={audioSrc ? (isPlaying ? "إيقاف مؤقت" : "تشغيل الصوت") : "الصوت غير متاح"}
            aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
          >
            {isPlaying ? (
              <IoPauseSharp className="text-base" />
            ) : (
              <IoPlaySharp className="text-base translate-x-[1px]" />
            )}
          </button>

          {/* Expand Up Chevron Button */}
          <button
            type="button"
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="btn btn-ghost btn-xs btn-circle text-cyan-700 dark:text-cyan-400 hover:bg-cyan-700/10 shrink-0"
            title={isMobileExpanded ? "إغلاق النافذة" : "فتح التحكم الكامل بالصوت"}
            aria-label={isMobileExpanded ? "إغلاق النافذة" : "فتح التحكم بالصوت"}
          >
            {isMobileExpanded ? (
              <IoChevronDown className="text-lg" />
            ) : (
              <IoChevronUp className="text-lg" />
            )}
          </button>
        </div>
      )}

      {/* ── MOBILE EXPANDED FLOATING AUDIO CARD (No Backdrop Blur & No Click Bleed) ── */}
      <AnimatePresence>
        {isMobileExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="lg:hidden pointer-events-auto fixed bottom-[122px] left-1/2 -translate-x-1/2 max-w-[245px] w-[85%] z-50 
                       bg-base-100/98 dark:bg-slate-900/98 backdrop-blur-xl border border-cyan-700/25 
                       rounded-xl shadow-[0_6px_24px_rgba(0,0,0,0.22)] px-1.5 py-1.5 flex flex-col gap-0.5"
            dir="rtl"
          >
            {/* Card Header: Close Down Arrow & Optional Reciter Name */}
            <div className="relative flex items-center justify-between border-b border-base-200 dark:border-slate-800 pb-0.5 px-1.5 min-h-[22px]">
              {reader ? (
                <p className="font-2 text-[10.5px] font-bold text-cyan-700 dark:text-cyan-400 truncate text-center flex-1">
                  {reader}
                </p>
              ) : (
                <div className="flex-1" />
              )}
              <button
                type="button"
                onClick={() => setIsMobileExpanded(false)}
                className="btn btn-ghost btn-circle btn-xs text-base-content/60 hover:text-cyan-700 shrink-0"
                title="إغلاق النافذة"
                aria-label="إغلاق النافذة"
              >
                <IoChevronDown className="text-base" />
              </button>
            </div>

            {/* Compact Slim RTL Seekbar */}
            <AudioSeekbar
              currentTimeSec={currentTimeSec}
              durationSec={durationSec}
              formatTime={formatTime}
              progress={progress}
              handleSeek={handleSeek}
              disabled={!audioSrc}
              isCompact={true}
            />

            {/* Playback Control Buttons Row */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 py-0.5">
              <AudioSpeedMenu
                playbackSpeed={playbackSpeed}
                setPlaybackSpeed={setPlaybackSpeed}
                isSimpleToggle={true}
              />

              <button
                type="button"
                onClick={() => skipTime(-10)}
                className="btn btn-ghost btn-circle btn-xs text-base-content/80 hover:text-cyan-700"
                title="تراجع 10 ثوانٍ"
                aria-label="تراجع 10 ثوانٍ"
              >
                <RiForward10Line className="text-lg" />
              </button>

              <button
                type="button"
                onClick={() => skipTime(10)}
                className="btn btn-ghost btn-circle btn-xs text-base-content/80 hover:text-cyan-700"
                title="تقديم 10 ثوانٍ"
                aria-label="تقديم 10 ثوانٍ"
              >
                <RiReplay10Line className="text-lg" />
              </button>

              <AudioLoopButton isLooping={isLooping} setIsLooping={setIsLooping} isCompact={true} />
              <AudioMuteButton isMuted={isMuted} setIsMuted={setIsMuted} isCompact={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
