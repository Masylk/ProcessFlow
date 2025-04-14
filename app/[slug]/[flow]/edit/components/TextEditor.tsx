import React from 'react';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  textColor?: string;
}

export default function TextEditor({
  value,
  onChange,
  onBlur,
  onKeyDown,
  readOnly = false,
  className = '',
  placeholder = '',
  textColor,
}: TextEditorProps) {
  return (
    <div className={className}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        readOnly={readOnly}
        placeholder={placeholder}
        className="w-full h-full min-h-[80px] bg-transparent resize-none focus:outline-none"
        style={{ color: textColor }}
      />
    </div>
  );
}
