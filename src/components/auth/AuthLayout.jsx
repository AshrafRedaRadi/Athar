import alAqsaImg from '../../assets/al-aqsa.jpg';

/**
 * AuthLayout — shared two-panel wrapper for Login and Signup pages.
 * Fully fits screen height without scrollbars and adds a neat small margin.
 */
export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-5 md:h-screen md:w-screen md:overflow-hidden"
      style={{
        backgroundColor: '#23566e',
        backgroundImage:
          'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 40%)',
      }}
    >
      {/* Card container */}
      <div
        className="relative w-full max-w-[1050px] h-auto min-h-0 md:h-full md:max-h-[94vh] rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
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

          {/* Wave SVG overlay that blends into the right (form) panel */}
          <svg
            className="absolute top-0 right-0 w-full h-full pointer-events-none z-[2]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M70,0 C95,30 55,70 100,100 L100,100 L100,0 Z" fill="#337FA1" />
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
  );
}
