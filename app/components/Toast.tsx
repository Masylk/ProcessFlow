'use client';

import React, { useState, useEffect } from 'react';
import { useColors } from '@/app/theme/hooks';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
  const colors = useColors();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 200); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors['utility-success-50'],
          borderColor: colors['utility-success-200'],
          textColor: colors['utility-success-700'],
          icon: 'check-circle.svg'
        };
      case 'error':
        return {
          backgroundColor: colors['utility-error-50'],
          borderColor: colors['utility-error-200'],
          textColor: colors['utility-error-700'],
          icon: 'x-close.svg'
        };
      case 'warning':
        return {
          backgroundColor: colors['utility-warning-50'],
          borderColor: colors['utility-warning-200'],
          textColor: colors['utility-warning-700'],
          icon: 'alert-triangle.svg'
        };
      case 'info':
      default:
        return {
          backgroundColor: colors['utility-brand-50'],
          borderColor: colors['utility-brand-200'],
          textColor: colors['utility-brand-700'],
          icon: 'info-circle.svg'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 min-w-80 max-w-96 rounded-lg border p-4 shadow-lg
        transform transition-all duration-200 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
      style={{
        backgroundColor: typeStyles.backgroundColor,
        borderColor: typeStyles.borderColor,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/icons/${typeStyles.icon}`}
            alt={type}
            className="w-5 h-5"
            style={{ filter: `hue-rotate(${type === 'success' ? '90deg' : type === 'error' ? '0deg' : '45deg'})` }}
          />
        </div>
        <div className="flex-1">
          <p
            className="text-sm font-medium"
            style={{ color: typeStyles.textColor }}
          >
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 200);
          }}
          className="flex-shrink-0 p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
        >
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/icons/x-close.svg`}
            alt="Close"
            className="w-4 h-4 opacity-60 hover:opacity-100"
          />
        </button>
      </div>
    </div>
  );
};

export default Toast;