"use client"

import theme from '../../theme';
import { useState } from 'react';

function MyApp() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
   
      <div className="p-8 bg-Brand/500 min-h-screen flex flex-col items-center">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className={`px-28 py-4 rounded-md mb-40 transition ${
            isDarkMode 
              ? 'bg-Brand/500 text-[var(--Gray-dark-mode-25)]' 
              : 'bg-Brand/200 text-[var(--Gray-light-mode-700)]'
          }`}>
          Toggle Themee
        </button>
        <div 
          className={`p-5 text-center rounded-lg mt-5 border ${
            isDarkMode
              ? 'bg-Brand/500 text-[var(--lightMode-text-brand-secondary)] border-[var(--Gray-dark-mode-400)]'
              : 'bg-Brand/500 text-[var(--darkMode-text-brand-quaternary)] border-[var(--Gray-light-mode-300)]'
          }`}>
          This is a test comp
        </div>
      </div>
   
  );
}

export default MyApp;
