import { createContext, useContext, useEffect, useState } from 'react';

const DAISYUI_THEMES = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
  'caramellatte',
  'abyss',
  'silk',
];

const DARK_THEMES = new Set([
  'dark',
  'synthwave',
  'halloween',
  'forest',
  'aqua',
  'black',
  'luxury',
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
}

export const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  themes: DAISYUI_THEMES,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const initial = getInitialTheme();
    applyTheme(initial);
    return initial;
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Ignore write errors.
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (DARK_THEMES.has(prev) ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: DARK_THEMES.has(theme),
        themes: DAISYUI_THEMES,
        setTheme,
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
