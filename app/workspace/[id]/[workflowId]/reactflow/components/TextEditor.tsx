import React from 'react';

interface TextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="overflow-hidden flex flex-col h-[180px] rounded-sm">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-3 text-sm font-['Inter'] rounded-lg border border-gray-200 resize-none focus:outline-none focus:border-blue-400"
        placeholder="Add a description..."
      />
    </div>
  );
};

export default TextEditor; 