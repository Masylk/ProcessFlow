import React, { useState, useEffect } from 'react';
import { Block } from '@/types/block';
import TaskTypeMenu from './TaskTypeMenu';
import IconModifier from './IconModifier';

interface BlockInformationsProps {
  block: Block;
  onUpdate: (updatedFields: Partial<Block>) => void;
}

export default function BlockInformations({
  block,
  onUpdate,
}: BlockInformationsProps) {
  const [localBlock, setLocalBlock] = useState<Block>({
    ...block,
    averageTime: block.averageTime || 'N/A',
    title: block.title || '', // Add initial title state
    taskType: block.taskType || 'MANUAL', // Ensure taskType is set correctly
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false); // Separate state for title editing
  const [isEditingAverageTime, setIsEditingAverageTime] = useState(false); // Separate state for averageTime editing
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown open/close

  useEffect(() => {
    setLocalBlock({
      ...block,
      averageTime: block.averageTime || 'N/A',
      title: block.title || '', // Reset title if block changes
      taskType: block.taskType || 'MANUAL', // Reset taskType if block changes
    });
  }, [block]);

  const handleAverageTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || 'N/A';
    setLocalBlock((prev) => ({
      ...prev,
      averageTime: value,
    }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalBlock((prev) => ({
      ...prev,
      title: e.target.value,
    }));
  };

  const handleBlur = () => {
    setIsEditingTitle(false); // Exit editing mode for title
    setIsEditingAverageTime(false); // Exit editing mode for averageTime
    const updatedAverageTime =
      localBlock.averageTime === 'N/A' ? undefined : localBlock.averageTime;
    const updatedTitle = localBlock.title || undefined; // Handle undefined title
    const updates: Partial<Block> = {};

    if (updatedAverageTime !== block.averageTime) {
      updates.averageTime = updatedAverageTime;
    }
    if (updatedTitle !== block.title) {
      updates.title = updatedTitle;
    }

    if (Object.keys(updates).length) {
      onUpdate(updates); // Call onUpdate with all updates
    }
  };

  const handleFocus = (field: 'title' | 'averageTime') => {
    if (field === 'title') {
      setIsEditingTitle(true); // Enter editing mode for title
    } else if (field === 'averageTime') {
      setIsEditingAverageTime(true); // Enter editing mode for averageTime
    }
  };

  const formatDate = (date: Date | undefined) => {
    const targetDate = date ? new Date(date) : new Date();
    const day = targetDate.getDate().toString().padStart(2, '0');
    const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const year = targetDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleTaskTypeChange = (newTaskType: 'MANUAL' | 'AUTOMATIC') => {
    setLocalBlock((prev) => ({
      ...prev,
      taskType: newTaskType,
    }));
    onUpdate({ taskType: newTaskType });
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev); // Toggle dropdown state
  };

  const handleIconUpdate = (newIcon: string) => {
    setLocalBlock((prev) => ({
      ...prev,
      icon: newIcon,
    }));
    onUpdate({ icon: newIcon });
  };

  return (
    <>
      {/* New block of code outside the container */}
      <div className="flex items-center mt-8 h-[50px] space-x-4">
        <IconModifier initialIcon={localBlock.icon} onUpdate={handleIconUpdate} />
        {localBlock && (
          <h1 className="text-lg font-semibold text-gray-800">
            <input
              type="text"
              value={
                isEditingTitle
                  ? localBlock.title || 'Untitled Block'
                  : `${localBlock.position + 1}. ${
                      localBlock.title || 'Untitled Block'
                    }`
              }
              onChange={handleTitleChange}
              onBlur={handleBlur}
              onFocus={() => handleFocus('title')}
              className={`text-lg font-semibold text-gray-800 outline-none ${
                isEditingTitle
                  ? 'h-[46px] px-3 py-2 bg-white rounded-lg shadow border-2 border-[#4e6bd7] justify-start items-center gap-2 inline-flex'
                  : 'border-none bg-transparent'
              }`}
            />
          </h1>
        )}
      </div>

      {/* Main container */}
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
              {formatDate(localBlock.lastModified)}
            </div>
          </div>
          {/* Average Time */}
          <div className="flex justify-start h-[150px] items-center space-x-[45px]">
            <div className="text-[#344054] text-sm font-normal font-['Inter']">
              Average Time
            </div>
            <input
              type="text"
              value={localBlock.averageTime}
              onChange={handleAverageTimeChange}
              onBlur={handleBlur}
              onFocus={() => handleFocus('averageTime')}
              className={`text-xs font-normal font-['Inter'] outline-none ${
                isEditingAverageTime
                  ? 'h-[30px] px-3 py-1.5 rounded-lg shadow border-2 bg-white border-[#4e6bd7] text-[#101828]'
                  : 'border-none text-[#667085]'
              }`}
            />
          </div>
          {/* Task Type */}
          <div className="flex justify-start items-center space-x-[100px]">
            <div className="text-[#344054] text-sm font-normal font-['Inter']">
              Type
            </div>
            <TaskTypeMenu
              selectedType={localBlock.taskType}
              onChange={handleTaskTypeChange}
            ></TaskTypeMenu>
          </div>
        </div>
      </div>
    </>
  );
}
