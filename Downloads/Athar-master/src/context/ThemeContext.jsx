import { createContext, useContext, useState, useEffect } from 'react';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Read theme from localStorage, falling back to OS preference, then 'light'. */
function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // localStorage unavailable (SSR, private mode, etc.)
  }
  // OS-level preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

/** Apply the theme to the <html> element so DaisyUI picks it up. */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// ── Context ───────────────────────────────────────────────────────────────────

export const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const initial = getInitialTheme();
    applyTheme(initial); // apply before first render to avoid flash
    return initial;
  });

  // Keep <html data-theme> and localStorage in sync whenever theme changes
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // ignore write errors
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Consumer hook (convenience) ───────────────────────────────────────────────

export function useTheme() {
  return useContext(ThemeContext);
}
