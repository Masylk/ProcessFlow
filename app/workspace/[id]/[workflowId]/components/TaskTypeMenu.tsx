import React, { useState } from 'react';

interface TaskTypeMenuProps {
  selectedType: 'MANUAL' | 'AUTOMATIC' | undefined;
  onChange: (newType: 'MANUAL' | 'AUTOMATIC') => void;
}

const TaskTypeMenu: React.FC<TaskTypeMenuProps> = ({
  selectedType,
  onChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleSelect = (type: 'MANUAL' | 'AUTOMATIC') => {
    onChange(type);
    setIsDropdownOpen(false); // Close the dropdown after selection
  };

  return (
    <div className="relative">
      <div
        className={`w-[100px] h-[30px] px-2 py-1.5 bg-white rounded-lg flex justify-between items-center cursor-pointer border ${
          isDropdownOpen ? 'border-2 border-[#4e6bd7] p-1' : 'border-[#d0d5dd]'
        }`}
        onClick={toggleDropdown}
      >
        <div className="text-[#344054] text-xs font-medium font-['Inter'] leading-[18px]">
          {selectedType === 'AUTOMATIC' ? 'Automatic' : 'Manual'}
        </div>
        <div className="w-4 h-4 relative">
          <img
            src={`/assets/shared_components/chevron-${
              isDropdownOpen ? 'up' : 'down'
            }.svg`}
            alt="Chevron icon"
            className="absolute top-1/2 transform -translate-y-1/2 right-0"
          />
        </div>
      </div>

      {isDropdownOpen && (
        <div className="absolute w-[120px] bg-white border border-[#d0d5dd] top-[20px] rounded-lg shadow-lg mt-1 z-10">
          <div
            className="flex items-center justify-between px-2 py-1.5 text-xs font-medium text-[#344054] cursor-pointer hover:bg-[#f1f5f9]"
            onClick={() => handleSelect('MANUAL')}
          >
            Manual
            {selectedType === 'MANUAL' && (
              <img
                src="/assets/shared_components/check-icon2.svg"
                alt="Check icon"
                className="w-4 h-4"
              />
            )}
          </div>
          <div
            className="flex items-center justify-between px-2 py-1.5 text-xs font-medium text-[#344054] cursor-pointer hover:bg-[#f1f5f9]"
            onClick={() => handleSelect('AUTOMATIC')}
          >
            Automatic
            {selectedType === 'AUTOMATIC' && (
              <img
                src="/assets/shared_components/check-icon2.svg"
                alt="Check icon"
                className="w-4 h-4"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTypeMenu;
