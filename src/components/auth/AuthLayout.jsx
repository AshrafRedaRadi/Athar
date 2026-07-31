import alAqsaImg from '../../assets/al-aqsa.jpg';

/**
 * AuthLayout — shared two-panel wrapper for Login and Signup pages.
 *
 * Left panel : Al-Aqsa illustration + decorative wave SVG
 * Right panel: children (the form area)
 */
export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{
        backgroundColor: '#23566e',
        backgroundImage:
          'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 40%)',
      }}
    >
      {/* Card container */}
      <div
        className="relative w-full max-w-[1100px] h-[600px] rounded-[40px] overflow-hidden shadow-2xl"
        style={{ backgroundColor: '#337FA1' }}
      >
        {/* ── Left panel: illustration (hidden on mobile) ── */}
        <div className="absolute left-0 top-0 w-[62%] h-full overflow-hidden hidden md:block z-[1]"
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
          className="absolute right-0 top-0 w-full md:w-[45%] h-full flex justify-center items-start pt-[15px] px-[30px] py-[15px] text-white z-[2]"
          dir="rtl"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
