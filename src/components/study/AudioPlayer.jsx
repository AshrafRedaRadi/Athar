import React, { useState, useEffect, useRef } from "react";
import DesktopAudioPlayer from "./DesktopAudioPlayer";
import MobileAudioPlayer from "./MobileAudioPlayer";
import { getImageUrl } from "../../api/client";

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 2];
const SAMPLE_FALLBACK_AUDIO = "https://server8.mp3quran.net/afs/001.mp3";

/**
 * AudioPlayer — Central orchestrator managing audio state and HTML5 audio element,
 * rendering DesktopAudioPlayer & MobileAudioPlayer modular subcomponents.
 */
export default function AudioPlayer({
  hadith,
  hadithLabel,
  reader = "القارئ: أحمد النفيس",
  onClose,
  onPlaybackChange,
  audioControlRef,
  isMobileListening = false
}) {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const rawAudioUrl = hadith?.audioUrl;
  const audioSrc = rawAudioUrl ? getImageUrl(rawAudioUrl) : SAMPLE_FALLBACK_AUDIO;

  // Reset player state when Hadith changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTimeSec(0);
    setProgress(0);
    setDurationSec(0);
    setShowSpeedMenu(false);
    setIsMobileExpanded(false);
  }, [hadith?.id, audioSrc]);

  // Close expanded mobile popup card whenever mobile listening mode is deactivated
  useEffect(() => {
    if (!isMobileListening) {
      setIsMobileExpanded(false);
    }
  }, [isMobileListening]);

  // Sync playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sync loop
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // Sync mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    if (!audioRef.current || !audioSrc) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Audio playback error:", err);
          setIsPlaying(false);
        });
    }
  };

  // Notify parent of playback state change
  useEffect(() => {
    if (onPlaybackChange) {
      onPlaybackChange(isPlaying);
    }
  }, [isPlaying, onPlaybackChange]);

  // Expose togglePlay & pause ref to parent
  useEffect(() => {
    if (audioControlRef) {
      audioControlRef.current = {
        togglePlay,
        pause: () => {
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        },
        isPlaying
      };
    }
  });

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime || 0;
    const dur = audioRef.current.duration || 0;
    setCurrentTimeSec(current);
    if (dur > 0) {
      setDurationSec(dur);
      setProgress((current / dur) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDurationSec(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    if (!isLooping) {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTimeSec(0);
    }
  };

  const handleSeek = (e) => {
    const val = Number(e.target.value);
    setProgress(val);
    if (audioRef.current && durationSec > 0) {
      const newTime = (val / 100) * durationSec;
      audioRef.current.currentTime = newTime;
      setCurrentTimeSec(newTime);
    }
  };

  const skipTime = (seconds) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(durationSec || 0, (audioRef.current.currentTime || 0) + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTimeSec(newTime);
  };

  return (
    <>
      {/* Hidden HTML5 Audio Element */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />
      )}

      {/* Outer Responsive Wrapper Container */}
      <div
        className="fixed z-45 transition-all duration-300
                   bottom-[72px] right-[84px] sm:right-[90px] flex justify-center items-center pointer-events-none lg:pointer-events-auto lg:block
                   lg:bottom-1.5 lg:left-[calc(50%+48px)] lg:right-auto lg:-translate-x-1/2
                   w-auto lg:w-[95%] lg:max-w-lg"
        dir="rtl"
      >
        {/* Mobile Sub-component (< lg) */}
        <MobileAudioPlayer
          isMobileListening={isMobileListening}
          audioSrc={audioSrc}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          isMobileExpanded={isMobileExpanded}
          setIsMobileExpanded={setIsMobileExpanded}
          reader={reader}
          currentTimeSec={currentTimeSec}
          durationSec={durationSec}
          formatTime={formatTime}
          progress={progress}
          handleSeek={handleSeek}
          skipTime={skipTime}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
          isLooping={isLooping}
          setIsLooping={setIsLooping}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />

        {/* Desktop Sub-component (>= lg) */}
        <DesktopAudioPlayer
          audioSrc={audioSrc}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          skipTime={skipTime}
          currentTimeSec={currentTimeSec}
          durationSec={durationSec}
          formatTime={formatTime}
          progress={progress}
          handleSeek={handleSeek}
          hadithLabel={hadithLabel}
          reader={reader}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
          showSpeedMenu={showSpeedMenu}
          setShowSpeedMenu={setShowSpeedMenu}
          SPEED_OPTIONS={SPEED_OPTIONS}
          isLooping={isLooping}
          setIsLooping={setIsLooping}
        />
      </div>
    </>
  );
}
