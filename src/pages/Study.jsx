import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { BsStars } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FiBarChart2, FiAward, FiChevronLeft, FiChevronsLeft, FiLock } from "react-icons/fi";
import Navbar from "../components/shared/Navbar";
import StudyToolbar from "../components/study/StudyToolbar";
import HadithCard from "../components/study/HadithCard";
import RecordButton from "../components/study/recitation/RecordButton";
import RecitationResultsModal from "../components/study/recitation/RecitationResultsModal";
import AudioPlayer from "../components/study/AudioPlayer";
import ExplanationPanel from "../components/study/ExplanationPanel";
import AiChatModal from "../components/shared/AiChatModal";
import { hadithsService } from "../services/hadithsService";
import { booksService } from "../services/booksService";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import { useRecitation } from "../components/study/recitation/useRecitation";

// ─────────────────────────────────────────────
//  Study Page
// ─────────────────────────────────────────────
export default function Study() {
  const { bookId, sectionId, hadithId } = useParams();
  const { isHintsLocked, isRecitationLimitReached, showUpgradeModal } = useSubscription();

  // sectionId "0" means the book has no sections → omit &sectionId from API call
  const effectiveSectionId = sectionId === "0" ? null : sectionId;

  const [hadithsList, setHadithsList] = useState([]);
  const [currentHadithIndex, setCurrentHadithIndex] = useState(0);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("text"); // "text" | "video"
  const [isHidden, setIsHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioListeningMode, setIsAudioListeningMode] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsMessage, setCongratsMessage] = useState("تم حفظ الحديث، بارك الله فيك استمر!");
  const [hintTooltip, setHintTooltip] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const audioControlRef = useRef(null);
  const wasHiddenWhenStartedRef = useRef(false); // tracks if text was hidden when recitation began
  const memorizeCalledRef = useRef(false); // prevents duplicate API calls per session
  const recitationActiveHadithIndexRef = useRef(null); // locks to the hadith where recitation was initiated

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
          hadithsService.getHadithProgress(bookId).catch(() => []),
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
                String(item.hadithNumber)?.replace(/[^\d]/g, "") === String(hadithId)
            );
            setCurrentHadithIndex(foundIdx >= 0 ? foundIdx : 0);
          } else {
            setCurrentHadithIndex(0);
          }
        } else {
          setHadithsList([]);
        }
      } catch (err) {
        console.error("Error loading hadiths for study:", err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadHadiths();
  }, [bookId]);

  const currentHadith = hadithsList[currentHadithIndex] || null;

  const [backendExplanations, setBackendExplanations] = useState(null);

  // Automatically update progress & last opened hadith when viewing a Hadith on Study page
  useEffect(() => {
    if (!currentHadith?.id) return;

    // 1. Debounce last-opened-hadith to avoid parallel concurrency conflicts with Identity
    const timer = setTimeout(() => {
      hadithsService.updateLastOpenedHadith(currentHadith.id).catch(() => {});
    }, 450);

    // 2. Only update to status 1 ("جاري الحفظ") if current status is 0
    const currentStatus = progressMap[currentHadith.id];
    if (currentStatus !== 2 && currentStatus !== 1) {
      hadithsService.updateHadithProgress(currentHadith.id, 1).catch((err) => {
        console.warn("Auto update hadith progress error:", err.message);
      });
      setProgressMap((prev) => ({ ...prev, [currentHadith.id]: 1 }));
    }

    // 3. Fetch explanations
    setBackendExplanations(null);
    hadithsService.getHadithExplanations(currentHadith.id)
      .then((data) => {
        if (data) setBackendExplanations(data);
      })
      .catch((err) => {
        console.warn("Fetch explanations error:", err.message);
      });

    return () => clearTimeout(timer);
  }, [currentHadith?.id]);

  // SignalR Real-Time Speech Recitation Hook
  const {
    spokenWords,
    canonicalWords,
    extras,
    transcript,
    activeWordIndex,
    furthestActiveWordIndex,
    startDetection,
    isListening,
    isConnecting,
    completedSummary,
    errorMsg: recitationError,
    startListening,
    stopListening,
    requestHint,
    resetRecitation,
  } = useRecitation();

  // Live recitation duration timer
  const [recitationSeconds, setRecitationSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isListening) {
      setRecitationSeconds(0);
      interval = setInterval(() => {
        setRecitationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecitationSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  const formatRecitationTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // The backend owns scoring and hint eligibility. The page only adds the fact that
  // this particular attempt started with the Hadith hidden.
  useEffect(() => {
    if (!completedSummary || memorizeCalledRef.current) return;
    const backendQualified = completedSummary.qualifiesAsMemorized
      ?? completedSummary.QualifiesAsMemorized
      ?? false;

    if (wasHiddenWhenStartedRef.current && backendQualified && currentHadith?.id) {
      memorizeCalledRef.current = true;
      const isFirstTimeMemorized = progressMap[currentHadith.id] !== 2;
      if (isFirstTimeMemorized) {
        setCongratsMessage("تم حفظ الحديث، بارك الله فيك استمر!");
      } else {
        setCongratsMessage("تمت مراجعة الحديث بنجاح، بارك الله فيك استمر!");
      }
      setShowCongrats(true);
      setProgressMap((prev) => ({ ...prev, [currentHadith.id]: 2 }));
      hadithsService.updateHadithProgress(currentHadith.id, 2).catch((err) => {
        console.warn("Could not mark hadith as memorized:", err?.message);
      });
    }
  }, [completedSummary, currentHadith?.id, progressMap]);

  // Auto-dismiss congratulations toast after 4 seconds
  useEffect(() => {
    if (!showCongrats) return;
    const timer = setTimeout(() => setShowCongrats(false), 4000);
    return () => clearTimeout(timer);
  }, [showCongrats]);

  // Reset memorize guard when navigating to a new hadith
  useEffect(() => {
    memorizeCalledRef.current = false;
    setShowCongrats(false);
  }, [currentHadith?.id]);

  const [localRecitationError, setLocalRecitationError] = useState(null);

  const activeRecitationError = localRecitationError || recitationError;

  const handleRevealNextWord = () => {
    if (isHintsLocked) {
      setHintTooltip("ميزة التلميحات خاصة بمشتركي الباقة القياسية 🔒");
      setTimeout(() => setHintTooltip(null), 4000);
      return;
    }
    if (!isListening) {
      setHintTooltip("يرجى بدء التسميع الصوتي أولاً لاستخدام التلميح 🎙️");
      setTimeout(() => setHintTooltip(null), 3000);
      return;
    }
    requestHint(1);
  };

  const handleRevealNextSentence = () => {
    if (isHintsLocked) {
      setHintTooltip("ميزة التلميحات خاصة بمشتركي الباقة القياسية 🔒");
      setTimeout(() => setHintTooltip(null), 4000);
      return;
    }
    if (!isListening) {
      setHintTooltip("يرجى بدء التسميع الصوتي أولاً لاستخدام التلميح 🎙️");
      setTimeout(() => setHintTooltip(null), 3000);
      return;
    }
    requestHint(3);
  };

  // Render reusable hint pill container with circular arrow buttons
  const renderHintPill = () => (
    <div className="relative inline-flex flex-col items-center">
      {/* Floating Tooltip Message above hint buttons */}
      {hintTooltip && (
        <div className="absolute -top-12 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 border border-amber-400/70 text-amber-300 text-xs font-bold shadow-xl animate-fadeIn flex items-center gap-2">
          <span>{hintTooltip}</span>
          {isHintsLocked && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showUpgradeModal("تلميحات الكلمات أثناء التسميع");
              }}
              className="px-2 py-0.5 rounded-md bg-cyan-700 hover:bg-cyan-800 text-white text-[10px] font-bold cursor-pointer transition shadow-xs"
            >
              ترقية
            </button>
          )}
        </div>
      )}

      <div
        onClick={() => {
          if (isHintsLocked) {
            setHintTooltip("ميزة التلميحات خاصة بمشتركي الباقة القياسية 🔒");
            setTimeout(() => setHintTooltip(null), 4000);
          }
        }}
        className="flex items-center gap-1 bg-base-100/95 dark:bg-slate-900/95 backdrop-blur-md border border-base-300 dark:border-slate-800 rounded-full p-1 shadow-md cursor-pointer"
      >
        {isHintsLocked && (
          <span
            className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] font-bold shrink-0 ml-0.5"
            title="ميزة خاصة بالباقة القياسية"
          >
            <FiLock className="text-xs" />
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRevealNextWord();
          }}
          className={`w-8 h-8 rounded-full border border-base-300 dark:border-slate-700 bg-base-100 dark:bg-slate-800 text-base-content/80 hover:text-cyan-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0 shadow-2xs cursor-pointer ${
            !isListening && !isHintsLocked ? "opacity-40" : ""
          }`}
          title={isHintsLocked ? "ميزة خاصة بالباقة القياسية (اضغط للترقية)" : "كشف الكلمة التالية"}
          aria-label="كشف الكلمة التالية"
        >
          <FiChevronLeft className="text-sm font-bold stroke-[2.5]" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRevealNextSentence();
          }}
          className={`w-8 h-8 rounded-full border border-base-300 dark:border-slate-700 bg-base-100 dark:bg-slate-800 text-base-content/80 hover:text-cyan-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0 shadow-2xs cursor-pointer ${
            !isListening && !isHintsLocked ? "opacity-40" : ""
          }`}
          title={isHintsLocked ? "ميزة خاصة بالباقة القياسية (اضغط للترقية)" : "كشف الجملة التالية"}
          aria-label="كشف الجملة التالية"
        >
          <FiChevronsLeft className="text-sm font-bold stroke-[2.5]" />
        </button>
      </div>
    </div>
  );

  // Toggle recording
  const handleRecordToggle = () => {
    setLocalRecitationError(null);
    if (isListening) {
      stopListening();
      recitationActiveHadithIndexRef.current = null;
    } else {
      if (isRecitationLimitReached) {
        setLocalRecitationError(
          "لقد استنفدت الحد اليومي المتاح لجلسات التسميع في باقتك. يرجى الترقية إلى الباقة القياسية للحصول على جلسات تسميع إضافية."
        );
        showUpgradeModal("جلسات التسميع اليومية");
        return;
      }
      recitationActiveHadithIndexRef.current = currentHadithIndex;
      wasHiddenWhenStartedRef.current = isHidden; // capture hide state at recitation start
      startListening(currentHadith?.id);
    }
  };

  const recitationBaselineWhenNavigatedRef = useRef({
    evaluatedCount: 0,
    transcriptLength: 0,
    activeWordIndex: -1,
  });

  const recordNavigatedBaseline = () => {
    const evaluatedCount = Array.isArray(spokenWords)
      ? spokenWords.filter((w) => w && w.state !== "Pending").length
      : 0;
    recitationBaselineWhenNavigatedRef.current = {
      evaluatedCount,
      transcriptLength: (transcript || "").length,
      activeWordIndex: activeWordIndex ?? -1,
    };
  };

  // Navigate hadiths
  const goToPrev = () => {
    if (currentHadithIndex > 0) {
      if (isListening && recitationActiveHadithIndexRef.current !== null) {
        recordNavigatedBaseline();
      }
      setCurrentHadithIndex(currentHadithIndex - 1);
      if (!isListening) {
        resetRecitation();
      }
    }
  };

  const goToNext = () => {
    if (currentHadithIndex < hadithsList.length - 1) {
      if (isListening && recitationActiveHadithIndexRef.current !== null) {
        recordNavigatedBaseline();
      }
      setCurrentHadithIndex(currentHadithIndex + 1);
      if (!isListening) {
        resetRecitation();
      }
    }
  };

  // Automatically return to the reciting Hadith ONLY when NEW words are spoken after navigating away
  useEffect(() => {
    if (
      isListening &&
      recitationActiveHadithIndexRef.current !== null &&
      currentHadithIndex !== recitationActiveHadithIndexRef.current
    ) {
      const currentEvaluatedCount = Array.isArray(spokenWords)
        ? spokenWords.filter((w) => w && w.state !== "Pending").length
        : 0;
      const currentTranscriptLength = (transcript || "").length;
      const currentWordIdx = activeWordIndex ?? -1;

      const baseline = recitationBaselineWhenNavigatedRef.current;

      const hasNewSpeechActivity =
        currentEvaluatedCount > baseline.evaluatedCount ||
        currentTranscriptLength > baseline.transcriptLength + 2 ||
        (currentWordIdx >= 0 && currentWordIdx > baseline.activeWordIndex) ||
        completedSummary !== null;

      if (hasNewSpeechActivity) {
        setCurrentHadithIndex(recitationActiveHadithIndexRef.current);
      }
    }
  }, [
    isListening,
    spokenWords,
    transcript,
    activeWordIndex,
    completedSummary,
    currentHadithIndex,
  ]);

  // Clear recitation lock when listening stops
  useEffect(() => {
    if (!isListening) {
      recitationActiveHadithIndexRef.current = null;
      recitationBaselineWhenNavigatedRef.current = {
        evaluatedCount: 0,
        transcriptLength: 0,
        activeWordIndex: -1,
      };
    }
  }, [isListening]);

  return (
    <div className="h-screen bg-base-200 overflow-hidden flex">

      {/* ── Congratulations Toast Banner ── */}
      {showCongrats && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] animate-cardIn pointer-events-none w-auto max-w-[94vw]"
          dir="rtl"
        >
          <div className="bg-cyan-950/95 dark:bg-cyan-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-cyan-500/50 px-4 py-3 flex items-center justify-center gap-3 text-right">
            <div className="w-8 h-8 rounded-xl bg-cyan-700/60 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-inner">
              <FiAward className="text-cyan-200 text-lg" />
            </div>
            <span className="font-2 font-bold text-xs sm:text-sm text-cyan-100 whitespace-nowrap">
              {congratsMessage}
            </span>
          </div>
        </div>
      )}
      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col h-full relative">

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8 w-full" dir="rtl">
          <Navbar activePage="library" />

          <div className="max-w-4xl mx-auto min-h-full flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-24 relative select-none animate-cardIn">
                {/* Background Soft Cyan Glow */}
                <div className="absolute w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                {/* Center Ring Container */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                  {/* Outer Pulse Glow Ring */}
                  <div className="absolute inset-0 rounded-full bg-cyan-600/10 animate-ping" />

                  {/* SVG Circular Progress Ring */}
                  <svg className="w-full h-full transform -rotate-90 animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
                    {/* Track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="5"
                      className="text-cyan-900/20 dark:text-cyan-950/40 fill-none"
                    />
                    {/* Animated Dash Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeDasharray="264"
                      strokeDashoffset="75"
                      strokeLinecap="round"
                      className="text-cyan-600 dark:text-cyan-400 fill-none transition-all duration-500"
                    />
                  </svg>

                  {/* Central Arabic Calligraphy Text "أثر" */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-1 font-bold text-3xl tracking-wide text-cyan-700 dark:text-cyan-400 drop-shadow-sm">
                      أَثَـر
                    </span>
                  </div>
                </div>

                {/* Loading Label & Animated Dots */}
                <div className="flex flex-col items-center gap-2">
                  <p className="font-2 font-medium text-base text-base-content/80 tracking-wide">
                    جاري استحضار أحاديث الكتاب...
                  </p>
                  
                  {/* Cyan Animated Bouncing Dots */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-bounce" />
                  </div>
                </div>
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
                  hadithLabel={currentHadith.hadithLabel}
                />

                {/* Recitation Error / Limit Banner */}
                {activeRecitationError && (
                  <div className="my-3 p-3.5 sm:p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 dark:border-rose-800/60 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right font-2 animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-200 leading-relaxed">
                        {activeRecitationError}
                      </span>
                    </div>
                    {(isRecitationLimitReached ||
                      activeRecitationError.includes("انتهت") ||
                      activeRecitationError.includes("استنفدت") ||
                      activeRecitationError.includes("الترقية") ||
                      activeRecitationError.includes("الباقة")) && (
                      <button
                        type="button"
                        onClick={() => showUpgradeModal("جلسات التسميع اليومية")}
                        className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer shrink-0 self-end sm:self-auto"
                      >
                        ترقية الآن
                      </button>
                    )}
                  </div>
                )}

                {/* Hadith Card Area */}
                <div className="flex-1 flex flex-col justify-center mt-1 sm:mt-1 mb-4">
                  <HadithCard
                    bookTitle={currentHadith.bookTitle || "الأربعون النووية"}
                    hadithLabel={currentHadith.hadithLabel}
                    title={currentHadith.title}
                    text={currentHadith.text}
                    source={currentHadith.source}
                    mode={isListening ? "reciting" : "reading"}
                    spokenWords={spokenWords}
                    canonicalWords={canonicalWords}
                    activeWordIndex={activeWordIndex}
                    furthestActiveWordIndex={furthestActiveWordIndex}
                    startDetection={startDetection}
                    isHidden={isHidden}
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
                      className={`lg:hidden flex items-center transition-all duration-300 ease-out ${
                        isHidden
                          ? "max-w-[160px] opacity-100 scale-100"
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
                    onClick={() => setIsAiChatOpen(true)}
                    className="btn btn-circle w-10 h-10 min-h-0 bg-gradient-to-tr from-cyan-800 via-cyan-700 to-cyan-600 hover:from-cyan-700 hover:to-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] hover:shadow-[0_0_18px_rgba(6,182,212,0.65)] ring-2 ring-cyan-400/50 hover:ring-cyan-400/90 border-none flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative cursor-pointer"
                    aria-label="مساعد أثر الذكي"
                    title="مساعد أثر الذكي (أثر AI)"
                  >
                    <BsStars className="text-base group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 text-white drop-shadow-sm" />
                  </button>
                </div>

                {/* ── Mobile Live Recitation Timer (Floating above left action bar icons) ── */}
                {(isListening || isConnecting) && (
                  <div
                    className="fixed z-45 bottom-[124px] left-2 flex items-center gap-1.5 bg-base-100/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-base-300 shadow-sm animate-fadeIn lg:hidden"
                    dir="rtl"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ${
                        isConnecting ? "bg-amber-400" : "bg-red-500"
                      }`}
                    />
                    <span className="font-mono text-[11px] font-bold text-base-content tracking-wider leading-none" dir="ltr">
                      {formatRecitationTime(recitationSeconds)}
                    </span>
                  </div>
                )}

                {/* ── Desktop Live Recitation Timer (Floating on bottom left) ── */}
                {(isListening || isConnecting) && (
                  <div
                    className="hidden lg:flex items-center gap-2.5 bg-base-100/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-base-300 shadow-sm animate-fadeIn fixed z-45 bottom-5 left-5"
                    dir="rtl"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-300 ${
                        isConnecting ? "bg-amber-400" : "bg-red-500"
                      }`}
                    />
                    <span className="text-xs font-bold font-2 text-base-content/80">
                      {isConnecting ? "جاري الاتصال بالمايك..." : "مدة التسميع:"}
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-400 tracking-wider" dir="ltr">
                      {formatRecitationTime(recitationSeconds)}
                    </span>
                  </div>
                )}
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
          hadithLabel={currentHadith?.hadithLabel || ""}
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

      {/* ── Recitation Results Modal ── */}
      <RecitationResultsModal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        summary={completedSummary}
        extras={extras}
        hadithId={currentHadith?.id}
        wasHidden={wasHiddenWhenStartedRef.current}
      />

      {/* ── AI Assistant Large Chat Modal ── */}
      <AiChatModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />
    </div>
  );
}
