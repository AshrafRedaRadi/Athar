import logo from "../assets/logo.png";
import paper from "../assets/paper.png";
import Button_Step from "./Button_Step";

const WelcomeToAthar = () => {
  return (
    <section
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-sky-50 via-white to-blue-50 px-6"
    >
      {/* Background Blur */}
      <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-sky-200/20 blur-3xl"></div>

      {/* Islamic Pattern */}
      <div className="absolute right-0 bottom-0 opacity-10">
        <svg
          width="180"
          height="180"
          fill="none"
          stroke="#5B8DEF"
          strokeWidth="1.5"
        >
          <path d="M90 0C40 40 40 140 90 180C140 140 140 40 90 0Z" />
        </svg>
      </div>

      <div className="relative w-full max-w-md rounded-[30px] border border-white/40 bg-white/70 p-8 text-center shadow-2xl backdrop-blur-xl">

        {/* Logo */}
        <img
          src={logo}
          alt="Athar"
          className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg"
        />

        <h1 className="mt-4 text-4xl font-extrabold text-slate-900">
          أثر
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          منصة الأحاديث النبوية الشريفة
        </p>

        {/* Illustration */}
        <div className="my-8 flex justify-center">
          <img
            src={paper}
            alt="Paper"
            className="w-64 drop-shadow-xl animate-float"
          />
        </div>

        <h2 className="text-3xl font-bold text-slate-800">
          مرحبًا بك في أثر!
        </h2>

        <div className="mt-8">
          <Button_Step
            name="ابدأ رحلتك"
          />
        </div>
      </div>
    </section>
  );
};

export default WelcomeToAthar;