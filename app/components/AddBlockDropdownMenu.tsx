import React from 'react';

interface AddBlockDropdownMenuProps {
  position: { x: number; y: number };
  onSelect: (blockType: 'STEP' | 'PATH' | 'DELAY') => void;
  onClose: () => void;
}

const AddBlockDropdownMenu: React.FC<AddBlockDropdownMenuProps> = ({
  position,
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

  return (
    <>
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div
        className="absolute bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-50"
        style={{
          top: position.y,
          left: position.x,
          transform: 'translate(-50%, -100%)',
        }}
      >
        {menuItems.map((item) => (
          <button
            key={item.type}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-left"
            onClick={() => onSelect(item.type)}
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