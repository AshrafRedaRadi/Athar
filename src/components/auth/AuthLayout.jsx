import alAqsaImg from '../../assets/al-aqsa.jpg';

/**
 * AuthLayout — shared two-panel wrapper for Login and Signup pages.
 * Fully fits screen height without scrollbars and adds a neat small margin.
 */
export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center pt-[30vw] pb-6 px-4 md:p-5 md:h-screen md:w-screen md:overflow-hidden"
      style={{
        backgroundColor: '#23566e',
        backgroundImage:
          'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 40%)',
      }}
    >
      <div className="relative w-full max-w-[1050px] h-auto min-h-0 md:h-full md:max-h-[94vh] flex flex-col items-center">
        
        {/* ── الشكل الإسلامي (ملتحم تماماً بدون أي فاصل) ── */}
        <div 
          className="block md:hidden absolute top-0 -translate-y-[calc(100%-2px)] pointer-events-none z-20
                     w-[60vw] sm:w-[45vw]"
        >
          <svg
            /* تم ضبط الـ viewBox إلى 230 لينتهي عند Y=130 بالضبط بدون فراغ سفلي */
            viewBox="0 -100 200 230"
            className="w-full h-auto overflow-visible drop-shadow-[0_-4px_4px_rgba(0,0,0,0.18)]"
            preserveAspectRatio="xMidYMax meet"
          >
            <g fill="#337FA1">
              {/* 1. القاعدة السفلية تم تمديدها إلى الأسفل (y=100 إلى y=130) لإغلاق أي فجوة */}
              <rect x="0" y="100" width="200" height="30" />

              {/* 2. جسم القبة الرئيسي */}
              <path d="M15,110 C15,50 60,10 100,10 C140,10 185,50 185,110 Z" />

              {/* 3. السارية ذات الكرات الأربعة */}
              <circle cx="100" cy="10" r="4.5" />
              <circle cx="100" cy="-6" r="3.5" />
              <circle cx="100" cy="-20" r="3" />
              <circle cx="100" cy="-32" r="2.5" />

              {/* 4. الهلال الأعلى */}
              <path d="M96.5,-80 A17,17 0 1,1 113.5,-45 A13,13 0 1,0 96.5,-80 Z" transform="rotate(-15 100 -62)" />
            </g>
          </svg>
        </div>

        {/* Card container */}
        <div
          className="relative w-full h-full rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl flex flex-col md:flex-row z-10"
          style={{ backgroundColor: '#337FA1' }}
        >
          {/* ── Left panel: illustration (hidden on mobile) ── */}
          <div
            className="relative w-[58%] h-full overflow-hidden hidden md:block shrink-0 z-[1]"
            style={{ backgroundColor: '#e8f1f3' }}
          >
            {/* Al-Aqsa background image */}
            <div
              className="w-full h-full bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${alAqsaImg})`,
                backgroundPosition: 'center left',
              }}
            />

            {/* Wave SVG overlay */}
            <svg
              className="absolute top-0 right-0 w-full h-full pointer-events-none z-[2]"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M88,0 C92,15 92,35 88,50 C84,65 84,85 100,100 L100,100 L100,0 Z" fill="#337FA1" />
            </svg>
          </div>

          {/* ── Right panel: form slot ── */}
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