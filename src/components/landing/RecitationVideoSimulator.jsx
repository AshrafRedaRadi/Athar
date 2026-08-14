import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IoPlaySharp, 
  IoPauseSharp, 
  IoReloadOutline, 
  IoMic, 
  IoSquare,
  IoCheckmarkCircle, 
  IoSparkles, 
  IoLibraryOutline,
  IoVolumeHighOutline
} from "react-icons/io5";

// سيناريو الفيديو بالخطوات والميلي ثانية
const SCRIPT = [
  { time: 0, text: "إِنَّمَا", status: "correct", narration: "جاري الاستماع للحديث..." },
  { time: 800, text: "الْأَعْمَالُ", status: "correct", narration: "نطق سليم ودقيق..." },
  { time: 1600, text: "بِالنِّيَّاتِ", status: "correct", narration: "تطابق تام مع المتن..." },
  { time: 2400, text: "وَإِنَّمَا", status: "correct", narration: "مستمر في التسميع..." },
  { time: 3200, text: "لِكُلِّ", status: "correct", narration: "الذكاء الاصطناعي يحلل الصوت..." },
  { time: 4000, text: "امْرِئٍ", status: "error", spoken: "شَخْصٍ", expected: "امْرِئٍ", narration: "تنبيه: تم رصد كلمة غير مطابقة!" },
  { time: 4800, text: "مَا", status: "correct", narration: "متابعة التسميع بعد التنبيه..." },
  { time: 5600, text: "نَوَى", status: "correct", narration: "اكتمل الحديث الشريف!" },
];

export default function RecitationVideoSimulator() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMicActive, setIsMicActive] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: "80%", y: "90%" });
  const [showBanner, setShowBanner] = useState(false);
  const totalDuration = 7000; // 7 ثوانٍ
  const requestRef = useRef();
  const startTimeRef = useRef();

  // تشغيل وإيقاف خط الزمن للفيديو
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(requestRef.current);
      return;
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp - currentTime;
      const elapsed = timestamp - startTimeRef.current;

      if (elapsed >= totalDuration) {
        // إعادة التشغيل تلقائياً مثل الفيديو المتكرر (Loop)
        startTimeRef.current = timestamp;
        setCurrentTime(0);
      } else {
        setCurrentTime(elapsed);
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying]);

  // إدارة أحداث الفيديو بناءً على الوقت المنقضي
  useEffect(() => {
    // حركة المؤشر للنقر على المايك
    if (currentTime < 600) {
      setCursorPos({ x: "70%", y: "85%" });
      setIsMicActive(false);
      setShowBanner(false);
    } else if (currentTime >= 600 && currentTime < 1000) {
      setCursorPos({ x: "50%", y: "88%" });
      setIsMicActive(true);
    } else if (currentTime >= 1000 && currentTime < 6200) {
      setCursorPos({ x: "85%", y: "92%" }); // إبعاد المؤشر أثناء التسميع
      setIsMicActive(true);
    } else if (currentTime >= 6200) {
      setIsMicActive(false);
      setShowBanner(true);
    }
  }, [currentTime]);

  const restartVideo = () => {
    startTimeRef.current = null;
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // استخراج الكلمة النشطة حالياً
  const activeWordIdx = SCRIPT.findIndex((w, i) => {
    const nextTime = SCRIPT[i + 1]?.time || 6000;
    return currentTime >= w.time + 800 && currentTime < nextTime + 800;
  });

  const currentNarration = SCRIPT.slice()
    .reverse()
    .find((s) => currentTime >= s.time + 800)?.narration || "اضغط على زر التسميع لبدء المحاكاة...";

  return (
    <div className="w-full max-w-xl mx-auto my-8 font-2 select-none" dir="rtl">
      
      {/* ── إطار الهاتف / مشغل الفيديو ── */}
      <div className="relative rounded-[2.5rem] bg-[#0c1f2a] p-3 sm:p-4 shadow-2xl border-4 border-cyan-900/40 overflow-hidden">
        
        {/* شريط الإشعارات العلوي للـ Mockup */}
        <div className="flex items-center justify-between px-6 py-2 text-white/50 text-[11px]">
          <span>09:41</span>
          <div className="w-16 h-3.5 bg-black/40 rounded-full mx-auto" />
          <div className="flex items-center gap-1.5">
            <IoSparkles className="text-[#C9953A]" />
            <span>AI Live Demo</span>
          </div>
        </div>

        {/* ── شاشة التطبيق الداخلية ── */}
        <div className="relative rounded-[2rem] bg-[#faf7f0] text-slate-800 p-4 sm:p-6 min-h-[420px] flex flex-col justify-between overflow-hidden shadow-inner border border-[#e8e2d2]">
          
          {/* خلفية مائية خفيفة */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

          {/* شريط الأدوات العلوي */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-[#e8e2d2]">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-[#286a89] bg-cyan-700/10 px-2.5 py-1 rounded-lg">
                <IoLibraryOutline /> الأربعون النووية
              </span>
            </div>
            <span className="bg-[#286a89] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
              الحديث ١
            </span>
          </div>

          {/* نص الحديث وتفاعل التسميع اللحظي */}
          <div className="relative z-10 my-auto text-center py-4">
            <h4 className="text-xs text-slate-400 font-bold mb-2">متن الحديث الشريف</h4>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 px-2 py-4 bg-white/70 rounded-2xl border border-[#e8e2d2]/70 shadow-xs min-h-[120px]">
              {SCRIPT.map((item, idx) => {
                const isPassed = currentTime >= item.time + 800;
                const isCurrent = idx === activeWordIdx && isMicActive;
                const isError = item.status === "error" && isPassed;
                const isCorrect = item.status === "correct" && isPassed;

                return (
                  <div key={idx} className="relative inline-flex flex-col items-center">
                    <span
                      className={`text-xl sm:text-2xl font-bold px-2 py-0.5 rounded-lg transition-all duration-300 ${
                        isCurrent
                          ? "scale-110 bg-[#286a89] text-white shadow-md"
                          : isCorrect
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : isError
                          ? "bg-rose-100 text-rose-800 border border-rose-300 line-through"
                          : "text-slate-700 opacity-60"
                      }`}
                    >
                      {item.text}
                    </span>

                    {/* تنبيه الخطأ الذكي */}
                    {isError && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-7 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap z-20 flex items-center gap-1"
                      >
                        <span>نطقت: "{item.spoken}"</span>
                        <span className="text-emerald-200 underline">← {item.expected}</span>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* شريط الإرشاد الذكي المتغير */}
            <div className="mt-3 text-xs font-semibold text-[#286a89] flex items-center justify-center gap-1.5">
              {isMicActive && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
              <span>{currentNarration}</span>
            </div>
          </div>

          {/* زر التسميع وموجات الصوت في الواجهة */}
          <div className="relative z-10 flex flex-col items-center justify-center pt-2 border-t border-[#e8e2d2]">
            <div className="relative flex items-center justify-center">
              {isMicActive && (
                <>
                  <div className="absolute w-16 h-16 rounded-full bg-rose-500/20 animate-ping" />
                  <div className="absolute w-12 h-12 rounded-full bg-rose-500/30 animate-pulse" />
                </>
              )}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${
                  isMicActive ? "bg-rose-600 scale-105" : "bg-[#286a89]"
                }`}
              >
                {isMicActive ? <IoSquare className="text-base" /> : <IoMic className="text-xl" />}
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-500 mt-1.5">
              {isMicActive ? "جاري التسميع والتصحيح..." : "اضغط للبدء"}
            </span>
          </div>

          {/* شارة إتمام الحفظ عند نهاية الفيديو */}
          <AnimatePresence>
            {showBanner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-4 top-1/3 bg-[#0f2633]/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-cyan-500/30 text-center z-30 flex flex-col items-center gap-2"
              >
                <IoCheckmarkCircle className="text-emerald-400 text-3xl" />
                <h5 className="font-bold text-sm">أحسنت! تم تقييم التسميع بنجاح 🎉</h5>
                <p className="text-[11px] text-white/70">الدقة: 92% — تم تصحيح كلمة واحدة تلقائياً</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── مؤشر الفأرة التفاعلي التلقائي (Virtual Cursor) ── */}
          {showCursor && (
            <motion.div
              animate={{ left: cursorPos.x, top: cursorPos.y }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute z-40 pointer-events-none"
            >
              <div className="relative">
                <svg className="w-6 h-6 text-slate-900 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.5 3.79l13.1 9.4-5.8 1.4 3.7 6.4-2.4 1.4-3.7-6.4-4.9 4.2V3.79z" />
                </svg>
                {currentTime >= 600 && currentTime <= 900 && (
                  <span className="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-cyan-400/50 animate-ping" />
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── شريط تحكم الفيديو السفلي (Video Player Bar) ── */}
        <div className="mt-3 px-3 flex flex-col gap-1.5">
          {/* شريط التقدم */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#C9953A] to-cyan-400 h-full transition-all duration-75"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            />
          </div>

          {/* أزرار التحكم */}
          <div className="flex items-center justify-between text-white/80 text-xs pt-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
                title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
              >
                {isPlaying ? <IoPauseSharp className="text-base" /> : <IoPlaySharp className="text-base" />}
              </button>

              <button
                onClick={restartVideo}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
                title="إعادة التشغيل"
              >
                <IoReloadOutline className="text-sm" />
              </button>

              <span className="font-mono text-[10px] text-white/50">
                00:0{Math.floor(currentTime / 1000)} / 00:07
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-[#C9953A] font-semibold">
              <IoVolumeHighOutline className="text-sm" />
              <span>محاكاة مباشرة</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}