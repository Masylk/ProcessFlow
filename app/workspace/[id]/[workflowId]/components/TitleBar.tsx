'use client';

import React, { useState, useEffect } from 'react';

interface TitleBarProps {
  title: string;
  onUpdateTitle: (newTitle: string) => Promise<void>; // Callback function to handle title update
}

export default function TitleBar({ title, onUpdateTitle }: TitleBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);

  useEffect(() => {
    setCurrentTitle(title); // Update currentTitle when title prop changes
  }, [title]);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
  };

  const handleInputBlur = async () => {
    setIsEditing(false);
    if (currentTitle !== title) {
      await onUpdateTitle(currentTitle);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (currentTitle !== title) {
        await onUpdateTitle(currentTitle);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setCurrentTitle(title); // Revert changes on escape
    }
  };

  return (
    <div className="w-full bg-white shadow-md py-4 mb-6">
      {isEditing ? (
        <input
          type="text"
          value={currentTitle}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="text-center text-2xl font-semibold w-full"
          autoFocus
        />
      ) : (
        <h1
          onClick={handleTitleClick}
          className="text-center text-2xl font-semibold cursor-pointer"
        >
          {currentTitle}
        </h1>
      )}
    </div>
  );
}
