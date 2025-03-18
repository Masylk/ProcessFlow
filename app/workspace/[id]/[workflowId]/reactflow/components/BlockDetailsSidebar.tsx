import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import TextEditor from './TextEditor';
import { Block } from '../types';

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
  const [title, setTitle] = useState(block.title || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleTitleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/blocks/${block.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update title');
      }

      onUpdate({ title });
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Error updating title:', error);
      setTitle(block.title || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle(block.title || '');
      setIsEditingTitle(false);
    }
  };

  console.log('BlockDetailsSidebar - Block Data:', {
    id: block?.id,
    title: block?.title,
    type: block?.type,
    description: block?.description,
    taskType: block?.task_type,
    averageTime: block?.average_time,
    lastModified: block?.last_modified,
    icon: block?.icon,
    image: block?.image,
    position: block?.position,
  });

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="fixed top-0 right-0 h-screen w-[540px] bg-white shadow-lg p-6 border-l border-[#e4e7ec] z-50 flex flex-col overflow-y-auto"
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
          <button className="h-7 w-7 p-1 bg-white rounded-lg border border-[#d0d5dd] inline-flex items-center justify-center gap-2">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-icon.svg`}
              alt="Link"
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
              <div className="w-10 h-10 rounded-lg border border-[#e4e7ec] flex items-center justify-center">
                {block.icon && (
                  <img src={block.icon} alt="Block Icon" className="w-6 h-6" />
                )}
              </div>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
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
                <div className="flex justify-start items-center space-x-[45px]">
                  <div className="text-[#344054] text-sm font-normal font-['Inter']">
                    Average Time
                  </div>
                  <div className="text-[#667085] text-xs font-normal font-['Inter']">
                    {block.average_time || 'N/A'}
                  </div>
                </div>

                {/* Task Type */}
                <div className="flex justify-start items-center space-x-[100px]">
                  <div className="text-[#344054] text-sm font-normal font-['Inter']">
                    Type
                  </div>
                  <div className="text-[#667085] text-xs font-normal font-['Inter']">
                    {block.task_type || 'Manual'}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="mt-0">
              <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight mb-3">
                Description
              </div>
              <TextEditor value={block.description || ''} onChange={() => {}} />
            </div>

            {/* Media Section */}
            <div className="flex flex-col justify-start mt-2 h-[126px]">
              <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight mb-2">
                Media
              </div>
              {block.image && (
                <div className="relative w-full h-[267px]">
                  <img
                    className="w-full h-full object-cover rounded-xl"
                    src={block.image}
                    alt="Block Media"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>,
    document.body
  );
}
