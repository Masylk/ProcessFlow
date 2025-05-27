'use client';

import { useFastTheme } from '../context/FastThemeContext';

export function FastThemeToggle() {
  const { currentTheme, toggleTheme } = useFastTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        px-4 py-2 rounded-lg border theme-transition
        bg-[var(--bg-primary)]
        text-[var(--text-primary)]
        border-[var(--border-primary)]
        hover:bg-[var(--bg-tertiary)]
      "
    >
      <span className="no-transition">
        {currentTheme === 'light' ? '🌙' : '☀️'}
      </span>
      <span className="ml-2">
        Switch to {currentTheme === 'light' ? 'Dark' : 'Light'} Mode
      </span>
    </button>
  );
}

/* Example of using the optimized CSS classes instead of CSS variables */
export function FastThemeToggleWithClasses() {
  const { currentTheme, toggleTheme } = useFastTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn-secondary theme-transition px-4 py-2 rounded-lg border"
    >
      <span className="no-transition">
        {currentTheme === 'light' ? '🌙' : '☀️'}
      </span>
      <span className="ml-2">
        Switch to {currentTheme === 'light' ? 'Dark' : 'Light'} Mode
      </span>
    </button>
  );
}