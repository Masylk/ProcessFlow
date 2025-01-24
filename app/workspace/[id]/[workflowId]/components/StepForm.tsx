import React, { useState, ChangeEvent } from 'react';

interface StepFormProps {
  onSubmit: (blockData: any, path_id: number, position: number) => void;
  onCancel: () => void;
  initialPosition?: number;
  workflow_id?: number;
  path_id?: number;
  position?: number;
}

const StepForm: React.FC<StepFormProps> = ({
  onSubmit,
  onCancel,
  initialPosition,
  workflow_id,
  path_id,
  position,
}) => {
  const [formData, setFormData] = useState({
    type: 'STEP',
    description: '',
    position: initialPosition,
    workflow_id: workflow_id,
    stepDetails: '',
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (path_id && position)
      onSubmit(
        {
          ...formData,
          step_block: {
            stepDetails: formData.stepDetails,
          },
        },
        path_id,
        position
      );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-4">Add Step Block</h2>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label
          htmlFor="stepDetails"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Step Details
        </label>
        <textarea
          id="stepDetails"
          name="stepDetails"
          value={formData.stepDetails}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
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
          Add Step
        </button>
      </div>
    </form>
  );
};

export default StepForm;
