import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

interface TextEditorProps {
  value: string;
  onChange: (content: string) => void;
  maxCharacters?: number; // Optional prop for character limit
}

const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  maxCharacters = 5000,
}) => {
  const [editorValue, setEditorValue] = useState<string>(value);

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleEditorChange = (content: string) => {
    // If maxCharacters is set, limit content length
    if (maxCharacters && content.length > maxCharacters) return;

    setEditorValue(content);
    onChange(content);
  };

  return (
    <div className="overflow-hidden flex flex-col h-[180px] rounded-sm">
      <ReactQuill
        value={editorValue}
        onChange={handleEditorChange}
        theme="snow"
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'], // Added 'strike' and removed 'image'
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
          ],
        }}
        formats={[
          'bold',
          'italic',
          'underline',
          'strike', // Added 'strike'
          'list',
          'bullet',
          'link',
        ]}
        placeholder="Write an email presenting yourself to the team following this structure: - - -"
        className="h-full text-sm font-['Inter'] rounded-lg"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Add styling to the editor content to make it scrollable */}
        <div
          className="ql-container ql-snow"
          style={{
            flex: '1',
            overflowY: 'auto',
          }}
        />
      </ReactQuill>
    </div>
  );
};

export default TextEditor;
