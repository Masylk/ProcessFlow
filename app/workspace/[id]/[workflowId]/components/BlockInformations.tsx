import React, { useState, useEffect } from 'react';
import { Block } from '@/types/block';

interface BlockInformationsProps {
  block: Block;
  onUpdate: (updatedFields: Partial<Block>) => void;
}

export default function BlockInformations({
  block,
  onUpdate,
}: BlockInformationsProps) {
  // State to track the local copy of the block
  const [localBlock, setLocalBlock] = useState<Block>(block);

  // Update the local block state whenever the block prop changes
  useEffect(() => {
    setLocalBlock(block);
  }, [block]);

  // Function to format the date in dd/mm/yyyy format
  const formatDate = (date: Date | undefined) => {
    const targetDate = date ? new Date(date) : new Date(); // Default to today's date if no date is provided
    const day = targetDate.getDate().toString().padStart(2, '0');
    const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const year = targetDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle the change in averageTime
  const handleAverageTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalBlock((prev) => ({
      ...prev,
      averageTime: e.target.value,
    }));
  };

  const handleBlur = () => {
    // When the input field loses focus, update the parent component
    onUpdate({ averageTime: localBlock.averageTime }); // Send updated averageTime to parent component
  };

  const handleClick = () => {
    // Switch to editing mode for averageTime
  };

  return (
    <div className="border-t border-b border-[#e4e7ec] my-4 py-4">
      <div className="h-36 justify-start items-start gap-6 inline-flex">
        <div className="self-stretch flex-col justify-between items-start inline-flex">
          <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
            Assignee
          </div>
          <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
            Last Modified
          </div>
          <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
            Average time
          </div>
          <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
            Type
          </div>
        </div>
        <div className="h-36 flex-col justify-between items-start inline-flex">
          <div className="h-[18px] justify-start items-center gap-2 inline-flex">
            <div className="px-1.5 py-0.5 bg-[#eef3ff] rounded-md border-[#c6d7fe] justify-start items-center flex">
              <div className="text-center text-[#3537cc] text-xs font-medium font-['Inter'] leading-[18px]">
                Human Resources
              </div>
            </div>
          </div>
          <div className="justify-start items-center gap-2 inline-flex">
            <div className="text-center text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
              {formatDate(localBlock.lastModified)} {/* Use localBlock here */}
            </div>
          </div>
          <div className="justify-start items-center gap-2 inline-flex">
            <div
              className="text-center text-[#667085] text-xs font-normal font-['Inter'] leading-[18px] cursor-pointer"
              onClick={handleClick}
            >
              {localBlock.averageTime ? (
                <input
                  type="text"
                  value={localBlock.averageTime}
                  onChange={handleAverageTimeChange}
                  onBlur={handleBlur}
                  className="border-none outline-none text-left text-xs font-normal font-['Inter']"
                  autoFocus
                />
              ) : (
                'N/A'
              )}
            </div>
          </div>
          <div className="justify-start items-center gap-2 inline-flex">
            <div className="text-center text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
              {localBlock.taskType === 'MANUAL' ? 'Manual' : 'Automatic'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
