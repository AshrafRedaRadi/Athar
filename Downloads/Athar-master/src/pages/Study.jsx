import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsStars } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import Sidebar from "../components/Sidebar";
import Dock from "../components/Dock";
import StudyHeader from "../components/StudyHeader";
import HadithCard from "../components/HadithCard";
import RecordButton from "../components/RecordButton";
import AudioPlayer from "../components/AudioPlayer";
import ExplanationPanel from "../components/ExplanationPanel";
import { hadithsService } from "../services/hadithsService";
import { booksService } from "../services/booksService";
import logo from "../assets/logo.png";
import user from "../assets/user.png";

// ─────────────────────────────────────────────
//  Mock Data for multiple hadiths (for prev/next navigation)
// ─────────────────────────────────────────────
/*
const MOCK_HADITHS = [
  {
    id: 1,
    bookTitle: "الأربعون النووية",
    hadithNumber: "الحديث الأول",
    title: "إنما الأعمال بالنيات",
    text: "عَنْ أَمِيرِ المُؤْمِنِينَ أَبِي حَفْصٍ عُمَرَ بْنِ الخَطَّابِ رَضِيَ اللهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ»",
    source: "رواه البخاري ومسلم",
    reader: "القارئ: أحمد النفيس",
    duration: "01:42",
    explanation: {
      videoTitle: "شرح الحديث الأول: إنما الأعمال بالنيات",
      videoDuration: "15:20 دقيقة",
      videoSpeaker: "الشيخ د. عبدالكريم الخضير",
      keyPoints: [
        "أهمية النية في قبول الأعمال",
        "الفرق بين نية العادة ونية العبادة",
        "سبب إيراد المصنفين لهذا الحديث في أوائل كتبهم",
      ],
      summary: "هذا الحديث قاعدة عظيمة من قواعد الإسلام، ومدار الإيمان عليه، فكل عمل لا يراد به وجه الله فهو باطل.",
      sections: [
        {
          title: "معنى النية لغة واصطلاحاً",
          content: "النية في اللغة هي القصد، وفي الاصطلاح هي عزم القلب على فعل العبادة تقرباً إلى الله تعالى."
        },
        {
          title: "قوله ﷺ \"إنما الأعمال بالنيات\"",
          content: "أي: إنما صحة الأعمال أو قبولها أو كمالها معتبر بالنيات، فلا يصح عمل شرعي إلا بنية."
        },
        {
          title: "وقوله ﷺ \"وإنما لكل امرئ ما نوى\"",
          content: "تأكيد للجملة الأولى، وبيان أن ثواب العامل على عمله بحسب نيته، فمن نوى بعمله وجه الله والدار الآخرة أثيب، ومن نوى به الدنيا أو الرياء لم يثب."
        },
        {
          title: "مقاصد النية",
          items: [
            "تمييز العبادات عن العادات (كتمييز الغسل للتبرد عن الغسل للجنابة).",
            "تمييز العبادات بعضها عن بعض (كتمييز صلاة الظهر عن صلاة العصر)."
          ]
        },
        {
          title: "الهجرة",
          content: "ثم ضرب النبي ﷺ مثلاً بالهجرة، وهي الانتقال من بلد الشرك إلى بلد الإسلام، فمن كانت هجرته لله ورسوله فثوابه عند الله، ومن كانت لغرض دنيوي فليس له إلا ما طلب."
        }
      ]
    }
  }
];
*/

// ─────────────────────────────────────────────
//  Custom hook for Web Speech API
// ─────────────────────────────────────────────
function useSpeechRecognition(hadithText) {
  const [spokenWords, setSpokenWords] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [recitationStopped, setRecitationStopped] = useState(false);
  const recognitionRef = useRef(null);

  const hadithWords = hadithText ? hadithText.split(" ") : [];

  /**
   * Strip tashkeel (diacritics) from Arabic text for comparison.
   */
  const stripTashkeel = useCallback((text) => {
    return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, "");
  }, []);

  /**
   * Compare two Arabic words ignoring tashkeel.
   */
  const compareWords = useCallback((spoken, expected) => {
    const cleanSpoken = stripTashkeel(spoken).trim();
    const cleanExpected = stripTashkeel(expected).trim();
    return cleanSpoken === cleanExpected;
  }, [stripTashkeel]);

  const startListening = useCallback(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      if (!lastResult.isFinal) return;

      const transcript = lastResult[0].transcript.trim();
      const spokenWordsList = transcript.split(" ").filter(w => w.length > 0);

      setSpokenWords(prev => {
        const currentIndex = prev.length;
        const newWords = [];

        for (let i = 0; i < spokenWordsList.length; i++) {
          const wordIndex = currentIndex + i;
          if (wordIndex >= hadithWords.length) break;

          const isCorrect = compareWords(spokenWordsList[i], hadithWords[wordIndex]);
          newWords.push({ word: spokenWordsList[i], correct: isCorrect });

          // If the last spoken word is wrong, check if full sentence is wrong
          if (!isCorrect) {
            // Check if all words so far are wrong
            const allWrong = [...prev, ...newWords].every(w => !w.correct);
            if (allWrong && [...prev, ...newWords].length >= 3) {
              setRecitationStopped(true);
            }
          }
        }

        return [...prev, ...newWords];
      });
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Restart if still supposed to be listening
      if (recognitionRef.current && isListening) {
        try {
          recognition.start();
        } catch (e) {
          // Already started
        }
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
      setSpokenWords([]);
      setRecitationStopped(false);
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  }, [hadithWords, compareWords, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const resetRecitation = useCallback(() => {
    setSpokenWords([]);
    setRecitationStopped(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    spokenWords,
    isListening,
    recitationStopped,
    startListening,
    stopListening,
    resetRecitation,
  };
}

// ─────────────────────────────────────────────
//  Study Page
// ─────────────────────────────────────────────
export default function Study() {
  const { bookId, hadithId } = useParams();
  const navigate = useNavigate();

  const [hadithsList, setHadithsList] = useState([]);
  const [currentHadithIndex, setCurrentHadithIndex] = useState(0);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("text"); // "text" | "video"
  const [isHidden, setIsHidden] = useState(true);

  const [isLoading, setIsLoading] = useState(true);

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
          hadithsService.getHadithsByBook(bookId),
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

  // Speech recognition
  const {
    spokenWords,
    isListening,
    recitationStopped,
    startListening,
    stopListening,
    resetRecitation,
  } = useSpeechRecognition(currentHadith?.text || "");

  // Toggle recording
  const handleRecordToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
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
        
        {/* Navigation - Sidebar (Desktop) / Dock (Mobile) */}
        <div className="hidden lg:block z-50">
          <Sidebar logo={logo} user={user} activePage="library" />
        </div>
        <div className="block lg:hidden z-50">
          <Dock activePage="library" />
        </div>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-12 px-4 sm:px-8 py-6" dir="rtl">
          <div className="max-w-4xl mx-auto min-h-full flex flex-col">
            
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <span className="loading loading-spinner loading-lg text-cyan-600 mb-4"></span>
                <p className="font-2 text-base-content/70">جاري استحضار الأحاديث الشريفة...</p>
              </div>
            ) : currentHadith ? (
              <>
                <StudyHeader 
                  userAvatar={user} 
                  bookId={bookId}
                  onExplanationToggle={() => setIsExplanationOpen(!isExplanationOpen)} 
                  isExplanationOpen={isExplanationOpen}
                  onPrevHadith={goToPrev}
                  onNextHadith={goToNext}
                  hasPrev={currentHadithIndex > 0}
                  hasNext={currentHadithIndex < hadithsList.length - 1}
                  hadithLabel={currentHadith.hadithNumber}
                  onToggleHide={() => setIsHidden(!isHidden)}
                />
               
                {/* Hadith Card Area */}
                <div className="flex-1 flex flex-col justify-center my-4">
                  <HadithCard 
                    bookTitle={currentHadith.bookTitle || "الأربعون النووية"}
                    hadithLabel={currentHadith.hadithNumber}
                    title={currentHadith.title}
                    text={currentHadith.text}
                    source={currentHadith.source}
                    mode={isListening ? "reciting" : "reading"}
                    spokenWords={spokenWords}
                    recitationStopped={recitationStopped}
                    isHidden={isHidden}
                    onToggleHide={() => setIsHidden(!isHidden)}
                  />
                </div>
               
                <RecordButton 
                  isRecording={isListening} 
                  onToggle={handleRecordToggle} 
                  onRecite={handleRecordToggle}
                  onListen={() => {
                    console.log("Listening mode selected");
                  }}
                />

               {/* Bottom Left Action Bar: 3 icon buttons beside AudioPlayer on left side (desktop) / bottom-left above Dock (mobile) */}
               <div className="fixed z-45 transition-all duration-300 flex items-center gap-2 sm:gap-2.5 bottom-20 left-6 lg:bottom-1.5 lg:right-[calc(50%+265px)] lg:left-auto" dir="rtl">
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

                 {/* 3. AI Helper Button */}
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

        {/* Audio Player */}
        <AudioPlayer 
          hadithLabel={currentHadith?.hadithNumber || ""} 
          reader={currentHadith?.reader || ""} 
          duration={currentHadith?.duration || ""} 
        />
      </div>

      {/* ── Explanation Panel (Drawer on Desktop / Bottom-sheet on Mobile) ── */}
      <ExplanationPanel 
        isOpen={isExplanationOpen} 
        onClose={() => setIsExplanationOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        explanation={currentHadith?.explanation}
      />
    </div>
  );
}
