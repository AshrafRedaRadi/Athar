import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { BsStars } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FiBarChart2 } from "react-icons/fi";
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
  const audioControlRef = useRef(null);

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
        const [hadithsData, booksData] = await Promise.all([
          hadithsService.getHadithsByBook(bookId, effectiveSectionId),
          booksService.getBooks().catch(() => []),
        ]);

        const targetBook = booksData.find((b) => String(b.id) === String(bookId));
        const bookName = targetBook?.title || "";

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
  }, [bookId]);

  const currentHadith = hadithsList[currentHadithIndex] || null;

  const { isGuest } = useAuth();
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [backendExplanations, setBackendExplanations] = useState(null);

  // Automatically update progress & last opened hadith when viewing a Hadith on Study page
  useEffect(() => {
    if (!isGuest && currentHadith?.id) {
      hadithsService.updateLastOpenedHadith(currentHadith.id).catch((err) => {
        console.warn("Auto update last opened hadith error:", err.message);
      });
      hadithsService.updateHadithProgress(currentHadith.id, 1).catch((err) => {
        console.warn("Auto update hadith progress error:", err.message);
      });
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

  // Toggle recording
  const handleRecordToggle = () => {
    if (isGuest) {
      setIsGuestModalOpen(true);
      return;
    }
    if (isListening) {
      stopListening();
    } else {
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
      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col h-full relative">

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-12 px-4 sm:px-8 py-6" dir="rtl">
          <Navbar activePage="library" />

          <div className="max-w-4xl mx-auto min-h-full flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <span className="loading loading-spinner loading-lg text-cyan-600 mb-4"></span>
                <p className="font-2 text-base-content/70">جاري استحضار الأحاديث الشريفة...</p>
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

                {/* Bottom Action Bar: 3 icon buttons beside AudioPlayer (desktop) / floating above dock (mobile) */}
                <div className="fixed z-45 transition-all duration-300 flex items-center gap-1.5 sm:gap-2.5 bottom-[72px] left-2 lg:bottom-5 lg:right-[calc(50%+227px)] lg:left-auto" dir="rtl">
                  {/* 1. Hide / Reveal Text Button */}
                  <button
                    onClick={() => setIsHidden(!isHidden)}
                    className="btn btn-circle w-10 h-10 min-h-0 btn-ghost text-base-content/80 hover:text-cyan-700 border border-base-300 bg-base-100 shadow-sm flex items-center justify-center"
                    aria-label={isHidden ? "إظهار النص" : "إخفاء النص"}
                  >
                    {isHidden ? (
                      <IoEyeOutline className="text-lg" />
                    ) : (
                      <IoEyeOffOutline className="text-lg" />
                    )}
                  </button>

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
      />
    </div>
  );
}
