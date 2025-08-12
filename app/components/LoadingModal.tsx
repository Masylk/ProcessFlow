'use client';

import React from 'react';
import { useColors } from '@/app/theme/hooks';
import LoadingSpinner from './LoadingSpinner';
import { createPortal } from 'react-dom';
// No longer need separate ThemeProvider for modals

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
  description?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ 
  isOpen, 
  message = "Loading...", 
  description 
}) => {
  const colors = useColors();

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-8 z-[9999] animate-in fade-in-0 duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0 animate-in fade-in-0 duration-300">
        <div
          style={{ backgroundColor: colors['bg-overlay'] }}
          className="absolute inset-0 opacity-70"
        />
      </div>

      {/* Modal content */}
      <div
        className="rounded-xl shadow-lg w-[400px] flex flex-col relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out p-8"
        style={{ backgroundColor: colors['bg-primary'] }}
      >
        <div className="flex flex-col items-center text-center">
          <LoadingSpinner size="large" />
          
          <h3
            className="text-lg font-medium mt-6 mb-2"
            style={{ color: colors['text-primary'] }}
          >
            {message}
          </h3>
          
          {description && (
            <p
              className="text-sm"
              style={{ color: colors['text-secondary'] }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(
    modalContent,
    document.body
  );
};

export default LoadingModal;