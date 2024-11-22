import Breadcrumbs from '@/app/components/Breadcrumbs';
import React, { useState } from 'react';

interface TitleBarProps {
  title: string;
  onUpdateTitle: (newTitle: string) => Promise<void>;
}

const TitleBar: React.FC<TitleBarProps> = ({ title, onUpdateTitle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleSaveTitle = async () => {
    if (newTitle !== title) {
      await onUpdateTitle(newTitle);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2">
      {!isEditing ? (
        <Breadcrumbs
          first_text="Test"
          second_text={title}
          onSecondTextClick={() => setIsEditing(true)}
        />
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button
            onClick={handleSaveTitle}
            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default TitleBar;
