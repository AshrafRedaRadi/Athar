import { useState } from "react";
import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";
import { RiForward10Line, RiReplay10Line } from "react-icons/ri";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { TbRepeat } from "react-icons/tb";
import { MdSpeed } from "react-icons/md";

/**
 * AudioPlayer — compact centered audio bar.
 * Shown ONLY on desktop screens (lg+). On mobile/tablet (<lg), it is hidden
 * and playback is triggered via the RecordButton long-press options ("استمع").
 *
 * Props:
 *  - hadithLabel  {string}  e.g. "الحديث الأول"
 *  - reader       {string}  e.g. "القارئ: أحمد النفيس"
 *  - duration     {string}  e.g. "01:42"
 */
export default function AudioPlayer({ hadithLabel, reader, duration = "01:42" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:15");
  const [progress, setProgress] = useState(15); // percentage

  return (
    <div
      className="hidden lg:block fixed bottom-0 left-1/2 -translate-x-1/2 z-40
                 bg-base-100 border border-base-300 rounded-t-2xl shadow-[0_-2px_16px_rgba(0,0,0,0.10)]
                 w-[95%] max-w-lg"
      dir="rtl"
    >
      <div className="flex items-center gap-2 px-3 py-1.5">

        {/* ── Right: Hadith info ── */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <HiOutlineSpeakerWave className="text-lg text-cyan-700 shrink-0" />
          <div className="min-w-0">
            <p className="font-3 font-bold text-xs text-base-content truncate">
              {hadithLabel}
            </p>
            <p className="font-2 text-[10px] text-base-content/50 truncate">
              {reader}
            </p>
          </div>
        </div>

        {/* ── Center: Controls + progress ── */}
        <div className="flex-1 flex flex-col items-center gap-0.5">

          {/* Playback controls */}
          <div className="flex items-center gap-1">
            <button
              className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-cyan-700"
              aria-label="ترجيع 10 ثوانٍ"
            >
              <RiReplay10Line className="text-base" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn btn-circle btn-xs bg-cyan-700 hover:bg-cyan-800 text-white border-none flex items-center justify-center p-0"
              aria-label={isPlaying ? "إيقاف" : "تشغيل"}
            >
              {isPlaying ? (
                <IoPauseSharp className="text-sm" />
              ) : (
                <IoPlaySharp className="text-sm" />
              )}
            </button>

            <button
              className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-cyan-700"
              aria-label="تقديم 10 ثوانٍ"
            >
              <RiForward10Line className="text-base" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-1.5 w-full">
            <span className="font-2 text-[9px] text-base-content/40 min-w-[28px] text-center">
              {duration}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="range range-xs range-info flex-1 [--range-fill-bg:theme(colors.cyan.700)]"
              dir="ltr"
            />
            <span className="font-2 text-[9px] text-base-content/40 min-w-[28px] text-center">
              {currentTime}
            </span>
          </div>
        </div>

        {/* ── Left: Extra controls (no share icon) ── */}
        <div className="hidden sm:flex items-center gap-0.5 shrink-0">
          <button
            className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-cyan-700"
            aria-label="سرعة التشغيل"
          >
            <MdSpeed className="text-base" />
          </button>
          <button
            className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-cyan-700"
            aria-label="تكرار"
          >
            <TbRepeat className="text-base" />
          </button>
        </div>
      </div>
    </div>
  );
}
