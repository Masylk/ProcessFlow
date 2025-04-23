import React, { useMemo } from 'react';

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

// Regular expression to match URLs
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

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
  // Parse text into segments with links
  const segments = useMemo(() => {
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = URL_REGEX.exec(value)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: value.slice(lastIndex, match.index)
        });
      }
      
      // Add the link
      parts.push({
        type: 'link',
        content: match[0]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last link
    if (lastIndex < value.length) {
      parts.push({
        type: 'text',
        content: value.slice(lastIndex)
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content: value }];
  }, [value]);

  return (
    <div className={className}>
      {readOnly ? (
        <div 
          className="w-full h-full min-h-[80px] overflow-auto whitespace-pre-line"
          style={{ color: textColor }}
        >
          {segments.map((segment, index) => (
            segment.type === 'link' ? (
              <a
                key={index}
                href={segment.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  window.open(segment.content, '_blank', 'noopener,noreferrer');
                }}
              >
                {segment.content}
              </a>
            ) : (
              <span key={index}>{segment.content}</span>
            )
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
}
