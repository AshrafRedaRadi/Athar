import alAqsaImg from '../../assets/al-aqsa.jpg';

export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start md:justify-center pt-2 sm:pt-4 pb-6 px-4 md:p-5 md:h-screen md:w-screen md:overflow-hidden"
      style={{
        backgroundColor: '#23566e',
        backgroundImage:
          'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 40%)',
      }}
    >
      <div className="w-full max-w-[1050px] h-auto min-h-0 md:h-full md:max-h-[94vh] flex flex-col items-center justify-start md:justify-center">
        
        {/* ── 1. القبة للموبايل (باللون الذهبي) ── */}
        <div className="block md:hidden w-[45vw] max-w-[160px] -mb-[1px] z-20 shrink-0">
          <svg
            viewBox="0 -2 200 147"
            className="w-full h-auto overflow-visible drop-shadow-[0_-4px_8px_rgba(0,0,0,0.35)]"
            preserveAspectRatio="xMidYMax meet"
          >
            <defs>
              <linearGradient id="domeGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE57F" />
                <stop offset="35%" stopColor="#E5B238" />
                <stop offset="70%" stopColor="#C89218" />
                <stop offset="100%" stopColor="#8C5C00" />
              </linearGradient>
            </defs>

            <g fill="url(#domeGold)">
              {/* القاعدة */}
              <rect x="0" y="130" width="200" height="15" />

              {/* جسم القبة */}
              <path d="M15,135 C15,75 60,40 100,40 C140,40 185,75 185,135 Z" />

              {/* الدوائر */}
              <circle cx="100" cy="38" r="4.5" />
              <circle cx="100" cy="27" r="3.5" />
              <circle cx="100" cy="18" r="2.5" />

              {/* الهلال */}
              <path
                d="M96,1 A11,11 0 1,1 111,17 A8.5,8.5 0 1,0 96,1 Z"
                transform="rotate(-15 100 9)"
              />
            </g>
          </svg>
        </div>

        {/* ── 2. الحاوية الرئيسية للكارت ── */}
        <div
          className="relative w-full h-full rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl flex flex-col md:flex-row z-10"
          style={{ backgroundColor: '#337FA1' }}
        >
          {/* الصورة للشاشات الكبيرة (بالـ Curve الأصلي تماماً) */}
          <div
            className="relative w-[58%] h-full overflow-hidden hidden md:block shrink-0 z-[1]"
            style={{ backgroundColor: '#e8f1f3' }}
          >
            <div
              className="w-full h-full bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${alAqsaImg})`,
                backgroundPosition: 'center left',
              }}
            />

            {/* المسار الأصلي بدون أي تعديل في الإحداثيات */}
            <svg
              className="absolute top-0 right-0 w-full h-full pointer-events-none z-[2]"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M88,0 C92,15 92,35 88,50 C84,65 84,85 100,100 L100,100 L100,0 Z" fill="#337FA1" />
            </svg>
          </div>

          {/* محتوى نموذج الدخول / التسجيل */}
          <div
            className="w-full md:w-[42%] h-auto md:h-full flex justify-center items-center py-6 px-4.5 sm:p-5 text-white z-[2] overflow-visible md:overflow-hidden"
            dir="rtl"
          >
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}