'use client';

import { useTheme } from '../context/ThemeContext';
import { THEME_TRANSITION_CLASS, NO_TRANSITION_CLASS } from '../theme/utils';

export function ThemeToggle() {
  const { currentTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        px-4 py-2 rounded-lg border
        ${THEME_TRANSITION_CLASS}
        bg-[var(--button-secondary-bg)]
        text-[var(--button-secondary-fg)]
        border-[var(--button-secondary-border)]
        hover:bg-[var(--button-secondary-bg-hover)]
        hover:text-[var(--button-secondary-fg-hover)]
      `}
    >
      {/* Icon without transitions for better performance */}
      <span className={NO_TRANSITION_CLASS}>
        {currentTheme === 'light' ? '🌙' : '☀️'}
      </span>
      <span className="ml-2">
        Switch to {currentTheme === 'light' ? 'Dark' : 'Light'} Mode
      </span>
    </button>
  );
}