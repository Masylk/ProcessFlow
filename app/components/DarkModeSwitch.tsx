'use client';

import { useState } from 'react';

interface DarkModeSwitchProps {
  mode: 'light' | 'dark';
  onChange: (mode: 'light' | 'dark') => void;
}

const DarkModeSwitch: React.FC<DarkModeSwitchProps> = ({ mode, onChange }) => {
  return (
    <button
      onClick={() => onChange(mode === 'light' ? 'dark' : 'light')}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all"
      style={{
        background: mode === 'light' ? 'white' : '#1D2432',
        borderColor: mode === 'light' ? '#D0D5DD' : '#333741',
        color: mode === 'light' ? '#344054' : '#E4E4E7',
      }}
    >
      {mode === 'light' ? (
        <>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 1.66669V3.33335M10 16.6667V18.3334M3.33333 10H1.66667M18.3333 10H16.6667M15.8333 15.8334L14.5833 14.5834M15.8333 4.16669L14.5833 5.41669M4.16667 15.8334L5.41667 14.5834M4.16667 4.16669L5.41667 5.41669M13.3333 10C13.3333 11.841 11.841 13.3334 10 13.3334C8.15905 13.3334 6.66667 11.841 6.66667 10C6.66667 8.15907 8.15905 6.66669 10 6.66669C11.841 6.66669 13.3333 8.15907 13.3333 10Z" stroke="#344054" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Light
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.3333 10.0833C18.2642 11.8311 17.6644 13.5139 16.6098 14.9239C15.5551 16.3339 14.0913 17.4066 12.4179 17.9961C10.7445 18.5856 8.93566 18.6703 7.21844 18.2397C5.50122 17.8091 3.95566 16.8814 2.77837 15.5669C1.60108 14.2524 0.847967 12.6105 0.61101 10.8582C0.374053 9.10595 0.664187 7.32652 1.44487 5.73563C2.22556 4.14474 3.46347 2.81969 4.99984 1.91667C6.53621 1.01366 8.30375 0.572006 10.0833 0.641671C9.26337 1.74167 8.83093 3.08333 8.85801 4.46667C8.88508 5.85 9.36955 7.17167 10.2377 8.23917C11.1058 9.30667 12.3146 10.0667 13.6621 10.4083C15.0096 10.75 16.4242 10.6542 17.7083 10.1333C17.9201 10.0516 18.1273 9.95834 18.3333 9.85834V10.0833Z" stroke="#E4E4E7" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dark
        </>
      )}
    </button>
  );
};

export default DarkModeSwitch; 