import React, { useState, ChangeEvent } from 'react';

interface PathFormProps {
  onSubmit: (blockData: any, pathId: number, position: number) => void;
  onCancel: () => void;
  initialPosition: number;
  workflowId: number;
  pathId: number;
  position: number;
}

const PathForm: React.FC<PathFormProps> = ({
  onSubmit,
  onCancel,
  initialPosition,
  workflowId,
  pathId,
  position,
}) => {
  const [formData, setFormData] = useState({
    type: 'PATH',
    description: '',
    position: initialPosition,
    workflowId: workflowId,
    pathOptions: [''],
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePathOptionChange = (index: number, value: string) => {
    const newPathOptions = [...formData.pathOptions];
    newPathOptions[index] = value;
    setFormData((prev) => ({ ...prev, pathOptions: newPathOptions }));
  };

  const addPathOption = (event: React.MouseEvent) => {
    event.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      pathOptions: [...prev.pathOptions, ''],
    }));
  };

  const removePathOption = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const newPathOptions = formData.pathOptions.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, pathOptions: newPathOptions }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit(
      {
        ...formData,
        pathBlock: {
          pathOptions: formData.pathOptions
            .filter((option) => option.trim() !== '')
            .map((option) => ({ pathOption: option })), // Adjusted to correct format
        },
      },
      pathId,
      position
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-4">Add Path Block</h2>
      <div>
        <label htmlFor="description" className="block mb-1 font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Path Options</label>
        {formData.pathOptions.map((option, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="text"
              value={option}
              onChange={(e) => handlePathOptionChange(index, e.target.value)}
              className="flex-grow border rounded px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Option ${index + 1}`}
              required
            />
            <button
              type="button"
              onClick={(event) => removePathOption(index, event)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addPathOption}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
        >
          Add Option
        </button>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onCancel();
          }}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Path
        </button>
      </div>
    </form>
  );
};

export default PathForm;
