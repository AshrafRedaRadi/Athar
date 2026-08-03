import React from "react";
import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";
import { RiForward10Line, RiReplay10Line } from "react-icons/ri";
import AudioSeekbar from "./player/AudioSeekbar";
import AudioSpeedMenu from "./player/AudioSpeedMenu";
import { AudioMuteButton, AudioLoopButton } from "./player/AudioControlButtons";

/**
 * DesktopAudioPlayer — Modular desktop inline player (< lg hidden, >= lg flex).
 */
export default function DesktopAudioPlayer({
  audioSrc,
  isPlaying,
  togglePlay,
  skipTime,
  currentTimeSec,
  durationSec,
  formatTime,
  progress,
  handleSeek,
  hadithLabel,
  reader,
  isMuted,
  setIsMuted,
  playbackSpeed,
  setPlaybackSpeed,
  showSpeedMenu,
  setShowSpeedMenu,
  isLooping,
  setIsLooping
}) {
  return (
    <div className="hidden lg:flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 sm:py-2
                    bg-base-100/95 dark:bg-slate-900/95 backdrop-blur-xl border border-cyan-700/20 
                    rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.18)]">
      {/* Right: Mute Button & Hadith Label / Reciter */}
      <div className="flex items-center gap-1 sm:gap-2.5 min-w-0 shrink-0">
        <AudioMuteButton isMuted={isMuted} setIsMuted={setIsMuted} disabled={!audioSrc} />

        <div className="flex min-w-0 flex-col justify-center max-w-[150px]">
          <p className="font-3 font-bold text-xs text-base-content leading-tight truncate">
            {hadithLabel || "الحديث الشريف"}
          </p>
          <p className="font-2 text-[10.5px] font-semibold text-cyan-700 dark:text-cyan-400 truncate mt-0.5">
            {reader}
          </p>
        </div>
      </div>

      {/* Center: Play Controls & RTL Seekbar */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        {/* Play Buttons Row */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => skipTime(-10)}
            disabled={!audioSrc}
            className="btn btn-ghost btn-xs btn-circle text-base-content/75 hover:text-cyan-700 disabled:opacity-30"
            title="تراجع 10 ثوانٍ"
            aria-label="تراجع 10 ثوانٍ"
          >
            <RiForward10Line className="text-lg" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            disabled={!audioSrc}
            className={`btn btn-circle btn-sm shadow-md border-none flex items-center justify-center p-0 transition-transform active:scale-95 ${
              audioSrc
                ? "bg-cyan-700 hover:bg-cyan-800 text-white cursor-pointer"
                : "bg-base-300 text-base-content/40 cursor-not-allowed"
            }`}
            title={audioSrc ? (isPlaying ? "إيقاف مؤقت" : "تشغيل الصوت") : "الصوت غير متاح"}
            aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
          >
            {isPlaying ? <IoPauseSharp className="text-base" /> : <IoPlaySharp className="text-base translate-x-[1px]" />}
          </button>

          <button
            type="button"
            onClick={() => skipTime(10)}
            disabled={!audioSrc}
            className="btn btn-ghost btn-xs btn-circle text-base-content/75 hover:text-cyan-700 disabled:opacity-30"
            title="تقديم 10 ثوانٍ"
            aria-label="تقديم 10 ثوانٍ"
          >
            <RiReplay10Line className="text-lg" />
          </button>
        </div>

        {/* RTL Seekbar */}
        <AudioSeekbar
          currentTimeSec={currentTimeSec}
          durationSec={durationSec}
          formatTime={formatTime}
          progress={progress}
          handleSeek={handleSeek}
          disabled={!audioSrc}
          isCompact={false}
        />
      </div>

      {/* Left: Speed Menu & Loop Controls */}
      <div className="flex items-center gap-0 sm:gap-1 shrink-0 relative">
        <AudioSpeedMenu
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
          showSpeedMenu={showSpeedMenu}
          setShowSpeedMenu={setShowSpeedMenu}
          disabled={!audioSrc}
        />
        <AudioLoopButton isLooping={isLooping} setIsLooping={setIsLooping} disabled={!audioSrc} />
      </div>
    </div>
  );
}
