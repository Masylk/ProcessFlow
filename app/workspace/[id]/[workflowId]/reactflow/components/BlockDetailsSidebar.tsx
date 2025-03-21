import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import TextEditor from './TextEditor';
import { Block, TaskType } from '../types';
import BlockMediaVisualizer from './BlockMediaVisualizer';
import MediaUploader from './MediaUploader';
import IconModifier from './IconModifier';
import { useEditModeStore } from '../store/editModeStore';

interface BlockDetailsSidebarProps {
  block: Block;
  onClose: () => void;
  onUpdate: (updatedData: Partial<Block>) => void;
  colors: Record<string, string>;
}

export default function BlockDetailsSidebar({
  block,
  onClose,
  onUpdate,
  colors,
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

  const handleAverageTimeKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
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

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-0 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="fixed top-0 right-0 h-screen w-[540px] shadow-lg p-6 border-l border-[#e4e7ec] z-50 flex flex-col overflow-y-auto"
        style={{ backgroundColor: colors['bg-primary'] }}
        ref={sidebarRef}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-6 h-7 w-7 p-1 bg-white rounded-lg border border-[#d0d5dd] inline-flex items-center justify-center gap-2"
        >
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/close-drawer.svg`}
            alt="Close"
            className="w-4 h-4"
          />
        </button>

        {/* Container for the buttons to be aligned to the far right */}
        <div className="absolute top-4 right-4 flex gap-2">
          {/* Link Button */}
          <button
            onClick={handleCopyLink}
            className="h-7 w-7 p-1 bg-white rounded-lg border border-[#d0d5dd] inline-flex items-center justify-center gap-2"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-icon.svg`}
              alt="Copy Link"
              className="w-4 h-4"
            />
          </button>

          {/* Message Button */}
          <button className="h-7 w-7 p-1 bg-white rounded-lg border border-[#d0d5dd] inline-flex items-center justify-center gap-2">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/message-icon.svg`}
              alt="Message"
              className="w-4 h-4"
            />
          </button>
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
                  className="text-lg font-semibold text-gray-800 border-b-2 border-blue-500 outline-none bg-transparent"
                  placeholder="Enter title"
                />
              ) : (
                <h1
                  className="text-lg font-semibold text-gray-800 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
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
            <div className="border-t border-b border-[#e4e7ec] my-4 py-4">
              <div className="h-[152px] flex flex-col gap-4">
                {/* Assignee */}
                <div className="flex justify-start items-center space-x-[72px]">
                  <div className="text-[#344054] text-sm font-normal font-['Inter']">
                    Assignee
                  </div>
                  <div className="px-1.5 py-0.5 bg-[#eef3ff] rounded-md border-[#c6d7fe]">
                    <div className="text-center text-[#3537cc] text-xs font-medium font-['Inter']">
                      Human Resources
                    </div>
                  </div>
                </div>

                {/* Last Modified */}
                <div className="flex justify-start items-center space-x-[45px]">
                  <div className="text-[#344054] text-sm font-normal font-['Inter']">
                    Last Modified
                  </div>
                  <div className="text-[#667085] text-xs font-normal font-['Inter']">
                    {block.last_modified
                      ? new Date(block.last_modified).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>

                {/* Average Time */}
                <div className="flex justify-start items-center space-x-[36px]">
                  <div className="text-[#344054] text-sm font-normal font-['Inter']">
                    Average Time
                  </div>
                  {isEditingAverageTime ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={averageTime}
                        onChange={handleAverageTimeChange}
                        onBlur={() => {
                          onUpdate({ average_time: averageTime });
                          setIsEditingAverageTime(false);
                        }}
                        onKeyDown={handleAverageTimeKeyDown}
                        autoFocus
                        className="text-xs font-normal font-['Inter'] outline-none border border-gray-300 rounded px-2 py-1 w-16"
                        placeholder="Enter time"
                      />
                      <span className="text-xs text-[#667085]">min</span>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsEditingAverageTime(true)}
                      className="text-[#667085] text-xs font-normal font-['Inter'] cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                    >
                      {averageTime ? `${averageTime} min` : 'N/A'}
                    </div>
                  )}
                </div>

                {/* Task Type */}
                <div className="flex justify-start items-center space-x-[94px]">
                  <div className="text-[#344054] text-sm font-normal font-['Inter']">
                    Type
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-between text-xs font-normal font-['Inter'] text-[#667085] outline-none hover:bg-gray-50 rounded px-2 py-1 pr-8 cursor-pointer min-w-[100px]"
                    >
                      {taskType === 'MANUAL' ? 'Manual' : 'Automatic'}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.5 4.5L6 8L9.5 4.5"
                            stroke="#667085"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <button
                          onClick={() => {
                            handleTaskTypeChange({
                              target: { value: 'MANUAL' },
                            } as any);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 flex items-center justify-between"
                        >
                          Manual
                          {taskType === 'MANUAL' && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M2 6L5 9L10 3"
                                stroke="#667085"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            handleTaskTypeChange({
                              target: { value: 'AUTOMATIC' },
                            } as any);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 flex items-center justify-between"
                        >
                          Automatic
                          {taskType === 'AUTOMATIC' && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M2 6L5 9L10 3"
                                stroke="#667085"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="mt-0">
              <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight mb-3">
                Description
              </div>
              <div
                className="min-h-[100px] rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                onClick={() => setIsEditingDescription(true)}
              >
                <TextEditor
                  value={description}
                  onChange={setDescription}
                  onBlur={handleDescriptionUpdate}
                  onKeyDown={handleDescriptionKeyDown}
                  readOnly={!isEditingDescription}
                  className={`p-3 text-sm text-gray-600 ${isEditingDescription ? 'cursor-text' : 'cursor-pointer'}`}
                  placeholder="Add a description..."
                />
              </div>
            </div>

            {/* Media Section */}
            <div className="flex flex-col justify-start mt-2">
              <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight mb-2">
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
    </>,
    document.body
  );
}
