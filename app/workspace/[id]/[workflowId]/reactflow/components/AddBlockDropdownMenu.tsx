import React from 'react';
import { createParallelPaths } from '../utils/createParallelPaths';
import { DropdownDatas } from '../types';

interface AddBlockDropdownMenuProps {
  dropdownDatas: DropdownDatas;
  onSelect: (blockType: 'STEP' | 'PATH' | 'DELAY') => void;
  onClose: () => void;
}

const AddBlockDropdownMenu: React.FC<AddBlockDropdownMenuProps> = ({
  dropdownDatas,
  onSelect,
  onClose,
}) => {
  const menuItems = [
    {
      type: 'STEP' as const,
      label: 'Step Block',
      icon: '/step-icons/default-icons/container.svg',
    },
    {
      type: 'PATH' as const,
      label: 'Path Block',
      icon: '/step-icons/default-icons/path.svg',
    },
    {
      type: 'DELAY' as const,
      label: 'Delay Block',
      icon: '/step-icons/default-icons/delay.svg',
    },
  ];

  const handleSelect = async (type: string) => {
    if (type === 'PATH') {
      console.log('creating parallel paths');
      try {
        await createParallelPaths(dropdownDatas.path, dropdownDatas.position);
        onClose();
      } catch (error) {
        console.error('Error creating parallel paths:', error);
      }
    } else {
      console.log('creating block');
      onSelect(type as 'STEP' | 'PATH' | 'DELAY');
    }
  };

  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className="absolute bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-50"
        style={{
          top: dropdownDatas.y,
          left: dropdownDatas.x,
          transform: 'translate(-50%, -100%)',
        }}
      >
        {menuItems.map((item) => (
          <button
            key={item.type}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-left"
            onClick={() => handleSelect(item.type)}
          >
            <img src={item.icon} alt={item.label} className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default AddBlockDropdownMenu;
