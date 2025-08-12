'use client';

import React from 'react';
import { useColors } from '@/app/theme/hooks';

interface SwitchProps {
  isOn: boolean;
  handleToggle: () => void;
  label?: string;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({
  isOn,
  handleToggle,
  label,
  disabled = false,
}) => {
  const colors = useColors();

  return (
    <div className={`flex items-center ${disabled ? 'opacity-50' : ''}`}>
      <label
        htmlFor="switch"
        className={`flex items-center ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div className="relative">
          <input
            id="switch"
            type="checkbox"
            className="sr-only"
            checked={isOn}
            onChange={handleToggle}
            disabled={disabled}
          />
          <div
            style={{
              backgroundColor: isOn
                ? colors['bg-brand-primary']
                : colors['bg-secondary'],
            }}
            className="block w-14 h-8 rounded-full transition-colors"
          ></div>
          <div
            className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform"
            style={{
              transform: isOn ? 'translateX(100%)' : 'translateX(0)',
              backgroundColor: colors['bg-primary'],
            }}
          ></div>
        </div>
        {label && (
          <span
            style={{ color: colors['text-primary'] }}
            className="ml-3 text-sm font-medium"
          >
            {label}
          </span>
        )}
      </label>
    </div>
  );
};

export default Switch;
