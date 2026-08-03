import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const SPEED_OPTIONS = [1, 1.25, 1.5, 2];

/**
 * AudioSpeedMenu — Reusable Playback Speed Selector with animated upward dropdown menu.
 */
export default function AudioSpeedMenu({
  playbackSpeed,
  setPlaybackSpeed,
  showSpeedMenu,
  setShowSpeedMenu,
  disabled = false,
  isSimpleToggle = false
}) {
  if (isSimpleToggle) {
    return (
      <button
        type="button"
        onClick={() => {
          const nextSpeed =
            playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
          setPlaybackSpeed(nextSpeed);
        }}
        disabled={disabled}
        className="btn btn-ghost btn-xs rounded-lg text-xs font-bold text-cyan-700 bg-cyan-700/10 border border-cyan-700/20 px-1.5"
        title="تغيير السرعة"
        aria-label="تغيير السرعة"
      >
        {playbackSpeed}x
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
        disabled={disabled}
        className={`btn btn-ghost btn-xs rounded-lg text-xs sm:text-[13px] font-bold font-2 px-0.5 sm:px-1 min-w-[32px] sm:min-w-[44px] justify-center text-center border transition-colors ${
          playbackSpeed !== 1
            ? "bg-cyan-700/10 text-cyan-700 border-cyan-700/20"
            : "text-base-content/70 hover:text-cyan-700 border-transparent"
        }`}
        title="سرعة التشغيل"
        aria-label="سرعة التشغيل"
      >
        {playbackSpeed}x
      </button>

      <AnimatePresence>
        {showSpeedMenu && (
          <>
            {/* Backdrop Click to Close */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowSpeedMenu(false)}
            />

            {/* Upward Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 bg-base-100 dark:bg-slate-800 border border-base-300 dark:border-slate-700 rounded-xl shadow-xl p-1 flex flex-col gap-0.5 min-w-[70px]"
            >
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => {
                    setPlaybackSpeed(speed);
                    setShowSpeedMenu(false);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold font-2 text-center transition-colors cursor-pointer ${
                    playbackSpeed === speed
                      ? "bg-cyan-700 text-white"
                      : "text-base-content/70 hover:bg-base-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
