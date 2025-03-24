import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import TextEditor from './TextEditor';
import { useColors } from '@/app/theme/hooks';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { Block, TaskType } from '../types';
import BlockMediaVisualizer from './BlockMediaVisualizer';
import MediaUploader from './MediaUploader';
import IconModifier from './IconModifier';
import { useEditModeStore } from '../store/editModeStore';
import ButtonNormal from '@/app/components/ButtonNormal';
import { InputTokens } from '@/app/theme/types';
import InputField from '@/app/components/InputFields';

// Helper function from TextAreaInput
const getInputToken = (state: 'normal' | 'hover' | 'focus', type: 'bg' | 'fg' | 'border', destructive: boolean = false, disabled: boolean = false): keyof InputTokens => {
  if (disabled) {
    return `input-disabled-${type}` as keyof InputTokens;
  }
  
  const prefix = destructive ? 'input-destructive-' : 'input-';
  const suffix = state === 'normal' ? '' : `-${state}`;
  return `${prefix}${type}${suffix}` as keyof InputTokens;
};

interface BlockDetailsSidebarProps {
  block: Block;
  onClose: () => void;
  onUpdate: (updatedData: Partial<Block>) => void;
}

export default function BlockDetailsSidebar({
  block,
  onClose,
  onUpdate,
}: BlockDetailsSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingAverageTime, setIsEditingAverageTime] = useState(false);
  const [title, setTitle] = useState(block.title || '');
  const [averageTime, setAverageTime] = useState(block.average_time || '');
  const [taskType, setTaskType] = useState(block.task_type || 'MANUAL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [description, setDescription] = useState(block.description || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const colors = useColors(); // Get colors from the theme hook

  const setEditMode = useEditModeStore((state) => state.setEditMode);

  useEffect(() => {
    setEditMode(true, block.id.toString());
    return () => setEditMode(false);
  }, [block.id, setEditMode]);

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onUpdate({ title });
      setIsEditingTitle(false);
    } else if (e.key === 'Escape') {
      setTitle(block.title || '');
      setIsEditingTitle(false);
    }
  };

  const handleAverageTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onUpdate({ average_time: averageTime });
      setIsEditingAverageTime(false);
    } else if (e.key === 'Escape') {
      setAverageTime(block.average_time || '');
      setIsEditingAverageTime(false);
    }
  };

  // Only allow numbers in average time input with 12 digits limit
  const handleAverageTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if ((value === '' || /^\d+$/.test(value)) && value.length <= 12) {
      setAverageTime(value);
    }
  };

  const handleTaskTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setTaskType(newType);
    onUpdate({ task_type: newType as TaskType });
  };

  const handleDescriptionUpdate = () => {
    if (description !== block.description) {
      onUpdate({ description });
    }
    setIsEditingDescription(false);
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDescriptionUpdate();
    } else if (e.key === 'Escape') {
      setDescription(block.description || '');
      setIsEditingDescription(false);
    }
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('blockId', block.id.toString());
    navigator.clipboard.writeText(url.toString());
  };

  // Create sidebar content to be wrapped with ThemeProvider
  const sidebarContent = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-0 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="fixed top-0 right-0 h-screen w-[540px] shadow-lg p-6 border-l z-50 flex flex-col overflow-y-auto"
        style={{ 
          backgroundColor: colors['bg-primary'],
          borderColor: colors['border-primary']
        }}
        ref={sidebarRef}
      >
        {/* Close Button */}
        <ButtonNormal
          onClick={onClose}
          className="absolute top-4 left-6"
          size="small"
          variant="secondary"
          iconOnly
          leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/close-drawer.svg`}
          aria-label="Close"
        />

        {/* Container for the buttons to be aligned to the far right */}
        <div className="absolute top-4 right-4 flex gap-2">
          {/* Link Button */}
          <ButtonNormal
            onClick={handleCopyLink}
            size="small"
            variant="secondary"
            iconOnly
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-icon.svg`}
            aria-label="Copy Link"
          />

          {/* Message Button */}
          <ButtonNormal 
            size="small"
            variant="secondary"
            iconOnly
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/message-icon.svg`}
            aria-label="Message"
          />
        </div>

        {block && (
          <>
            {/* Information Section */}
            <div className="flex items-center mt-8 h-[50px] space-x-4">
              <IconModifier block={block} onUpdate={onUpdate} />
              {isEditingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => onUpdate({ title })}
                  onKeyDown={handleTitleKeyDown}
                  autoFocus
                  className="text-lg font-semibold border-b-2 outline-none bg-transparent"
                  style={{ 
                    color: colors['text-primary'],
                    borderColor: colors['accent-primary'] 
                  }}
                  placeholder="Enter title"
                />
              ) : (
                <h1
                  className="text-lg font-semibold cursor-pointer px-2 py-1 rounded hover:bg-opacity-50"
                  style={{ 
                    color: colors['text-primary'],
                    backgroundColor: 'transparent',
                  }}
                  onClick={() => {
                    setIsEditingTitle(true);
                    setTitle(block.title || '');
                  }}
                >
                  {block.title || 'Untitled Block'}
                </h1>
              )}
            </div>

            {/* Main Info Container */}
            <div className="border-t border-b my-4 py-4" style={{ borderColor: colors['border-primary'] }}>
              <div className=" flex flex-col gap-4">
                
                {/* Last Modified */}
                <div className="flex justify-start items-center space-x-[45px]">
                  <div className="text-sm font-normal font-['Inter']" style={{ color: colors['text-primary'] }}>
                    Last Modified
                  </div>
                  <div className="text-xs font-normal font-['Inter']" style={{ color: colors['text-secondary'] }}>
                    {block.last_modified
                      ? new Date(block.last_modified).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>

                {/* Average Time */}
                <div className="flex justify-start items-center space-x-[36px]">
                  <div className="text-sm font-normal font-['Inter']" style={{ color: colors['text-primary'] }}>
                    Average Time
                  </div>
                  <div className="flex items-center gap-2" style={{ width: '140px' }}>
                    <InputField
                      type="default"
                      size="small"
                      value={averageTime}
                      onChange={(value) => {
                        if ((value === '' || /^\d+$/.test(value)) && value.length <= 12) {
                          setAverageTime(value);
                        }
                      }}
                      onBlur={() => {
                        onUpdate({ average_time: averageTime });
                        setIsEditingAverageTime(false);
                      }}
                      onKeyDown={handleAverageTimeKeyDown}
                      placeholder="Enter time"
                    />
                    <span className="text-xs" style={{ color: colors['text-secondary'] }}>min</span>
                  </div>
                </div>

                {/* Task Type */}
                <div className="flex justify-start items-center space-x-[94px]">
                  <div className="text-sm font-normal font-['Inter']" style={{ color: colors['text-primary'] }}>
                    Type
                  </div>
                  <div className="relative" style={{ width: '140px' }}>
                    <div
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer`}
                      style={{
                        backgroundColor: colors[getInputToken('normal', 'bg', false, false)],
                        borderColor: isDropdownOpen 
                          ? colors[getInputToken('focus', 'border', false, false)]
                          : colors[getInputToken('normal', 'border', false, false)],
                        boxShadow: isDropdownOpen
                          ? "0px 0px 0px 4px rgba(78,107,215,0.12)"
                          : '0px 1px 2px rgba(16, 24, 40, 0.05)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        
                        <span className="text-sm font-medium" style={{ color: colors['text-primary'] }}>
                          {taskType === 'MANUAL' ? 'Manual' : 'Automatic'}
                        </span>
                      </div>
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/chevron-${isDropdownOpen ? 'up' : 'down'}.svg`}
                        alt="Toggle dropdown"
                        className="w-4 h-4"
                      />
                    </div>

                    {isDropdownOpen && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-full border rounded-lg shadow-lg z-50 overflow-hidden"
                        style={{ 
                          backgroundColor: colors['bg-primary'],
                          borderColor: colors['border-primary']
                        }}
                      >
                        {[
                          { value: 'MANUAL', label: 'Manual', icon: 'manual-icon.svg' },
                          { value: 'AUTOMATIC', label: 'Automatic', icon: 'automatic-icon.svg' }
                        ].map((option) => (
                          <div
                            key={option.value}
                            onClick={() => {
                              handleTaskTypeChange({ target: { value: option.value } } as any);
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center justify-between px-3 py-2 cursor-pointer transition-colors duration-150"
                            style={{
                              backgroundColor: taskType === option.value 
                                ? colors['bg-selected'] 
                                : 'transparent',
                              color: colors['text-primary']
                            }}
                          >
                            <div className="flex items-center gap-2">
                             
                              <span className="text-sm font-medium">
                                {option.label}
                              </span>
                            </div>
                            {taskType === option.value && (
                              <img
                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon2.svg`}
                                alt="Selected"
                                className="w-4 h-4"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="my-4">
              <div className="text-sm font-medium font-['Inter'] leading-tight mb-3" style={{ color: colors['text-primary'] }}>
                Description
              </div>
              <div
                className="min-h-[100px] rounded-lg transition-colors duration-200"
                onClick={() => setIsEditingDescription(true)}
              >
                <div
                  style={{
                    backgroundColor: colors[getInputToken('normal', 'bg', false, !isEditingDescription)],
                    color: colors[getInputToken('normal', 'fg', false, !isEditingDescription)],
                    borderColor: colors[getInputToken('normal', 'border', false, !isEditingDescription)],
                    boxShadow: isEditingDescription
                      ? "0px 0px 0px 4px rgba(78,107,215,0.12)"
                      : '0px 1px 2px rgba(16, 24, 40, 0.05)',
                    borderWidth: '1px',
                    borderRadius: '0.5rem',
                  }}
                  className="relative flex items-start gap-2 p-3 transition-all duration-200"
                >
                  <TextEditor
                    value={description}
                    onChange={setDescription}
                    onBlur={handleDescriptionUpdate}
                    onKeyDown={handleDescriptionKeyDown}
                    readOnly={!isEditingDescription}
                    className={`w-full border-none outline-none  resize-vertical text-base leading-6 font-inter ${isEditingDescription ? 'cursor-text' : 'cursor-pointer'}`}
                    placeholder="Add a description..."
                    textColor={colors['text-primary']}
                  />
                </div>
              </div>
            </div>

            {/* Media Section */}
            <div className="flex flex-col justify-start mt-2">
              <div className="text-sm font-medium font-['Inter'] leading-tight mb-3" style={{ color: colors['text-primary'] }}>
                Media
              </div>
              {block.image ? (
                <BlockMediaVisualizer
                  block={block}
                  altText="Block Media"
                  onUpdate={onUpdate}
                />
              ) : (
                <MediaUploader block={block} onUpdate={onUpdate} />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );

  // Use createPortal with ThemeProvider
  return createPortal(
    <ThemeProvider>
      {sidebarContent}
    </ThemeProvider>,
    document.body
  );
}
