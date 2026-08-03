import React from "react";

/**
 * AudioSeekbar — Reusable RTL Seekbar component with customizable compact vs standard sizing.
 */
export default function AudioSeekbar({
  currentTimeSec,
  durationSec,
  formatTime,
  progress,
  handleSeek,
  disabled = false,
  isCompact = false
}) {
  return (
    <div
      className={`flex items-center ${isCompact ? "gap-1.5 w-[82%] max-w-[220px] mx-auto px-0.5" : "gap-2 w-full px-1"}`}
      dir="rtl"
    >
      {/* Right Side: Current Elapsed Time */}
      <span
        className={`font-2 text-base-content/70 text-right font-medium select-none ${
          isCompact ? "text-[9px] min-w-[26px]" : "text-[10px] text-base-content/60 min-w-[32px]"
        }`}
      >
        {formatTime(currentTimeSec)}
      </span>

      {/* Custom RTL Seekbar Track */}
      <div
        className={`relative flex-1 flex items-center group cursor-pointer ${isCompact ? "h-3" : "h-4"}`}
        dir="rtl"
      >
        {/* Track background */}
        <div
          className={`w-full bg-base-300 dark:bg-slate-700/60 rounded-full overflow-hidden relative ${
            isCompact ? "h-1" : "h-1.5"
          }`}
        >
          {/* Progress fill from Right to Left */}
          <div
            className="h-full bg-gradient-to-l from-cyan-700 via-cyan-600 to-cyan-500 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Glowing Thumb Handle Circle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 bg-cyan-700 rounded-full shadow-md pointer-events-none ${
            isCompact
              ? "w-3 h-3 ring-1.5 ring-white dark:ring-slate-900"
              : "w-3.5 h-3.5 ring-2 ring-white dark:ring-slate-900 transition-transform duration-100 group-hover:scale-125"
          }`}
          style={{ right: `calc(${progress}% - ${isCompact ? 6 : 7}px)` }}
        />

        {/* Native range input overlay */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSeek}
          disabled={disabled}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed"
          dir="rtl"
        />
      </div>

      {/* Left Side: Total Duration */}
      <span
        className={`font-2 text-base-content/70 text-left font-medium select-none ${
          isCompact ? "text-[9px] min-w-[26px]" : "text-[10px] text-base-content/60 min-w-[32px]"
        }`}
      >
        {formatTime(durationSec)}
      </span>
    </div>
  );
}
