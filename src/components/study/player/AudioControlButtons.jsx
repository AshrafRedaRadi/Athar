import React from "react";
import { IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5";
import { RiForward10Line, RiReplay10Line } from "react-icons/ri";
import { TbRepeat } from "react-icons/tb";

/**
 * AudioMuteButton — Reusable Speaker / Mute toggle button.
 */
export function AudioMuteButton({ isMuted, setIsMuted, disabled = false, isCompact = false }) {
  return (
    <button
      type="button"
      onClick={() => setIsMuted(!isMuted)}
      disabled={disabled}
      className={`transition-all duration-200 shadow-xs active:scale-95 ${
        isCompact
          ? `btn btn-ghost btn-circle btn-xs ${isMuted ? "text-red-500 bg-red-500/10" : "text-base-content/70"}`
          : `w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl flex items-center justify-center shrink-0 border ${
              isMuted
                ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                : "bg-cyan-700/10 border-cyan-700/20 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-700/20"
            }`
      }`}
      title={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
      aria-label={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
    >
      {isMuted ? (
        <IoVolumeMuteOutline className={isCompact ? "text-lg text-red-500" : "text-base sm:text-lg"} />
      ) : (
        <IoVolumeHighOutline className={isCompact ? "text-lg" : "text-base sm:text-lg"} />
      )}
    </button>
  );
}

/**
 * AudioLoopButton — Reusable Loop toggle button.
 */
export function AudioLoopButton({ isLooping, setIsLooping, disabled = false, isCompact = false }) {
  return (
    <button
      type="button"
      onClick={() => setIsLooping(!isLooping)}
      disabled={disabled}
      className={`btn btn-ghost btn-circle transition-colors ${
        isCompact ? "btn-xs" : "btn-xs"
      } ${isLooping ? "text-cyan-700 bg-cyan-700/10" : "text-base-content/70 hover:text-cyan-700"}`}
      title={isLooping ? "إلغاء التكرار" : "تكرار الصوت"}
      aria-label="تكرار"
    >
      <TbRepeat className={isCompact ? "text-lg" : "text-lg sm:text-xl"} />
    </button>
  );
}

/**
 * AudioSkipButtons — Reusable Rewind 10s & Forward 10s skip buttons.
 */
export function AudioSkipButtons({ skipTime, disabled = false, isCompact = false }) {
  return (
    <>
      {/* Rewind 10s (Right) */}
      <button
        type="button"
        onClick={() => skipTime(-10)}
        disabled={disabled}
        className={`btn btn-ghost btn-circle text-base-content/75 hover:text-cyan-700 disabled:opacity-30 ${
          isCompact ? "btn-xs" : "btn-xs"
        }`}
        title="تراجع 10 ثوانٍ"
        aria-label="تراجع 10 ثوانٍ"
      >
        <RiForward10Line className={isCompact ? "text-lg" : "text-lg"} />
      </button>

      {/* Forward 10s (Left) */}
      <button
        type="button"
        onClick={() => skipTime(10)}
        disabled={disabled}
        className={`btn btn-ghost btn-circle text-base-content/75 hover:text-cyan-700 disabled:opacity-30 ${
          isCompact ? "btn-xs" : "btn-xs"
        }`}
        title="تقديم 10 ثوانٍ"
        aria-label="تقديم 10 ثوانٍ"
      >
        <RiReplay10Line className={isCompact ? "text-lg" : "text-lg"} />
      </button>
    </>
  );
}
