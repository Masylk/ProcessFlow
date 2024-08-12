import React, { useState } from 'react';

interface DelayFormProps {
  onSubmit: (blockData: any) => void;
  onCancel: () => void;
  initialPosition: number;
  workflowId: number;
}

export default function DelayForm({
  onSubmit,
  onCancel,
  initialPosition,
  workflowId,
}: DelayFormProps) {
  const [description, setDescription] = useState('');
  const [delay, setDelay] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: 'DELAY',
      position: initialPosition,
      icon: 'clock-icon',
      description,
      workflowId,
      delayBlock: {
        delay: delay,
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-4">Add Delay Block</h2>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description:
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter a description for the delay"
        />
      </div>
      <div>
        <label
          htmlFor="delay"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Delay (in seconds):
        </label>
        <input
          type="number"
          id="delay"
          value={delay}
          onChange={(e) => setDelay(Number(e.target.value))}
          min="0"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Add Delay Block
        </button>
      </div>
    </form>
  );
}
