import React from "react";
import { useTheme } from "../../hooks/useTheme";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
import { FiChevronDown } from "react-icons/fi";

const themeLabels = {
  light: "Light (فاتح)",
  dark: "Dark (داكن)",
  luxury: "Luxury (فاخر)",
  synthwave: "Synthwave (نيون نايت)",
  retro: "Retro (كلاسيكي)",
  dracula: "Dracula (دراكولا)",
  cupcake: "Cupcake (كاب كيك)",
  aqua: "Aqua (بحري)",
  emerald: "Emerald (زمردي)",
  forest: "Forest (غابة)",
  sunset: "Sunset (غروب)",
  valentine: "Valentine (وردي)",
  halloween: "Halloween (هالوين)",
  night: "Night (ليلي دافئ)",
  coffee: "Coffee (قهوة)",
  bumblebee: "Bumblebee (أصفر نشط)",
  corporate: "Corporate (رسمي)",
  garden: "Garden (حديقة)",
  pastel: "Pastel (باستيل هادئ)",
  fantasy: "Fantasy (خيالي)",
  autumn: "Autumn (خريفي)",
  business: "Business (أعمال)",
  acid: "Acid (حمضي زاهي)",
  lemonade: "Lemonade (ليموناد)",
  caramellatte: "Caramellatte (كاراميل)",
  abyss: "Abyss (أعماق المحيط)",
  lofi: "Lofi (لوفاي بسيط)",
  wireframe: "Wireframe (تخطيطي)",
  dim: "Dim (خافت)",
  nord: "Nord (ثلجي)",
  silk: "Silk (حريري)",
  cmyk: "CMYK (طباعي)",
  black: "Black (أسود داكن)",
  cyberpunk: "Cyberpunk (سايبر)",
};

function ThemeSwitcher() {
  const {
    theme,
    themes,
    setTheme,
    defaultLightTheme,
    defaultDarkTheme,
    setDefaultLightTheme,
    setDefaultDarkTheme,
    lightThemesList = [],
    darkThemesList = [],
  } = useTheme();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full font-2" dir="rtl">
      {/* 1. Main Theme Selector (Compact) */}
      <div className="dropdown flex-1 min-w-0">
        <div
          tabIndex={0}
          role="button"
          className="flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-base-300 dark:border-slate-800 bg-base-100 dark:bg-slate-900 px-3.5 text-xs sm:text-sm font-medium text-base-content shadow-2xs hover:border-cyan-600 transition-colors"
        >
          <span className="truncate">{themeLabels[theme] || theme}</span>
          <FiChevronDown className="text-base text-base-content/60 shrink-0" />
        </div>

        <ul
          tabIndex={0}
          className="dropdown-content z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-base-300 dark:border-slate-800 bg-base-100 dark:bg-slate-900 p-2 shadow-2xl space-y-1"
        >
          {themes.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => setTheme(item)}
                className={`w-full rounded-xl px-3 py-2 text-right text-xs sm:text-sm transition-colors cursor-pointer ${
                  theme === item
                    ? "bg-cyan-700 text-white font-bold"
                    : "text-base-content hover:bg-base-200 dark:hover:bg-slate-800"
                }`}
              >
                {themeLabels[item] || item}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Default Light Theme Selector (Fixed Uniform Width) */}
      <div className="dropdown w-full sm:w-44 shrink-0">
        <div
          tabIndex={0}
          role="button"
          title="تحديد الثيم الافتراضي للوضع النهاري"
          className="flex h-11 w-full items-center justify-between gap-1.5 rounded-xl border border-amber-300/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 px-3 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 cursor-pointer shadow-2xs hover:bg-amber-100/80 dark:hover:bg-amber-950/60 transition-colors"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <HiOutlineSun className="text-base text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="shrink-0">نهاري:</span>
            <span className="truncate underline decoration-amber-400">
              {defaultLightTheme}
            </span>
          </div>
          <FiChevronDown className="text-xs text-amber-700/60 dark:text-amber-400/60 shrink-0" />
        </div>

        <ul
          tabIndex={0}
          className="dropdown-content z-50 mt-2 max-h-60 w-56 overflow-y-auto rounded-2xl border border-amber-200 dark:border-amber-900 bg-base-100 dark:bg-slate-900 p-2 shadow-2xl space-y-1"
        >
          <li className="px-3 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-400 border-b border-amber-200/50 pb-1.5 mb-1">
            اختر الثيم الافتراضي للوضع النهاري:
          </li>
          {lightThemesList.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => setDefaultLightTheme(item)}
                className={`w-full rounded-xl px-3 py-1.5 text-right text-xs transition-colors cursor-pointer ${
                  defaultLightTheme === item
                    ? "bg-amber-600 text-white font-bold"
                    : "text-base-content hover:bg-amber-50 dark:hover:bg-amber-950/40"
                }`}
              >
                {themeLabels[item] || item}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Default Dark Theme Selector (Fixed Uniform Width) */}
      <div className="dropdown w-full sm:w-44 shrink-0">
        <div
          tabIndex={0}
          role="button"
          title="تحديد الثيم الافتراضي للوضع الليلي"
          className="flex h-11 w-full items-center justify-between gap-1.5 rounded-xl border border-purple-300/80 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/30 px-3 text-xs sm:text-sm font-bold text-purple-900 dark:text-purple-300 cursor-pointer shadow-2xs hover:bg-purple-100/80 dark:hover:bg-purple-950/60 transition-colors"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <HiOutlineMoon className="text-base text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="shrink-0">ليلي:</span>
            <span className="truncate underline decoration-purple-400">
              {defaultDarkTheme}
            </span>
          </div>
          <FiChevronDown className="text-xs text-purple-700/60 dark:text-purple-400/60 shrink-0" />
        </div>

        <ul
          tabIndex={0}
          className="dropdown-content z-50 mt-2 max-h-60 w-56 overflow-y-auto rounded-2xl border border-purple-200 dark:border-purple-900 bg-base-100 dark:bg-slate-900 p-2 shadow-2xl space-y-1"
        >
          <li className="px-3 py-1 text-[11px] font-bold text-purple-800 dark:text-purple-400 border-b border-purple-200/50 pb-1.5 mb-1">
            اختر الثيم الافتراضي للوضع الليلي:
          </li>
          {darkThemesList.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => setDefaultDarkTheme(item)}
                className={`w-full rounded-xl px-3 py-1.5 text-right text-xs transition-colors cursor-pointer ${
                  defaultDarkTheme === item
                    ? "bg-purple-700 text-white font-bold"
                    : "text-base-content hover:bg-purple-50 dark:hover:bg-purple-950/40"
                }`}
              >
                {themeLabels[item] || item}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ThemeSwitcher;
