import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import logoImg from '../assets/logo.png';


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
   Animated arabesque border divider
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
   Animated counter hook
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
   Scroll-reveal wrapper
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
   Mosque skyline SVG (bottom of hero)
───────────────────────────────────────────────── */
function MosqueSkyline({ fill = '#1a3f52' }) {
  return (
    <svg viewBox="0 0 1200 160" preserveAspectRatio="none" className="w-full block pointer-events-none">
      {/* Ground */}
      <rect x="0" y="130" width="1200" height="30" fill={fill} />

      {/* ── Far-left small minaret ── */}
      <rect x="60" y="80" width="14" height="50" fill={fill} />
      <path d="M67,80 L60,65 L74,65 Z" fill={fill} />
      <rect x="63" y="55" width="8" height="12" fill={fill} />

      {/* ── Left dome cluster ── */}
      <rect x="120" y="95" width="140" height="35" fill={fill} />
      <path d="M140,95 C140,55 175,35 190,32 C205,35 240,55 240,95 Z" fill={fill} />
      <rect x="188" y="20" width="4" height="14" fill={fill} />
      <circle cx="190" cy="17" r="3" fill={fill} />
      {/* small flanking domes */}
      <path d="M122,95 C122,75 138,62 148,60 C158,62 174,75 174,95 Z" fill={fill} />
      <path d="M210,95 C210,75 226,62 236,60 C246,62 262,75 262,95 Z" fill={fill} />

      {/* ── Left tall minaret ── */}
      <rect x="104" y="50" width="18" height="80" fill={fill} />
      <path d="M113,50 L104,32 L122,32 Z" fill={fill} />
      <rect x="108" y="22" width="10" height="12" fill={fill} />
      <circle cx="113" cy="18" r="2.5" fill={fill} />

      {/* ── Centre grand mosque ── */}
      <rect x="380" y="100" width="440" height="30" fill={fill} />
      {/* large centre dome */}
      <path d="M490,100 C490,42 555,10 600,6 C645,10 710,42 710,100 Z" fill={fill} />
      {/* spire + crescent */}
      <rect x="598" y="-4" width="4" height="12" fill={fill} />
      <path d="M604,-4 A8,8,0,1,0,604,-20 A6,6,0,1,1,604,-4 Z" fill={fill} />
      {/* flanking domes */}
      <path d="M410,100 C410,68 440,48 460,46 C480,48 510,68 510,100 Z" fill={fill} />
      <path d="M690,100 C690,68 720,48 740,46 C760,48 790,68 790,100 Z" fill={fill} />
      {/* small side domes */}
      <path d="M382,100 C382,82 396,72 404,70 C412,72 426,82 426,100 Z" fill={fill} />
      <path d="M774,100 C774,82 788,72 796,70 C804,72 818,82 818,100 Z" fill={fill} />

      {/* ── Centre minarets ── */}
      <rect x="375" y="40" width="20" height="90" fill={fill} />
      <path d="M385,40 L375,20 L395,20 Z" fill={fill} />
      <rect x="379" y="10" width="12" height="12" fill={fill} />
      <circle cx="385" cy="6" r="3" fill={fill} />

      <rect x="805" y="40" width="20" height="90" fill={fill} />
      <path d="M815,40 L805,20 L825,20 Z" fill={fill} />
      <rect x="809" y="10" width="12" height="12" fill={fill} />
      <circle cx="815" cy="6" r="3" fill={fill} />

      {/* ── Right dome cluster ── */}
      <rect x="880" y="95" width="150" height="35" fill={fill} />
      <path d="M900,95 C900,55 935,35 955,32 C975,35 1010,55 1010,95 Z" fill={fill} />
      <rect x="953" y="20" width="4" height="14" fill={fill} />
      <circle cx="955" cy="17" r="3" fill={fill} />
      <path d="M882,95 C882,75 898,62 908,60 C918,62 934,75 934,95 Z" fill={fill} />
      <path d="M974,95 C974,75 990,62 1000,60 C1010,62 1026,75 1026,95 Z" fill={fill} />

      {/* ── Right tall minaret ── */}
      <rect x="1068" y="50" width="18" height="80" fill={fill} />
      <path d="M1077,50 L1068,32 L1086,32 Z" fill={fill} />
      <rect x="1072" y="22" width="10" height="12" fill={fill} />
      <circle cx="1077" cy="18" r="2.5" fill={fill} />

      {/* ── Far-right small minaret ── */}
      <rect x="1126" y="80" width="14" height="50" fill={fill} />
      <path d="M1133,80 L1126,65 L1140,65 Z" fill={fill} />
      <rect x="1129" y="55" width="8" height="12" fill={fill} />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Geometric decorative polygon badge
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
   Stats data
───────────────────────────────────────────────── */
const STATS = [
  { value: 5000, suffix: '+', label: 'حديث نبوي شريف' },
  { value: 20,   suffix: '+', label: 'كتاب حديث' },
  { value: 3,    suffix: '',  label: 'محركات تسميع ذكية' },
  { value: 100,  suffix: '%', label: 'مجاني للبدء' },
];

/* ─────────────────────────────────────────────
   Features data
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
        <rect x="12" y="24" width="9"  height="2" rx="1" fill="#C9953A" opacity="0.4" />
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
        <path d="M17,22 L23,22 L23,28 L17,28 Z" fill="#C9953A" opacity="0.3" stroke="#C9953A" strokeWidth="1" />
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

/* ─────────────────────────────────────────────
   How it works steps
───────────────────────────────────────────────── */
const STEPS = [
  { num: '١', title: 'أنشئ حسابك', desc: 'سجّل مجاناً في ثوانٍ باستخدام بريدك الإلكتروني أو حسابك في Google.' },
  { num: '٢', title: 'اختر كتاب الحديث', desc: 'تصفّح مكتبتنا الشاملة وابدأ من حيث يناسب مستواك.' },
  { num: '٣', title: 'سمّع وتتبّع تقدّمك', desc: 'استخدم محرك التسميع الذكي ليقيّم حفظك ويرشدك نحو الإتقان.' },
];

/* ─────────────────────────────────────────────
   Stat counter card
───────────────────────────────────────────────── */
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

  return (
    <div dir="rtl" className="min-h-screen w-full overflow-x-hidden font-2" style={{ backgroundColor: '#0f2633' }}>

      {/* ─── NAVBAR ─────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 md:px-10 py-3"
        style={{ background: 'linear-gradient(to bottom, rgba(15,38,51,0.95) 0%, transparent 100%)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="أثر" className="h-9 w-9 object-contain" />
          <span className="text-xl font-bold font-1 text-white tracking-wide">أثر</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"
            className="text-sm text-white/80 hover:text-white transition-colors font-2 px-4 py-1.5 rounded-full border border-white/20 hover:border-white/50">
            تسجيل الدخول
          </Link>
          <Link to="/signup"
            className="text-sm font-semibold font-2 px-4 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #C9953A, #e4b25e)', color: '#1a0f00' }}>
            ابدأ مجاناً
          </Link>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pb-32 md:pb-36"
        style={{ background: 'linear-gradient(160deg, #1a3f52 0%, #23566e 45%, #0f2633 100%)' }}>

        {/* Animated geometric star background */}
        <IslamicStarPattern opacity={0.07} color="#ffffff" size={90} />

        {/* Gold radial glow center */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(201,149,58,0.12) 0%, transparent 70%)' }} />

        {/* Rotating large star decoration */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-5"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M100,5 L114,70 L165,30 L125,85 L195,95 L130,115 L165,170 L100,140 L35,170 L70,115 L5,95 L75,85 L35,30 L86,70 Z"
              fill="#C9953A" />
          </svg>
        </motion.div>

        {/* Hero content */}
        <div className="relative z-20 flex flex-col items-center text-center px-5 pt-28 pb-10 max-w-3xl mx-auto">

          {/* Floating Quranic badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 px-5 py-2 rounded-full text-xs font-2 border"
            style={{ background: 'rgba(201,149,58,0.12)', borderColor: 'rgba(201,149,58,0.4)', color: '#e4b25e' }}>
            ﴿ وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ وَمَا نَهَاكُمْ عَنْهُ فَانتَهُوا وَاتَّقُوا اللَّهَ﴾
          </motion.div>

          {/* App name */}
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

          {/* Tagline */}
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

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative z-30 flex items-center gap-4 flex-wrap justify-center"
          >
            <Link to="/signup"
              className="px-8 py-3.5 rounded-full text-base font-bold font-2 shadow-lg transition-all hover:scale-105 active:scale-95 hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #C9953A 0%, #e4b25e 100%)', color: '#1a0f00' }}>
              ابدأ رحلتك مجاناً ←
            </Link>
            <Link to="/login"
              className="px-8 py-3.5 rounded-full text-base font-semibold font-2 border border-white/30 text-white hover:bg-white/10 transition-all">
              تسجيل الدخول
            </Link>
          </motion.div>
        </div>

        {/* Mosque skyline transition */}
        <div className="absolute bottom-0 inset-x-0 z-0 pointer-events-none">
          <MosqueSkyline fill="#0f2633" />
        </div>
      </section>

      {/* ─── STATS ──────────────────────────────── */}
      <section ref={statsRef} className="relative py-16 overflow-hidden"
        style={{ background: '#0f2633' }}>
        <IslamicStarPattern opacity={0.04} color="#C9953A" size={70} />
        <div className="relative z-10 max-w-4xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {STATS.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <StatCard {...s} inView={statsInView} />
              </Reveal>
            ))}
          </div>
        </div>
        {/* Top border glow */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,58,0.5), transparent)' }} />
        <div className="absolute bottom-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,58,0.5), transparent)' }} />
      </section>

      {/* ─── FEATURES ───────────────────────────── */}
      <section className="relative py-20 overflow-hidden"
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
                  {/* Hover gold glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at top right, rgba(201,149,58,0.12), transparent 70%)' }} />

                  <div className="relative z-10">
                    <div className="mb-4">{f.icon}</div>
                    <h3 className="text-lg font-bold font-1 text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed font-2">{f.desc}</p>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 inset-x-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"
                    style={{ background: 'linear-gradient(to left, transparent, #C9953A, transparent)' }} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────── */}
      <section className="relative py-20 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #122e3e 0%, #1a3f52 100%)' }}>
        <IslamicStarPattern opacity={0.06} color="#ffffff" size={85} />

        {/* Central arabesque border */}
        <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none">
          <svg viewBox="0 0 400 8" className="w-full max-w-2xl" preserveAspectRatio="none">
            <path d="M0,4 Q50,0 100,4 Q150,8 200,4 Q250,0 300,4 Q350,8 400,4" stroke="rgba(201,149,58,0.4)" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

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
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 inset-x-0 h-px pointer-events-none"
              style={{ background: 'linear-gradient(to left, transparent 5%, rgba(201,149,58,0.35) 20%, rgba(201,149,58,0.35) 80%, transparent 95%)' }} />

            {STEPS.map((step, i) => (
              <Reveal key={i} delay={i * 0.15} className="flex-1 max-w-xs text-center px-4">
                {/* Number badge */}
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

      {/* ─── CTA BANNER ─────────────────────────── */}
      <section className="relative overflow-hidden py-0"
        style={{ background: '#0f2633' }}>
        {/* Gold top border */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,58,0.6), transparent)' }} />

        <div className="relative" style={{ background: 'linear-gradient(135deg, #1e4d63 0%, #23566e 50%, #1a3f52 100%)' }}>
          <IslamicStarPattern opacity={0.08} color="#ffffff" size={75} />

          {/* Mosque skyline top (flipped) */}
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
                className="px-10 py-4 rounded-full text-base font-bold font-2 shadow-2xl transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #C9953A 0%, #e4b25e 100%)', color: '#1a0f00' }}>
                أنشئ حسابك مجاناً ←
              </Link>
              <Link to="/login"
                className="px-10 py-4 rounded-full text-base font-semibold font-2 border border-white/30 text-white hover:bg-white/10 transition-all">
                تسجيل الدخول
              </Link>
            </Reveal>
          </div>

          {/* Mosque bottom */}
          <div className="relative z-0 -mb-1 pointer-events-none">
            <MosqueSkyline fill="#0f2633" />
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────── */}
      <footer className="relative py-8 px-5 text-center" style={{ background: '#0f2633' }}>
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="أثر" className="h-7 w-7 object-contain opacity-70" />
            <span className="text-white/50 font-1 font-semibold">أثر</span>
          </div>
          <ArabesqueDivider color="rgba(201,149,58,0.35)" />
          <p className="text-white/30 text-xs font-2">
            © {new Date().getFullYear()} أثر — جميع الحقوق محفوظة
          </p>
          <p className="text-white/20 text-xs font-2 max-w-sm">
            للتواصل والدعم: <span className="text-white/40">Athar@gmail.com</span>
          </p>
        </div>
      </footer>

    </div>
  );
}