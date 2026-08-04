import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { IoPlayCircleOutline, IoTvOutline, IoExpandOutline } from "react-icons/io5";
import { HiOutlineLocationMarker, HiOutlineAcademicCap } from "react-icons/hi";

const SMOOTH_SPRING = {
  type: "spring",
  stiffness: 210,
  damping: 24,
  mass: 0.75,
};

const COMMON_PLAYER_VARS = {
  rel: 0,
  modestbranding: 1,
  playsinline: 1,
  fs: 0,
  iv_load_policy: 3,
};

/**
 * Utility to load YouTube IFrame API once and wait until window.YT is ready
 */
function ensureYouTubeApi(onReady) {
  if (!window.YT) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(tag, firstScript);
    } else {
      document.head.appendChild(tag);
    }
  }

  if (window.YT && window.YT.Player) {
    onReady();
    return () => {};
  }

  const interval = setInterval(() => {
    if (window.YT && window.YT.Player) {
      clearInterval(interval);
      onReady();
    }
  }, 150);

  return () => clearInterval(interval);
}

/**
 * VideoExplanation Component — handles YouTube IFrame API, dynamic duration, timestamp preservation, and Portal modal popup.
 */
export default function VideoExplanation({ explanation, hadith, isOpen, activeTab }) {
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

  // ── Main Drawer Player Setup ──
  useEffect(() => {
    if (!youtubeId) {
      setDurationStr("");
      return;
    }

    let isMounted = true;

    const cleanup = ensureYouTubeApi(() => {
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
          ...COMMON_PLAYER_VARS,
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
    });

    return () => {
      isMounted = false;
      if (cleanup) cleanup();
    };
  }, [youtubeId, hadith?.id]);

  // ── Modal Player Setup with Exact Start Time ──
  useEffect(() => {
    if (!isModalOpen || !youtubeId) return;

    let isMounted = true;

    const cleanup = ensureYouTubeApi(() => {
      if (!isMounted || !document.getElementById(modalContainerIdRef.current)) return;

      modalPlayerRef.current = new window.YT.Player(modalContainerIdRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          start: modalStartTime,
          ...COMMON_PLAYER_VARS,
        },
      });
    });

    return () => {
      isMounted = false;
      if (cleanup) cleanup();
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
