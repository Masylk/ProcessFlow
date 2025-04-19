'use client';

import React from 'react';
import { useColors } from '@/app/theme/hooks';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

/**
 * LoadingSpinner component displays a branded loading screen with animated logo
 * @param size - Controls the size of the logo ('small' | 'medium' | 'large')
 * @param fullScreen - Whether to display the loader full screen with themed background
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  fullScreen = false,
}) => {
  const colors = useColors();

  const sizeClasses = {
    small: 'w-24',
    medium: 'w-32',
    large: 'w-40'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center z-50'
    : 'flex items-center justify-center';

  return (
    <div 
      className={containerClasses}
      style={{ backgroundColor: colors['bg-primary'] }}
    >
      <div className="relative flex items-center justify-center">
        {/* Background glow effect */}
        <div 
          className="absolute w-full h-full animate-[pulse_2s_ease-in-out_infinite]"
          style={{
            background: `radial-gradient(circle, ${colors['brand-primary']}40 0%, transparent 70%)`,
            transform: 'scale(1.2)',
            filter: 'blur(20px)'
          }}
        />
        
        {/* Logo with animation */}
        <div className="animate-[bounce_3s_ease-in-out_infinite]">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`}
            alt="ProcessFlow Logo"
            className={`${sizeClasses[size]} transition-transform duration-300`}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 