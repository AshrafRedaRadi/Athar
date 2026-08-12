import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { BsStars } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FiBarChart2, FiAward, FiChevronLeft, FiChevronsLeft } from "react-icons/fi";
import Navbar from "../components/shared/Navbar";
import StudyToolbar from "../components/study/StudyToolbar";
import HadithCard from "../components/study/HadithCard";
import RecordButton from "../components/study/recitation/RecordButton";
import RecitationResultsModal from "../components/study/recitation/RecitationResultsModal";
import AudioPlayer from "../components/study/AudioPlayer";
import ExplanationPanel from "../components/study/ExplanationPanel";
import { hadithsService } from "../services/hadithsService";
import { booksService } from "../services/booksService";
import { useAuth } from "../context/AuthContext";
import { useRecitation } from "../components/study/recitation/useRecitation";
import GuestLoginModal from "../components/auth/GuestLoginModal";



// ─────────────────────────────────────────────
//  Study Page
// ─────────────────────────────────────────────
export default function Study() {
  const { bookId, sectionId, hadithId } = useParams();
  const { isGuest } = useAuth();

  // sectionId "0" means the book has no sections → omit &sectionId from API call
  const effectiveSectionId = sectionId === "0" ? null : sectionId;

  const [hadithsList, setHadithsList] = useState([]);
  const [currentHadithIndex, setCurrentHadithIndex] = useState(0);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("text"); // "text" | "video"
  const [isHidden, setIsHidden] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioListeningMode, setIsAudioListeningMode] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const audioControlRef = useRef(null);
  const wasHiddenWhenStartedRef = useRef(false); // tracks if text was hidden when recitation began
  const memorizeCalledRef = useRef(false); // prevents duplicate API calls per session

  const handleAudioToggle = () => {
    if (audioControlRef.current && audioControlRef.current.togglePlay) {
      audioControlRef.current.togglePlay();
    }
  };

  // Fetch hadiths from backend API if bookId is present in route
  useEffect(() => {
    async function loadHadiths() {
      if (!bookId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [hadithsData, booksData, progressData] = await Promise.all([
          hadithsService.getHadithsByBook(bookId, effectiveSectionId),
          booksService.getBooks().catch(() => []),
          isGuest ? Promise.resolve([]) : hadithsService.getHadithProgress(bookId).catch(() => []),
        ]);

        const targetBook = booksData.find((b) => String(b.id) === String(bookId));
        const bookName = targetBook?.title || "";

        const pMap = {};
        if (Array.isArray(progressData)) {
          progressData.forEach((item) => {
            const hId = item.hadithId ?? item.id;
            const st = item.status ?? item.progressStatus ?? item.Status ?? 0;
            if (hId != null) {
              pMap[hId] = Number(st);
            }
          });
        }
        setProgressMap(pMap);

        if (hadithsData && hadithsData.length > 0) {
          const formatted = hadithsData.map((h) => ({
            ...h,
            bookTitle: h.bookTitle || bookName,
          }));
          setHadithsList(formatted);
          if (hadithId) {
            const foundIdx = formatted.findIndex(
              (item) =>
                String(item.id) === String(hadithId) ||
                String(item.order) === String(hadithId) ||
                String(item.hadithNumber).replace(/[^\d]/g, "") === String(hadithId)
            );
            setCurrentHadithIndex(foundIdx >= 0 ? foundIdx : 0);
          } else {
            setCurrentHadithIndex(0);
          }
        } else {
          setHadithsList([]);
        }
      } catch (err) {
        console.error("Error fetching hadiths from backend API:", err.message);
        setHadithsList([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadHadiths();
  }, [bookId, isGuest]);

  const currentHadith = hadithsList[currentHadithIndex] || null;

  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [backendExplanations, setBackendExplanations] = useState(null);

  // Automatically update progress & last opened hadith when viewing a Hadith on Study page
  useEffect(() => {
    if (!isGuest && currentHadith?.id) {
      hadithsService.updateLastOpenedHadith(currentHadith.id).catch((err) => {
        console.warn("Auto update last opened hadith error:", err.message);
      });

      // Only update to status 1 ("جاري الحفظ") if current status is NOT already 2 ("تم الحفظ")
      const currentStatus = progressMap[currentHadith.id];
      if (currentStatus !== 2) {
        hadithsService.updateHadithProgress(currentHadith.id, 1).catch((err) => {
          console.warn("Auto update hadith progress error:", err.message);
        });
        setProgressMap((prev) => ({ ...prev, [currentHadith.id]: 1 }));
      }
    }

    if (currentHadith?.id) {
      setBackendExplanations(null);
      hadithsService.getHadithExplanations(currentHadith.id)
        .then((data) => {
          if (data) setBackendExplanations(data);
        })
        .catch((err) => {
          console.warn("Fetch explanations error:", err.message);
        });
    }
  }, [currentHadith?.id, isGuest]);

  // SignalR Real-Time Speech Recitation Hook
  const {
    spokenWords,
    extras,
    activeWordIndex,
    isListening,
    isConnecting,
    recitationStopped,
    completedSummary,
    errorMsg: recitationError,
    startListening,
    stopListening,
    resetRecitation,
  } = useRecitation();

  // Automatically switch to revealed mode (isHidden = false) when recitation finishes
  useEffect(() => {
    if (completedSummary || (recitationStopped && spokenWords.length > 0)) {
      setIsHidden(false);
    }
  }, [completedSummary, recitationStopped, spokenWords.length]);

  // Check conditions and show congratulations toast when recitation finishes
  useEffect(() => {
    if (!completedSummary || memorizeCalledRef.current || isGuest) return;

    // Extract accuracy and coverage from summary
    const extractVal = (obj, ...keys) => {
      for (const key of keys) {
        if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
        if (obj?.metrics && obj.metrics[key] !== undefined && obj.metrics[key] !== null) return obj.metrics[key];
        if (obj?.Metrics && obj.Metrics[key] !== undefined && obj.Metrics[key] !== null) return obj.Metrics[key];
      }
      return undefined;
    };
    let rawAcc = extractVal(completedSummary, "accuracy", "Accuracy", "accuracyPercentage", "AccuracyPercentage", "accuracyPercent", "AccuracyPercent", "score", "Score") ?? 0;
    if (typeof rawAcc === "number" && rawAcc > 0 && rawAcc <= 1) rawAcc = rawAcc * 100;
    const accuracyValue = Number(rawAcc) || 0;

    let rawCov = extractVal(completedSummary, "coverage", "Coverage", "coveragePercentage", "CoveragePercentage", "coveragePercent", "CoveragePercent") ?? 0;
    if (typeof rawCov === "number" && rawCov > 0 && rawCov <= 1) rawCov = rawCov * 100;
    const coverageValue = Number(rawCov) || 0;

    const meetsConditions = wasHiddenWhenStartedRef.current && accuracyValue >= 80 && coverageValue >= 90;

    if (meetsConditions && currentHadith?.id) {
      memorizeCalledRef.current = true;
      setShowCongrats(true);
      setProgressMap((prev) => ({ ...prev, [currentHadith.id]: 2 }));
      hadithsService.updateHadithProgress(currentHadith.id, 2).catch((err) => {
        console.warn("Could not mark hadith as memorized:", err?.message);
      });
    }
  }, [completedSummary, isGuest, currentHadith?.id]);

  // Auto-dismiss congratulations toast after 5 seconds
  useEffect(() => {
    if (!showCongrats) return;
    const timer = setTimeout(() => setShowCongrats(false), 5000);
    return () => clearTimeout(timer);
  }, [showCongrats]);

  // Reset memorize guard when navigating to a new hadith
  useEffect(() => {
    memorizeCalledRef.current = false;
    setShowCongrats(false);
  }, [currentHadith?.id]);

  // Reset step-by-step revealed words count when hadith changes or when isHidden is turned off
  useEffect(() => {
    setRevealedCount(0);
  }, [currentHadith?.id, isHidden]);

  // Reveal next single word hint (<)
  const handleRevealNextWord = () => {
    if (!currentHadith?.text) return;
    const words = currentHadith.text.trim().split(/\s+/);
    setRevealedCount((prev) => Math.min(prev + 1, words.length));
  };

  // Reveal next sentence / phrase hint (<<) (stopping at punctuation or next 5 words)
  const handleRevealNextSentence = () => {
    if (!currentHadith?.text) return;
    const words = currentHadith.text.trim().split(/\s+/);
    let nextEnd = revealedCount + 1;
    while (nextEnd < words.length) {
      const w = words[nextEnd - 1];
      if (/[،,.:؛!؟]/.test(w) || nextEnd - revealedCount >= 5) break;
      nextEnd++;
    }
    setRevealedCount(Math.min(nextEnd, words.length));
  };

  // Render reusable hint pill container with circular arrow buttons
  const renderHintPill = () => (
    <div className="flex items-center gap-1 bg-base-100/95 backdrop-blur-md border border-base-300 rounded-full p-1 shadow-md">
      <button
        onClick={handleRevealNextWord}
        className="w-8 h-8 rounded-full border border-base-300 bg-base-100 hover:bg-base-200 text-base-content/80 hover:text-cyan-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0 shadow-2xs"
        title="كشف الكلمة التالية"
        aria-label="كشف الكلمة التالية"
      >
        <FiChevronLeft className="text-base" />
      </button>
      <button
        onClick={handleRevealNextSentence}
        className="w-8 h-8 rounded-full border border-base-300 bg-base-100 hover:bg-base-200 text-base-content/80 hover:text-cyan-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0 shadow-2xs"
        title="كشف الجملة التالية"
        aria-label="كشف الجملة التالية"
      >
        <FiChevronsLeft className="text-base" />
      </button>
    </div>
  );

  // Toggle recording
  const handleRecordToggle = () => {
    if (isGuest) {
      setIsGuestModalOpen(true);
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      wasHiddenWhenStartedRef.current = isHidden; // capture hide state at recitation start
      startListening(currentHadith?.id);
    }
  };

  // Navigate hadiths
  const goToPrev = () => {
    if (currentHadithIndex > 0) {
      setCurrentHadithIndex(currentHadithIndex - 1);
      resetRecitation();
    }
  };

  const goToNext = () => {
    if (currentHadithIndex < hadithsList.length - 1) {
      setCurrentHadithIndex(currentHadithIndex + 1);
      resetRecitation();
    }
  };

  return (
    <div className="h-screen bg-base-200 overflow-hidden flex">

      {/* ── Congratulations Toast Banner ── */}
      {showCongrats && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] animate-cardIn pointer-events-none w-11/12 max-w-sm"
          dir="rtl"
        >
          <div className="bg-cyan-950/95 dark:bg-cyan-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-cyan-500/50 px-4 py-3.5 flex items-center justify-center gap-3.5 text-right">
            <div className="w-10 h-10 rounded-xl bg-cyan-700/60 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-inner">
              <FiAward className="text-cyan-200 text-2xl" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-1 font-bold text-sm text-cyan-100 leading-tight">أحسنت! 🎉</span>
              <span className="font-2 text-xs text-cyan-200/90 leading-normal whitespace-nowrap">لقد قمت بحفظ الحديث بنجاح</span>
            </div>
          </div>
        </div>
      )}
      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col h-full relative">

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-12 px-4 sm:px-8 py-6" dir="rtl">
          <Navbar activePage="library" />

          <div className="max-w-4xl mx-auto min-h-full flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-cyan-600/20 border-t-cyan-600 rounded-full animate-spin mb-4" />
                <p className="font-2 text-base text-base-content/70">جاري استحضار أحاديث الكتاب...</p>
              </div>
            ) : currentHadith ? (
              <>
                {/* Hadith navigation and index toolbar */}
                <StudyToolbar
                  bookId={bookId}
                  sectionId={sectionId}
                  onPrevHadith={goToPrev}
                  onNextHadith={goToNext}
                  hasPrev={currentHadithIndex > 0}
                  hasNext={currentHadithIndex < hadithsList.length - 1}
                  hadithLabel={currentHadith.hadithNumber}
                />

                {/* Recitation Error Banner if any */}
                {recitationError && (
                  <div className="alert alert-error shadow-sm text-xs font-2 my-2 rounded-xl text-white">
                    <span>{recitationError}</span>
                  </div>
                )}

                {/* Hadith Card Area */}
                <div className="flex-1 flex flex-col justify-center mt-1 sm:mt-1 mb-4">
                  <HadithCard
                    bookTitle={currentHadith.bookTitle || "الأربعون النووية"}
                    hadithLabel={currentHadith.hadithNumber}
                    title={currentHadith.title}
                    text={currentHadith.text}
                    source={currentHadith.source}
                    mode={isListening ? "reciting" : "reading"}
                    spokenWords={spokenWords}
                    activeWordIndex={activeWordIndex}
                    isHidden={isHidden}
                    revealedCount={revealedCount}
                    onToggleHide={() => setIsHidden(!isHidden)}
                  />
                </div>

                <RecordButton
                  isRecording={isListening}
                  isConnecting={isConnecting}
                  onToggle={() => {
                    if (audioControlRef.current && audioControlRef.current.pause) {
                      audioControlRef.current.pause();
                    }
                    setIsAudioListeningMode(false);
                    handleRecordToggle();
                  }}
                  onRecite={() => {
                    if (audioControlRef.current && audioControlRef.current.pause) {
                      audioControlRef.current.pause();
                    }
                    setIsAudioListeningMode(false);
                    if (!isListening) handleRecordToggle();
                  }}
                  onListen={() => {
                    setIsAudioListeningMode(true);
                  }}
                  isListenModeActive={isAudioListeningMode}
                  isAudioPlaying={isAudioPlaying}
                  onAudioToggle={handleAudioToggle}
                />

                {/* Bottom Action Bar: icon buttons beside AudioPlayer (desktop) / floating above dock (mobile) */}
                <div className="fixed z-45 transition-all duration-300 flex items-center gap-1.5 sm:gap-2.5 bottom-[72px] left-2 lg:bottom-5 lg:right-[calc(50%+227px)] lg:left-auto" dir="rtl">

                  {/* 1. Hide / Reveal Text Standalone Button & Animated Hint Controls */}
                  <div className="relative flex items-center gap-1.5">

                    {/* ── DESKTOP ONLY (≥ lg): Floating Pill Container ABOVE Eye Button ── */}
                    <div
                      className={`hidden lg:flex items-center absolute -top-12 right-0 transition-all duration-300 ease-out ${isHidden
                          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                          : "opacity-0 translate-y-2 scale-90 pointer-events-none"
                        }`}
                    >
                      {renderHintPill()}
                    </div>

                    {/* ── MOBILE ONLY (< lg): Expanding Hint Arrows Drawer Pill on the RIGHT of Eye Button ── */}
                    <div
                      className={`lg:hidden flex items-center transition-all duration-300 ease-out overflow-hidden ${isHidden
                          ? "max-w-[130px] opacity-100 scale-100"
                          : "max-w-0 opacity-0 scale-90 pointer-events-none"
                        }`}
                    >
                      {renderHintPill()}
                    </div>

                    {/* ── Standalone Circular Eye Button (Fixed Anchor for Desktop & Mobile) ── */}
                    <button
                      onClick={() => setIsHidden(!isHidden)}
                      className="btn btn-circle w-10 h-10 min-h-0 btn-ghost text-base-content/80 hover:text-cyan-700 border border-base-300 bg-base-100/95 backdrop-blur-md shadow-sm flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95"
                      aria-label={isHidden ? "إظهار النص" : "إخفاء النص"}
                      title={isHidden ? "إظهار النص" : "إخفاء النص"}
                    >
                      {isHidden ? (
                        <IoEyeOffOutline className="text-lg text-cyan-700" />
                      ) : (
                        <IoEyeOutline className="text-lg" />
                      )}
                    </button>
                  </div>

                  {/* 2. Explanation Info Button */}
                  <button
                    onClick={() => setIsExplanationOpen(!isExplanationOpen)}
                    className="btn btn-circle w-10 h-10 min-h-0 btn-ghost text-base-content/80 hover:text-cyan-700 border border-base-300 bg-base-100 shadow-sm flex items-center justify-center"
                    aria-label="شرح الحديث"
                  >
                    <AiOutlineInfoCircle className="text-lg" />
                  </button>

                  {/* 3. Recitation Results Button */}
                  <button
                    onClick={() => setIsResultsOpen(true)}
                    disabled={!completedSummary}
                    className={`btn btn-circle w-10 h-10 min-h-0 flex items-center justify-center transition-all duration-300 ${completedSummary
                      ? "bg-cyan-700 hover:bg-cyan-800 text-white shadow-md shadow-cyan-700/30 border-none scale-105"
                      : "bg-base-100 border border-base-300 text-base-content/40 shadow-sm cursor-not-allowed"
                      }`}
                    aria-label="نتيجة التسميع"
                    title={completedSummary ? "عرض نتيجة التسميع" : "لا توجد نتيجة بعد"}
                  >
                    <FiBarChart2 className={`text-lg ${completedSummary ? "text-white" : "text-base-content/40"}`} />
                  </button>

                  {/* 4. AI Helper Button */}
                  <button
                    onClick={() => console.log("AI Helper clicked")}
                    className="btn btn-circle w-10 h-10 min-h-0 bg-cyan-700 hover:bg-cyan-800 text-white shadow-md border-none flex items-center justify-center"
                    aria-label="المساعد الذكي"
                  >
                    <BsStars className="text-base" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <p className="font-2 text-lg text-base-content/70">لم نتمكن من استحضار أحاديث هذا الكتاب حالياً، يرجى التثبت من الاتصال أو مراجعة المكتبة</p>
              </div>
            )}
          </div>
        </div>

        {/* Audio Player — Always visible on Desktop, or when Listening Mode is activated on Mobile */}
        <AudioPlayer
          hadith={currentHadith}
          hadithLabel={currentHadith?.hadithNumber || ""}
          reader={currentHadith?.reader || "القارئ: أحمد النفيس"}
          onClose={() => setIsAudioListeningMode(false)}
          onPlaybackChange={(playing) => setIsAudioPlaying(playing)}
          audioControlRef={audioControlRef}
          isMobileListening={isAudioListeningMode}
        />
      </div>

      {/* ── Explanation Panel (Drawer on Desktop / Bottom-sheet on Mobile) ── */}
      <ExplanationPanel
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        explanation={backendExplanations || currentHadith?.explanation}
        hadith={currentHadith}
      />

      {/* ── Guest Login Modal ── */}
      <GuestLoginModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        title="تسجيل الدخول لبدء التسميع"
        message="التسميع الصوتي واكتشاف أخطاء الحفظ بالذكاء الاصطناعي يتطلب تسجيل الدخول إلى حسابك."
      />

      {/* ── Recitation Results Modal ── */}
      <RecitationResultsModal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        summary={completedSummary}
        extras={extras}
        hadithId={currentHadith?.id}
        wasHidden={wasHiddenWhenStartedRef.current}
      />
    </div>
  );
}
