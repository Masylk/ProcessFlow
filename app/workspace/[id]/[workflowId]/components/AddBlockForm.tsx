import React, { useState, ChangeEvent } from 'react';
import { Block } from '@/types/block';

interface AddBlockFormProps {
  onSubmit: (blockData: Pick<Block, 'description' | 'type'>) => void;
  onCancel: () => void;
}

const AddBlockForm: React.FC<AddBlockFormProps> = ({ onSubmit, onCancel }) => {
  const [blockData, setBlockData] = useState<Pick<Block, 'description' | 'type'>>({
    description: '',
    type: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlockData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(blockData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Add New Block</h2>
        <div className="mb-4">
          <label htmlFor="type" className="block mb-2">Type</label>
          <select
            id="type"
            name="type"
            value={blockData.type}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          >
            <option value="">Select a type</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            value={blockData.description}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Block</button>
        </div>
      </form>
    </div>
  );
};

export default AddBlockForm;