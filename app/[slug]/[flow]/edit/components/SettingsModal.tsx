import React, { useState, useEffect } from 'react';
import { useColors, useTheme } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import type { ThemeMode } from '@/app/theme/types';
import { useStrokeLinesStore } from '../store/strokeLinesStore';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const colors = useColors();
  const { currentTheme, setTheme } = useTheme();
  const { allStrokeLinesVisible, toggleAllStrokeLines } = useStrokeLinesStore();

  // Handle reset to defaults
  const handleResetToDefaults = () => {
    setTheme('light');
    useStrokeLinesStore.getState().setAllStrokeLinesVisible(true);
  };

  return (
    <div 
      className="flex items-center justify-center p-8 h-full w-full"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0">
        <div 
          style={{ backgroundColor: colors['bg-overlay'] }}
          className="absolute inset-0 opacity-70" 
        />
      </div>

      {/* Modal content */}
      <div 
        className="relative z-10 w-[600px] max-h-[90vh] rounded-xl shadow-lg flex flex-col overflow-hidden border border-white/10"
        style={{ 
          backgroundColor: colors['bg-primary'],
          boxShadow: `0 10px 50px -12px ${colors['accent-primary']}30`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <ButtonNormal
          variant="tertiary"
          iconOnly
          size="small"
          className="absolute top-4 right-4"
          onClick={onClose}
          leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/x-close-icon.svg`}
        />

        {/* Modal header */}
        <div className="px-6 py-6 border-b"
          style={{ borderColor: colors['border-primary'] }}>
          <div>
            <h1 
              className="text-lg font-semibold"
              style={{ color: colors['text-primary'] }}
            >
              Appearance Settings
            </h1>
            <p 
              className="text-sm mt-1"
              style={{ color: colors['text-secondary'] }}
            >
              Customize the visual appearance of your workspace
            </p>
          </div>
        </div>

        {/* Content area with scrolling */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Interface Theme */}
          <div className="flex flex-col gap-1">
            <h3 className="text-md font-medium" style={{ color: colors['text-primary'] }}>
              Interface theme
            </h3>
            <p className="text-sm mb-4" style={{ color: colors['text-secondary'] }}>
              Customize your application theme
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {/* Light Theme Option */}
              <div 
                className="relative cursor-pointer group"
                onClick={() => setTheme('light')}
              >
                <div 
                  style={{ 
                    backgroundColor: colors['bg-primary'],
                    borderColor: currentTheme === 'light' ? colors['text-accent'] : colors['border-secondary']
                  }}
                  className="aspect-[4/3] rounded-xl border-2 overflow-hidden transition-all duration-200 hover:border-[#4761c4]"
                >
                  <div className="w-full h-full p-2">
                    <div className="w-full h-full rounded-lg bg-[#F9FAFB] overflow-hidden">
                      <div className="h-2 w-8 bg-[#D0D5DD] rounded-full m-2"></div>
                      <div className="space-y-1 px-2">
                        <div className="h-1 w-3/4 bg-[#D0D5DD] rounded-full"></div>
                        <div className="h-1 w-1/2 bg-[#D0D5DD] rounded-full"></div>
                        <div className="h-1 w-2/3 bg-[#D0D5DD] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                {currentTheme === 'light' && (
                  <div className="absolute -right-1 -top-1">
                    <div 
                      style={{ 
                        backgroundColor: colors['bg-primary'],
                        borderColor: colors['border-primary']
                      }}
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    >
                      <div className="w-4 h-4 rounded-full bg-[#4761c4] flex items-center justify-center">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-white.svg`}
                          alt="Selected"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <p 
                  style={{ color: colors['text-primary'] }}
                  className="mt-2 text-sm font-medium text-center"
                >
                  Light
                </p>
              </div>

              {/* Dark Theme Option */}
              <div 
                className="relative cursor-pointer group"
                onClick={() => setTheme('dark')}
              >
                <div 
                  style={{ 
                    backgroundColor: colors['bg-primary'],
                    borderColor: currentTheme === 'dark' ? colors['text-accent'] : colors['border-secondary']
                  }}
                  className="aspect-[4/3] rounded-xl border-2 overflow-hidden transition-all duration-200 hover:border-[#4761c4]"
                >
                  <div className="w-full h-full p-2">
                    <div className="w-full h-full rounded-lg bg-[#1C1C1C] overflow-hidden">
                      <div className="h-2 w-8 bg-[#2C2C2C] rounded-full m-2"></div>
                      <div className="space-y-1 px-2">
                        <div className="h-1 w-3/4 bg-[#2C2C2C] rounded-full"></div>
                        <div className="h-1 w-1/2 bg-[#2C2C2C] rounded-full"></div>
                        <div className="h-1 w-2/3 bg-[#2C2C2C] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                {currentTheme === 'dark' && (
                  <div className="absolute -right-1 -top-1">
                    <div 
                      style={{ 
                        backgroundColor: colors['bg-primary'],
                        borderColor: colors['border-primary']
                      }}
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    >
                      <div className="w-4 h-4 rounded-full bg-[#4761c4] flex items-center justify-center">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-white.svg`}
                          alt="Selected"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <p 
                  style={{ color: colors['text-primary'] }}
                  className="mt-2 text-sm font-medium text-center"
                >
                  Dark
                </p>
              </div>
            </div>
          </div>

          {/* Connecting lines */}
          <div className="flex flex-col gap-1">
            <h3 className="text-md font-medium" style={{ color: colors['text-primary'] }}>
              Connecting lines
            </h3>
            <p className="text-sm mb-4" style={{ color: colors['text-secondary'] }}>
              Toggle visibility of all stroke lines between blocks
            </p>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={allStrokeLinesVisible}
                  onChange={toggleAllStrokeLines}
                />
                <div className={`w-11 h-6 rounded-full peer ${allStrokeLinesVisible ? 'bg-pink-400' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
              </label>
              <span className="text-sm" style={{ color: colors['text-secondary'] }}>
                {allStrokeLinesVisible ? 'Visible' : 'Hidden'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;