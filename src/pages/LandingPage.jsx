import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  IoMic,
  IoSquare,
  IoCheckmarkCircle,
  IoLibraryOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoBookOutline,
  IoReaderOutline,
  IoArrowBack
} from 'react-icons/io5';
import logoImg from '../assets/logo.png';
import mosqueSvg from '../assets/mosque.svg';
import { booksService } from '../services/booksService';
import { hadithsService } from '../services/hadithsService';
import { usersService } from '../services/usersService';

/* ─────────────────────────────────────────────
   Islamic Star Pattern Background
───────────────────────────────────────────────── */
function IslamicStarPattern({ opacity = 0.06, color = '#ffffff', size = 80 }) {
  const star = `
    M ${size / 2},0
    L ${size * 0.59},${size * 0.35}
    L ${size},${size * 0.15}
    L ${size * 0.73},${size * 0.46}
    L ${size},${size / 2}
    L ${size * 0.73},${size * 0.54}
    L ${size},${size * 0.85}
    L ${size * 0.59},${size * 0.65}
    L ${size / 2},${size}
    L ${size * 0.41},${size * 0.65}
    L 0,${size * 0.85}
    L ${size * 0.27},${size * 0.54}
    L 0,${size / 2}
    L ${size * 0.27},${size * 0.46}
    L 0,${size * 0.15}
    L ${size * 0.41},${size * 0.35}
    Z
  `;
  const id = `star-pattern-${size}`;
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <path d={star} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Arabesque Divider
───────────────────────────────────────────────── */
function ArabesqueDivider({ color = '#C9953A' }) {
  return (
    <div className="flex items-center justify-center gap-3 my-2">
      <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(to left, transparent, ${color})` }} />
      <svg width="32" height="16" viewBox="0 0 32 16" fill={color}>
        <path d="M16,0 C16,0 28,8 32,8 C28,8 16,16 16,16 C16,16 4,8 0,8 C4,8 16,0 16,0 Z" />
      </svg>
      <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(to right, transparent, ${color})` }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Animated Counter Hook
───────────────────────────────────────────────── */
function useCounter(target, duration = 1800, inView = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, inView]);
  return count;
}

/* ─────────────────────────────────────────────
   Scroll Reveal Wrapper
───────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Mosque Background (AI Vector Illustration)
───────────────────────────────────────────────── */
function MosqueBackground({ className = '' }) {
  return (
    <div className={`w-full overflow-hidden pointer-events-none leading-none select-none flex items-end justify-center ${className}`}>
      <img
        src={mosqueSvg}
        alt=""
        className="w-full h-[220px] sm:h-[300px] md:h-[400px] lg:h-[480px] object-cover object-bottom block select-none pointer-events-none"
        style={{
          transform: 'translateY(2px)',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Geometric Badge
───────────────────────────────────────────────── */
function GeomBadge({ children, className = '' }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" aria-hidden>
        <polygon
          points="50,2 92,25 98,70 70,98 30,98 2,70 8,25"
          fill="rgba(201,149,58,0.15)"
          stroke="rgba(201,149,58,0.5)"
          strokeWidth="1.5"
        />
      </svg>
      <span className="relative z-10">{children}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   🎥 محاكي التسميع الذكي
───────────────────────────────────────────────── */
const SCRIPT_PHASE_1 = [
  { time: 0, text: 'إِنَّمَا', status: 'correct', narration: 'وضع القراءة: جاري الاستماع للحديث...' },
  { time: 600, text: 'الْأَعْمَالُ', status: 'correct', narration: 'نطق سليم وتطابق فوري...' },
  { time: 1200, text: 'بِالنِّيَّاتِ', status: 'correct', narration: 'تطابق تام مع المتن...' },
  { time: 1800, text: 'وَإِنَّمَا', status: 'correct', narration: 'مستمر في التسميع...' },
  { time: 2400, text: 'لِكُلِّ', status: 'correct', narration: 'الذكاء الاصطناعي يحلل الصوت...' },
  { time: 3000, text: 'امْرِئٍ', status: 'error', spoken: 'شَخْصٍ', expected: 'امْرِئٍ', narration: 'تنبيه: تم رصد كلمة غير مطابقة وتصحيحها!' },
  { time: 3700, text: 'مَا', status: 'correct', narration: 'متابعة التسميع...' },
  { time: 4300, text: 'نَوَى', status: 'correct', narration: 'اكتمل الحديث الشريف!' },
];

const SCRIPT_PHASE_2 = [
  { time: 0, text: 'إِنَّمَا', status: 'correct', narration: 'وضع الغيب: الكلمات تظهر فور نطقها الصحيح!' },
  { time: 600, text: 'الْأَعْمَالُ', status: 'correct', narration: 'إتقان تام للكلمات المخفية...' },
  { time: 1200, text: 'بِالنِّيَّاتِ', status: 'correct', narration: 'استرسال غيبي متقن...' },
  { time: 1800, text: 'وَإِنَّمَا', status: 'correct', narration: 'ظهور الكلمات تباعاً...' },
  { time: 2400, text: 'لِكُلِّ', status: 'correct', narration: 'تأكيد الحفظ بالذاكرة...' },
  { time: 3000, text: 'امْرِئٍ', status: 'correct', spoken: 'امْرِئٍ', expected: 'امْرِئٍ', narration: 'نطق الكلمة بدقة من الحفظ...' },
  { time: 3600, text: 'مَا', status: 'correct', narration: 'اقتراب إتمام التسميع الغيبي...' },
  { time: 4200, text: 'نَوَى', status: 'correct', narration: 'ما شاء الله! حفظ متقن 100% غيباً!' },
];

function RecitationVideoSimulator() {
  const [currentTime, setCurrentTime] = useState(0);
  const [phase, setPhase] = useState(1);
  const [isHidden, setIsHidden] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: '70%', y: '85%' });
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState('');

  const totalDuration = 14500;
  const requestRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp - currentTime;
      const elapsed = timestamp - startTimeRef.current;

      if (elapsed >= totalDuration) {
        startTimeRef.current = timestamp;
        setCurrentTime(0);
      } else {
        setCurrentTime(elapsed);
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  useEffect(() => {
    if (currentTime < 500) {
      setPhase(1);
      setIsHidden(false);
      setCursorPos({ x: '70%', y: '85%' });
      setIsMicActive(false);
      setShowBanner(false);
    } else if (currentTime >= 500 && currentTime < 900) {
      setCursorPos({ x: '50%', y: '88%' });
      setIsMicActive(true);
    } else if (currentTime >= 900 && currentTime < 4900) {
      setCursorPos({ x: '88%', y: '92%' });
      setIsMicActive(true);
    } else if (currentTime >= 4900 && currentTime < 6400) {
      setIsMicActive(false);
      setBannerText('تم التسميع! الآن سنجرب التسميع غيباً...');
      setShowBanner(true);
      setCursorPos({ x: '35%', y: '88%' });
    } else if (currentTime >= 6400 && currentTime < 7200) {
      setPhase(2);
      setShowBanner(false);
      setIsHidden(true);
      setCursorPos({ x: '35%', y: '88%' });
    } else if (currentTime >= 7200 && currentTime < 7800) {
      setCursorPos({ x: '50%', y: '88%' });
      setIsMicActive(true);
    } else if (currentTime >= 7800 && currentTime < 12500) {
      setCursorPos({ x: '88%', y: '92%' });
      setIsMicActive(true);
    } else if (currentTime >= 12500) {
      setIsMicActive(false);
      setBannerText('أحسنت! تم إتقان الحفظ غيباً بنسبة 100% 🎉');
      setShowBanner(true);
    }
  }, [currentTime]);

  const currentScript = phase === 1 ? SCRIPT_PHASE_1 : SCRIPT_PHASE_2;
  const phaseTime = phase === 1 ? currentTime - 500 : currentTime - 7800;

  const activeWordIdx = currentScript.findIndex((w, i) => {
    const nextTime = currentScript[i + 1]?.time || 5000;
    return phaseTime >= w.time && phaseTime < nextTime;
  });

  const currentNarration = currentScript.slice()
    .reverse()
    .find((s) => phaseTime >= s.time)?.narration || (phase === 1 ? 'جاري بدء التسميع...' : 'جاري التسميع غيباً...');

  return (
    <div className="w-full max-w-xl mx-auto my-6 font-2 select-none" dir="rtl">
      <div className="relative rounded-[2.5rem] bg-[#0c1f2a] p-3 sm:p-4 shadow-2xl border border-[#337fa1]/30 overflow-hidden">

        {/* Screen Content */}
        <div className="relative rounded-[2rem] bg-[#faf7f0] text-slate-800 p-4 sm:p-6 min-h-[390px] flex flex-col justify-between overflow-hidden shadow-inner border border-[#e8e2d2]">

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-[#e8e2d2]">
            <span className="flex items-center gap-1 text-xs font-bold text-[#286a89] bg-[#286a89]/10 px-2.5 py-1 rounded-lg">
              <IoLibraryOutline /> الأربعون النووية
            </span>

            <span className="bg-[#286a89] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
              الحديث ١
            </span>
          </div>

          {/* Area of Hadith Recitation */}
          <div className="relative z-10 my-auto text-center py-2">
            <h4 className="text-xs text-slate-400 font-bold mb-2">
              {isHidden ? 'اختبار الحفظ الغيبي (الكلمات تظهر عند النطق)' : 'متن الحديث الشريف'}
            </h4>

            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 px-2 py-4 bg-white/80 rounded-2xl border border-[#e8e2d2]/70 shadow-xs min-h-[110px]">
              {currentScript.map((item, idx) => {
                const isPassed = phaseTime >= item.time;
                const isCurrent = idx === activeWordIdx && isMicActive;
                const isError = item.status === 'error' && isPassed;
                const isCorrect = item.status === 'correct' && isPassed;
                const isHiddenWord = isHidden && !isPassed;

                return (
                  <div key={idx} className="relative inline-flex flex-col items-center">
                    <span
                      className={`text-xl sm:text-2xl font-bold px-2.5 py-0.5 rounded-lg transition-all duration-300 ${isHiddenWord
                          ? 'bg-slate-300/80 text-transparent select-none rounded-md blur-[2px]'
                          : isCurrent
                            ? 'scale-110 bg-[#286a89] text-white shadow-md'
                            : isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isError
                                ? 'bg-rose-100 text-rose-800 border border-rose-300 line-through'
                                : 'text-slate-700 opacity-60'
                        }`}
                    >
                      {item.text}
                    </span>

                    {isError && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-6 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap z-20 flex items-center gap-1"
                      >
                        <span>نطقت: "{item.spoken}"</span>
                        <span className="text-emerald-200 underline">← {item.expected}</span>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-xs font-semibold text-[#286a89] flex items-center justify-center gap-1.5">
              {isMicActive && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
              <span>{currentNarration}</span>
            </div>
          </div>

          {/* لوحة التحكم السفلية */}
          <div className="relative z-10 flex flex-col items-center justify-center pt-2 border-t border-[#e8e2d2]">
            <div className="relative flex items-center justify-center gap-3">

              {/* زر المايك */}
              <div className="relative flex items-center justify-center">
                {isMicActive && (
                  <>
                    <div className="absolute w-16 h-16 rounded-full bg-rose-500/20 animate-ping" />
                    <div className="absolute w-12 h-12 rounded-full bg-rose-500/30 animate-pulse" />
                  </>
                )}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${isMicActive ? 'bg-rose-600 scale-105' : 'bg-[#286a89]'
                    }`}
                >
                  {isMicActive ? <IoSquare className="text-base" /> : <IoMic className="text-xl" />}
                </div>
              </div>

              {/* زر العين بجانب المايك */}
              <div
                className={`w-9 h-9 rounded-full border shadow-sm flex items-center justify-center transition-all duration-300 ${isHidden
                    ? 'bg-[#286a89] border-[#286a89] text-white shadow-md scale-105'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                title={isHidden ? 'إظهار النص' : 'إخفاء النص غيباً'}
              >
                {isHidden ? <IoEyeOffOutline className="text-lg" /> : <IoEyeOutline className="text-lg" />}
              </div>

            </div>

            <span className="text-[11px] font-bold text-slate-500 mt-1.5">
              {isMicActive ? (isHidden ? 'جاري التسميع غيباً...' : 'جاري التسميع والتصحيح...') : 'اضغط للبدء'}
            </span>
          </div>

          {/* Toast Banner */}
          <AnimatePresence>
            {showBanner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-4 top-1/3 bg-[#0f2633]/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-[#337fa1]/30 text-center z-30 flex flex-col items-center gap-1.5"
              >
                <IoCheckmarkCircle className="text-emerald-400 text-3xl" />
                <h5 className="font-bold text-sm leading-relaxed">{bannerText}</h5>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Virtual Pointer Cursor */}
          <motion.div
            animate={{ left: cursorPos.x, top: cursorPos.y }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute z-40 pointer-events-none"
          >
            <div className="relative">
              <svg className="w-6 h-6 text-slate-900 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.5 3.79l13.1 9.4-5.8 1.4 3.7 6.4-2.4 1.4-3.7-6.4-4.9 4.2V3.79z" />
              </svg>
              {((currentTime >= 500 && currentTime <= 800) || (currentTime >= 6400 && currentTime <= 6800) || (currentTime >= 7200 && currentTime <= 7500)) && (
                <span className="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-[#337fa1]/50 animate-ping" />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   📚 معرض الكتب الحديثية (Featured Books Data)
───────────────────────────────────────────────── */
const FEATURED_BOOKS = [
  {
    id: 1,
    title: 'صحيح البخاري',
    author: 'الإمام محمد بن إسماعيل البخاري',
    count: '٧,٥٦٣',
    badge: 'أصح الكتب',
    gradient: 'from-[#194054] via-[#235870] to-[#123140]',
    accent: '#C9953A',
    description: 'أصح كتاب بعد كتاب الله عز وجل، مبوّب على الأبواب الفقهية والإيمانية بدقة بالغة.',
  },
  {
    id: 2,
    title: 'صحيح مسلم',
    author: 'الإمام مسلم بن الحجاج النيسابوري',
    count: '٧,٥٠٠',
    badge: 'الصحيح المتقن',
    gradient: 'from-[#1e4d63] via-[#2d6c88] to-[#163848]',
    accent: '#337fa1',
    description: 'يمتاز بجمع طرق الحديث وألفاظه في موضع واحد مع حسن الصياغة والترتيب العلمي.',
  },
  {
    id: 3,
    title: 'الأربعون النووية',
    author: 'الإمام يحيى بن شرف النووي',
    count: '٤٢',
    badge: 'أساس الدين',
    gradient: 'from-[#224b42] via-[#2e685c] to-[#173730]',
    accent: '#34d399',
    description: 'أحاديث جامعة تدور عليها قواعد الإسلام وأصول الشريعة، نقطة البداية المثالية لكل حافظ.',
  },
  {
    id: 4,
    title: 'رياض الصالحين',
    author: 'الإمام يحيى بن شرف النووي',
    count: '١,٩٠٠',
    badge: 'منهاج السالكين',
    gradient: 'from-[#3a3525] via-[#524a33] to-[#262217]',
    accent: '#C9953A',
    description: 'زاد المسلم اليومي في الأخلاق، العبادات، والآداب النبوية لتهذيب النفس والسلوك.',
  },
];

function FeaturedBooksSection() {
  return (
    <section id="books" className="relative py-20 px-5 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0f2633 0%, #132e3d 100%)' }}>
      <IslamicStarPattern opacity={0.04} color="#C9953A" size={90} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <Reveal className="text-center mb-3">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-bold font-2 border border-[#C9953A]/40 text-[#e4b25e] bg-[#C9953A]/10">
            مكتبة السنة النبوية
          </span>
        </Reveal>
        <Reveal delay={0.1} className="text-center mb-2">
          <h2 className="text-3xl md:text-4xl font-bold font-1 text-white">
            أمّهات كتب الحديث بين يديك
          </h2>
        </Reveal>
        <Reveal delay={0.15} className="text-center mb-12">
          <ArabesqueDivider />
        </Reveal>

        {/* شبكة بطاقات الكتب */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_BOOKS.map((book, idx) => (
            <Reveal key={book.id} delay={idx * 0.1}>
              <div className="group relative rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#C9953A]/50 p-5 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col justify-between h-full overflow-hidden">

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at top right, rgba(201,149,58,0.15), transparent 70%)' }} />

                <div>
                  {/* غلاف الكتاب المصغر */}
                  <div className={`relative h-44 w-full rounded-2xl bg-gradient-to-br ${book.gradient} p-4 shadow-lg border border-white/15 flex flex-col justify-between overflow-hidden mb-5 transition-transform duration-500 group-hover:scale-[1.02]`}>

                    <div className="absolute -right-6 -bottom-6 w-28 h-28 opacity-10 pointer-events-none">
                      <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                        <polygon points="50,2 92,25 98,70 70,98 30,98 2,70 8,25" />
                      </svg>
                    </div>

                    <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/25 border-l border-white/10" />

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 text-white/90 bg-black/20">
                        {book.badge}
                      </span>
                      <IoBookOutline className="text-white/40 text-lg" />
                    </div>

                    <div className="text-center my-auto px-2">
                      <h3 className="font-1 font-bold text-lg sm:text-xl text-white tracking-wide leading-snug drop-shadow-md">
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-white/70 font-2 mt-1 truncate">
                        {book.author}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-white/90 bg-black/30 py-1 rounded-xl border border-white/10">
                      <IoReaderOutline style={{ color: book.accent }} />
                      <span>{book.count} حديث نبوي</span>
                    </div>
                  </div>

                  <p className="text-xs text-white/60 font-2 leading-relaxed mb-4">
                    {book.description}
                  </p>
                </div>

                {/* زر البدء في الحفظ */}
                <Link
                  to="/signup"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold font-2 text-white bg-[#286a89] hover:bg-[#337fa1] border border-transparent hover:shadow-[0_4px_15px_rgba(51,127,161,0.3)] transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                >
                  <span>ابدأ الحفظ الآن</span>
                  <IoArrowBack className="text-sm transition-transform group-hover/btn:-translate-x-1" />
                </Link>

              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FAQ Component
───────────────────────────────────────────────── */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = [
    {
      q: "كيف يعمل نظام التسميع بالذكاء الاصطناعي؟",
      a: "يقوم النظام بتحليل نطقك الصوتي ومقارنته بالمتن الصحيح للحديث لحظياً، وتنبيهك لأي خطأ في الكلمات أو التشكيل فور النطق."
    },
    {
      q: "هل يمكنني اختبار حفظي مع إخفاء الكلمات تماماً؟",
      a: "نعم! يمكنك الضغط على زر العين بجانب المايكروفون لطمس النص بالكامل، وتبدأ الكلمات بالظهور والتكشف تلقائياً فقط عند نطقها الصحيح لتتأكد من إتقانك."
    },
    {
      q: "هل المنصة مجانية للاستخدام؟",
      a: "نعم، يمكنك إنشاء حساب والبدء في حفظ الأحاديث الشريفة ومراجعتها وتسميعها مجاناً بالكامل."
    },
    {
      q: "ما هي كتب الحديث المتوفرة حالياً في المنصة؟",
      a: "تشمل المنصة الأربعين النووية، صحيح البخاري، صحيح مسلم، ورياض الصالحين، مع إضافة مستمرة لكتب السنة الأخرى."
    },
  ];

  return (
    <section id="faq" className="relative py-20 px-5 max-w-4xl mx-auto">
      <Reveal className="text-center mb-3">
        <p className="text-sm tracking-widest uppercase font-2" style={{ color: '#C9953A' }}>إجابات سريعة</p>
      </Reveal>
      <Reveal delay={0.1} className="text-center mb-2">
        <h2 className="text-3xl md:text-4xl font-bold font-1 text-white">الأسئلة الشائعة</h2>
      </Reveal>
      <Reveal delay={0.15} className="text-center mb-10">
        <ArabesqueDivider />
      </Reveal>

      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all hover:border-white/20">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-5 text-right flex justify-between items-center text-white font-semibold font-2 cursor-pointer"
              >
                <span className="text-base sm:text-lg">{faq.q}</span>
                <span className="text-[#C9953A] text-2xl font-bold transition-transform duration-300">
                  {openIndex === i ? '−' : '+'}
                </span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 text-sm sm:text-base text-white/70 font-2 leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Features Data
───────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
        <circle cx="20" cy="20" r="18" stroke="#C9953A" strokeWidth="1.5" />
        <path d="M12,20 Q20,10 28,20 Q20,30 12,20 Z" fill="#C9953A" opacity="0.3" />
        <path d="M20,12 L20,28 M14,16 L26,24 M14,24 L26,16" stroke="#C9953A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'تسميع بالذكاء الاصطناعي',
    desc: 'رقّب حفظك لحظةً بلحظة عبر محرك التسميع الذكي الذي يكتشف أخطاءك ويصحّحها فور النطق.',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
        <circle cx="20" cy="20" r="18" stroke="#C9953A" strokeWidth="1.5" />
        <rect x="12" y="14" width="16" height="2" rx="1" fill="#C9953A" />
        <rect x="12" y="19" width="12" height="2" rx="1" fill="#C9953A" opacity="0.7" />
        <rect x="12" y="24" width="9" height="2" rx="1" fill="#C9953A" opacity="0.4" />
        <path d="M30,26 L34,30" stroke="#C9953A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="29" cy="25" r="4" stroke="#C9953A" strokeWidth="1.5" />
      </svg>
    ),
    title: 'خطط مراجعة مخصّصة',
    desc: 'خوارزمية التكرار المتباعد تبني لك جدولاً أسبوعياً يتكيّف مع مستواك ووقتك تلقائياً.',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
        <circle cx="20" cy="20" r="18" stroke="#C9953A" strokeWidth="1.5" />
        <path d="M14,28 L14,18 Q14,12 20,12 Q26,12 26,18 L26,28" stroke="#C9953A" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M17,22 L23,22 L23,28 L17,28 Z" fill="#C9953A" opacity="0.3" stroke="#C9953A" strokeWidth="1.2" />
      </svg>
    ),
    title: 'مكتبة حديثية شاملة',
    desc: 'تصفّح آلاف الأحاديث مع شروحات موثّقة وتسجيلات صوتية بشرية لضمان النطق السليم.',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
        <circle cx="20" cy="20" r="18" stroke="#C9953A" strokeWidth="1.5" />
        <path d="M20,10 L23,17 L31,17 L25,22 L27,30 L20,25 L13,30 L15,22 L9,17 L17,17 Z" fill="#C9953A" opacity="0.3" stroke="#C9953A" strokeWidth="1.2" />
      </svg>
    ),
    title: 'إنجازات وتحفيز',
    desc: 'اكسب شارات الإنجاز وتابع تقدّمك اليومي ببصرية جميلة تشعل فيك الحماس للمواصلة.',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
        <circle cx="20" cy="20" r="18" stroke="#C9953A" strokeWidth="1.5" />
        <path d="M13,20 Q13,14 20,14 Q27,14 27,20 L27,26 L13,26 Z" fill="#C9953A" opacity="0.2" />
        <circle cx="20" cy="19" r="4" fill="#C9953A" opacity="0.5" />
        <path d="M15,30 Q20,26 25,30" stroke="#C9953A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'واجهة عربية أصيلة',
    desc: 'تجربة مصمَّمة من الألف إلى الياء للقارئ العربي، بخطوط أنيقة وتوجيه من اليمين لليسار.',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
        <circle cx="20" cy="20" r="18" stroke="#C9953A" strokeWidth="1.5" />
        <path d="M12,24 L16,20 L20,22 L24,16 L28,18" stroke="#C9953A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="28" cy="18" r="2" fill="#C9953A" />
      </svg>
    ),
    title: 'إحصائيات تفصيلية',
    desc: 'رصيد متكامل لإنجازاتك: عدد الأحاديث المحفوظة، سلاسل الأيام، ومعدل الدقة.',
  },
];

const STEPS = [
  { num: '١', title: 'أنشئ حسابك', desc: 'سجّل مجاناً في ثوانٍ باستخدام بريدك الإلكتروني أو حسابك في Google.' },
  { num: '٢', title: 'اختر كتاب الحديث', desc: 'تصفّح مكتبتنا الشاملة وابدأ من حيث يناسب مستواك.' },
  { num: '٣', title: 'سمّع وتتبّع تقدّمك', desc: 'استخدم محرك التسميع الذكي ليقيّم حفظك ويرشدك نحو الإتقان.' },
];

function StatCard({ value, suffix, label, inView }) {
  const count = useCounter(value, 1600, inView);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-4xl md:text-5xl font-bold font-1" style={{ color: '#C9953A' }}>
        {count.toLocaleString('ar-EG')}{suffix}
      </span>
      <span className="text-sm md:text-base text-white/70 font-2">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function LandingPage() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  const [hadithsCount, setHadithsCount] = useState(42);
  const [booksCount, setBooksCount] = useState(1);
  const [studentsCount, setStudentsCount] = useState(1240);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDynamicCounts() {
      try {
        const [hCount, bCount, sCount] = await Promise.all([
          typeof hadithsService?.getHadithsCount === 'function' ? hadithsService.getHadithsCount() : Promise.resolve(null),
          typeof booksService?.getBooksCount === 'function' ? booksService.getBooksCount() : Promise.resolve(null),
          typeof usersService?.getStudentsCount === 'function' ? usersService.getStudentsCount() : Promise.resolve(null),
        ]);

        if (!isMounted) return;

        if (typeof hCount === 'number' && hCount > 0) {
          setHadithsCount(hCount);
        }
        if (typeof bCount === 'number' && bCount > 0) {
          setBooksCount(bCount);
        }
        if (typeof sCount === 'number' && sCount > 0) {
          setStudentsCount(sCount);
        }
      } catch (err) {
        console.warn('Could not load dynamic stats for landing page:', err);
      }
    }

    loadDynamicCounts();
    return () => {
      isMounted = false;
    };
  }, []);

  const statsList = [
    { value: hadithsCount, suffix: '', label: 'حديث نبوي شريف' },
    { value: booksCount, suffix: '', label: 'كتاب حديث' },
    { value: studentsCount, suffix: '+', label: 'الطلاب' },
    { value: 100, suffix: '%', label: 'مجاني للبدء' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToSection = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const navOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const navLinks = [
    { name: 'تجربة التسميع', targetId: '#demo' },
    { name: 'مكتبة الكتب', targetId: '#books' },
    { name: 'المميزات', targetId: '#features' },
    { name: 'كيف تعمل؟', targetId: '#how-it-works' },
    { name: 'الأسئلة الشائعة', targetId: '#faq' },
  ];

  return (
    <div dir="rtl" className="min-h-screen w-full overflow-x-hidden font-2" style={{ backgroundColor: '#0f2633' }}>

      {/* ─── NAVBAR ─── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 px-5 md:px-10 ${isScrolled
            ? 'py-2.5 bg-[#0f2633]/90 backdrop-blur-md shadow-lg border-b border-white/10'
            : 'py-4 bg-transparent'
          }`}
        style={!isScrolled ? { background: 'linear-gradient(to bottom, rgba(15,38,51,0.95) 0%, transparent 100%)' } : {}}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <a
            href="#top"
            onClick={scrollToTop}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <img src={logoImg} alt="أثر" className="h-9 w-9 object-contain transition-transform group-hover:scale-105" />
            <span className="text-xl font-bold font-1 text-white tracking-wide">أثر</span>
          </a>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.targetId}
                onClick={(e) => scrollToSection(e, link.targetId)}
                className="text-sm font-2 text-white/75 hover:text-[#C9953A] transition-colors relative py-1 hover:font-bold cursor-pointer"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors font-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-white/20 hover:border-[#337fa1]/50 hover:bg-[#337fa1]/10"
            >
              تسجيل الدخول
            </Link>
            <Link
              to="/signup"
              className="text-xs sm:text-sm font-bold font-2 px-3.5 sm:px-4 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_2px_12px_rgba(201,149,58,0.3)] hover:shadow-[0_4px_18px_rgba(201,149,58,0.45)]"
              style={{ background: 'linear-gradient(to left, #C9953A, #e4b25e)', color: '#0f2633' }}
            >
              ابدأ مجاناً
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white/90 hover:text-[#C9953A] p-1 text-2xl cursor-pointer transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <IoCloseOutline /> : <IoMenuOutline />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-[#0f2633]/98 backdrop-blur-xl border-t border-white/10 mt-2.5 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.targetId}
                  onClick={(e) => scrollToSection(e, link.targetId)}
                  className="text-sm font-2 text-white/80 hover:text-[#C9953A] py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pb-32 md:pb-36"
        style={{ background: 'linear-gradient(160deg, #1a3f52 0%, #23566e 45%, #0f2633 100%)' }}>

        <IslamicStarPattern opacity={0.07} color="#ffffff" size={90} />

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(201,149,58,0.12) 0%, transparent 70%)' }} />

        {/* Hero content */}
        <div className="relative z-20 flex flex-col items-center text-center px-5 pt-28 pb-10 max-w-3xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-9 px-5 py-2 rounded-full text-2x font-2 border"
            style={{ background: 'rgba(201,149,58,0.12)', borderColor: 'rgba(201,149,58,0.4)', color: '#e4b25e' }}>
            قال رسول الله ﷺ ﴿بلّغوا عني ولو آية﴾
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <img src={logoImg} alt="أثر" className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-lg" />
            <h1 className="text-6xl md:text-8xl font-bold font-1 text-white tracking-widest"
              style={{ textShadow: '0 0 40px rgba(201,149,58,0.3)' }}>
              أثر
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl font-1 font-semibold text-white/90 mb-3 leading-relaxed"
          >
            منصّة الحفظ الذكي للأحاديث النبوية
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="text-base md:text-lg text-white/60 mb-10 max-w-xl leading-loose"
          >
            احفظ السنة النبوية بأسلوب علمي حديث، مع الذكاء الاصطناعي الذي يرافقك في كل خطوة نحو الإتقان.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative z-30 flex items-center gap-4 flex-wrap justify-center mt-2"
          >
            <Link
              to="/signup"
              className="group relative px-8 py-3.5 rounded-full text-base font-bold font-2 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden flex items-center gap-2 shadow-[0_4px_20px_rgba(201,149,58,0.25)] hover:shadow-[0_4px_25px_rgba(201,149,58,0.4)]"
              style={{ background: 'linear-gradient(to left, #C9953A, #e4b25e)', color: '#0f2633' }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">أنشئ حسابك مجاناً</span>
              <span className="relative z-10 transition-transform duration-300 group-hover:-translate-x-1">←</span>
            </Link>

            <a
              href="#demo"
              onClick={(e) => scrollToSection(e, '#demo')}
              className="group px-7 py-3.5 rounded-full text-base font-semibold font-2 border border-white/15 bg-white/[0.03] text-white hover:bg-[#286a89]/20 hover:border-[#337fa1]/50 transition-all duration-300 flex items-center gap-2.5 backdrop-blur-sm"
            >
              <IoMic className="text-lg text-white/50 group-hover:text-[#337fa1] transition-colors duration-300" />
              <span>جرب التسميع الذكي</span>
            </a>
          </motion.div>
        </div>

        <div className="absolute bottom-0 inset-x-0 z-0 pointer-events-none w-full">
          <MosqueBackground />
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section ref={statsRef} className="relative py-16 overflow-hidden"
        style={{ background: '#0f2633' }}>
        <IslamicStarPattern opacity={0.04} color="#C9953A" size={70} />
        <div className="relative z-10 max-w-4xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {statsList.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <StatCard {...s} inView={statsInView} />
              </Reveal>
            ))}
          </div>
        </div>
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,58,0.5), transparent)' }} />
        <div className="absolute bottom-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,58,0.5), transparent)' }} />
      </section>

      {/* ─── LIVE SIMULATOR SECTION (#demo) ─── */}
      <section id="demo" className="relative py-16 px-5 overflow-hidden" style={{ background: '#0f2633' }}>
        <IslamicStarPattern opacity={0.03} color="#C9953A" size={70} />

        <div className="relative z-10 max-w-4xl mx-auto text-center mb-8">
          <Reveal>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold border border-[#C9953A]/40 text-[#e4b25e] bg-[#C9953A]/10 mb-3">
              شاهد كيف يعمل
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-bold font-1 text-white mb-2">
              محاكاة حية للتسميع الصوتي والتصحيح اللحظي
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <ArabesqueDivider />
          </Reveal>
        </div>

        <div className="relative z-10 max-w-xl mx-auto">
          <Reveal delay={0.2}>
            <RecitationVideoSimulator />
          </Reveal>
        </div>
      </section>

      {/* ─── FEATURED HADITH BOOKS SECTION (#books) ─── */}
      <FeaturedBooksSection />

      {/* ─── FEATURES (#features) ─── */}
      <section id="features" className="relative py-20 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0f2633 0%, #122e3e 100%)' }}>
        <IslamicStarPattern opacity={0.05} color="#337FA1" size={100} />

        <div className="relative z-10 max-w-6xl mx-auto px-5">
          <Reveal className="text-center mb-3">
            <p className="text-sm tracking-widest uppercase font-2" style={{ color: '#C9953A' }}>مميزات المنصة</p>
          </Reveal>
          <Reveal delay={0.1} className="text-center mb-2">
            <h2 className="text-3xl md:text-4xl font-bold font-1 text-white">كل ما تحتاجه لتحفظ السنة</h2>
          </Reveal>
          <Reveal delay={0.15} className="text-center mb-12">
            <ArabesqueDivider />
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div
                  className="group relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 cursor-default overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at top right, rgba(201,149,58,0.12), transparent 70%)' }} />

                  <div className="relative z-10">
                    <div className="mb-4">{f.icon}</div>
                    <h3 className="text-lg font-bold font-1 text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed font-2">{f.desc}</p>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"
                    style={{ background: 'linear-gradient(to left, transparent, #C9953A, transparent)' }} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (#how-it-works) ─── */}
      <section id="how-it-works" className="relative py-20 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #122e3e 0%, #1a3f52 100%)' }}>
        <IslamicStarPattern opacity={0.06} color="#ffffff" size={85} />

        <div className="relative z-10 max-w-5xl mx-auto px-5">
          <Reveal className="text-center mb-3">
            <p className="text-sm tracking-widest uppercase font-2" style={{ color: '#C9953A' }}>كيف تعمل المنصة؟</p>
          </Reveal>
          <Reveal delay={0.1} className="text-center mb-2">
            <h2 className="text-3xl md:text-4xl font-bold font-1 text-white">ثلاث خطوات للإتقان</h2>
          </Reveal>
          <Reveal delay={0.15} className="text-center mb-14">
            <ArabesqueDivider />
          </Reveal>

          <div className="relative flex flex-col md:flex-row gap-8 md:gap-0 items-center justify-center">
            <div className="hidden md:block absolute top-12 inset-x-0 h-px pointer-events-none"
              style={{ background: 'linear-gradient(to left, transparent 5%, rgba(201,149,58,0.35) 20%, rgba(201,149,58,0.35) 80%, transparent 95%)' }} />

            {STEPS.map((step, i) => (
              <Reveal key={i} delay={i * 0.15} className="flex-1 max-w-xs text-center px-4">
                <GeomBadge className="w-24 h-24 mx-auto mb-5">
                  <span className="text-4xl font-bold font-1" style={{ color: '#C9953A' }}>{step.num}</span>
                </GeomBadge>
                <h3 className="text-xl font-bold font-1 text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed font-2">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION (#faq) ─── */}
      <FAQSection />

      {/* ─── CTA BANNER ─── */}
      <section className="relative overflow-hidden py-0" style={{ background: '#0f2633' }}>
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,58,0.6), transparent)' }} />

        <div className="relative" style={{ background: 'linear-gradient(135deg, #1e4d63 0%, #23566e 50%, #1a3f52 100%)' }}>
          <IslamicStarPattern opacity={0.08} color="#ffffff" size={75} />

          <div className="relative z-10 pt-20 pb-16 px-5 text-center">
            <Reveal>
              <div className="inline-block px-5 py-1.5 rounded-full text-xs font-2 border mb-6"
                style={{ borderColor: 'rgba(201,149,58,0.4)', color: '#e4b25e', background: 'rgba(201,149,58,0.1)' }}>
                انضم إلى آلاف الحافظين
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl md:text-5xl font-bold font-1 text-white mb-4 leading-snug">
                ابدأ رحلتك مع السنة النبوية<br />
                <span style={{ color: '#C9953A' }}>اليوم وبلا تكلفة</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-10 leading-loose font-2">
                سجّل مجاناً وابدأ في حفظ أحاديث النبي ﷺ بأسلوب علمي موثوق ومدعوم بأحدث تقنيات الذكاء الاصطناعي.
              </p>
            </Reveal>
            <Reveal delay={0.3} className="flex items-center gap-4 justify-center flex-wrap">
              <Link to="/signup"
                className="group relative px-10 py-4 rounded-full text-base font-bold font-2 shadow-[0_4px_25px_rgba(201,149,58,0.3)] transition-all hover:scale-105 active:scale-95 overflow-hidden flex items-center gap-2"
                style={{ background: 'linear-gradient(to left, #C9953A, #e4b25e)', color: '#0f2633' }}>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">أنشئ حسابك مجاناً</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:-translate-x-1">←</span>
              </Link>
              <Link to="/login"
                className="px-10 py-4 rounded-full text-base font-semibold font-2 border border-white/20 text-white hover:bg-[#337fa1]/20 hover:border-[#337fa1]/50 transition-all">
                تسجيل الدخول
              </Link>
            </Reveal>
          </div>

          <div className="relative z-0 -mb-1 pointer-events-none w-full">
            <MosqueBackground />
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative py-8 px-5 text-center" style={{ background: '#0f2633' }}>
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />
        <div className="flex flex-col items-center gap-3">
          <a
            href="#top"
            onClick={scrollToTop}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img src={logoImg} alt="أثر" className="h-7 w-7 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="text-white/50 group-hover:text-white/80 transition-colors font-1 font-semibold">أثر</span>
          </a>
          <ArabesqueDivider color="rgba(201,149,58,0.35)" />
          <p className="text-white/40 text-xs font-2">
            © {new Date().getFullYear()} أثر — جميع الحقوق محفوظة
          </p>
          <p className="text-white/30 text-xs font-2 max-w-sm">
            للتواصل والدعم: <span className="text-white/60">Athar@gmail.com</span>
          </p>
        </div>
      </footer>

    </div>
  );
}