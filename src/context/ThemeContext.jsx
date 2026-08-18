import { createContext, useContext, useEffect, useState } from 'react';

const DAISYUI_THEMES = [
  // ── High Impact / Rich Color Palette & Vibrant Overhaul Themes ──
  'light',
  'dark',
  'luxury',
  'synthwave',
  'retro',
  'dracula',
  'cupcake',
  'aqua',
  'forest',
  'sunset',
  'valentine',
  'halloween',
  'night',
  'coffee',

  // ── Medium Impact Themes ──
  'corporate',
  'garden',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'caramellatte',
  'abyss',

  // ── Minimalist & Background-only Subtle Themes (Bottom) ──
  'wireframe',
  'dim',
  'nord',
  'silk',
  'cmyk',
  'black',
];

const DARK_THEMES = new Set([
  'dark',
  'luxury',
  'synthwave',
  'halloween',
  'forest',
  'aqua',
  'black',
  'dracula',
  'business',
  'night',
  'coffee',
  'dim',
  'sunset',
  'abyss',
]);

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (DAISYUI_THEMES.includes(saved)) return saved;
  } catch {
    // localStorage can be unavailable in restricted browser modes.
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (DARK_THEMES.has(theme)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  themes: DAISYUI_THEMES,
  defaultLightTheme: 'light',
  defaultDarkTheme: 'dark',
  setTheme: () => { },
  setDefaultLightTheme: () => { },
  setDefaultDarkTheme: () => { },
  toggleTheme: () => { },
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const initial = getInitialTheme();
    applyTheme(initial);
    return initial;
  });

  const [defaultLightTheme, setDefaultLightThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('default_light_theme');
      if (saved && DAISYUI_THEMES.includes(saved)) return saved;
    } catch {}
    return 'light';
  });

  const [defaultDarkTheme, setDefaultDarkThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('default_dark_theme');
      if (saved && DAISYUI_THEMES.includes(saved)) return saved;
    } catch {}
    return 'dark';
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Ignore write errors.
    }
  }, [theme]);

  const setDefaultLightTheme = (newTheme) => {
    setDefaultLightThemeState(newTheme);
    try {
      localStorage.setItem('default_light_theme', newTheme);
    } catch {}
    setTheme(newTheme);
  };

  const setDefaultDarkTheme = (newTheme) => {
    setDefaultDarkThemeState(newTheme);
    try {
      localStorage.setItem('default_dark_theme', newTheme);
    } catch {}
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme((prev) => (DARK_THEMES.has(prev) ? defaultLightTheme : defaultDarkTheme));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: DARK_THEMES.has(theme),
        themes: DAISYUI_THEMES,
        defaultLightTheme,
        defaultDarkTheme,
        darkThemesList: Array.from(DARK_THEMES),
        lightThemesList: DAISYUI_THEMES.filter((t) => !DARK_THEMES.has(t)),
        setTheme,
        setDefaultLightTheme,
        setDefaultDarkTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
