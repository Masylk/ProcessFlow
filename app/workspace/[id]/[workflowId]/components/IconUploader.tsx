import React, { useState } from 'react';

interface IconUploaderProps {
  onIconUpload: (icon: File) => void;
  initialIconUrl?: string;
}

export default function IconUploader({
  onIconUpload,
  initialIconUrl = '',
}: IconUploaderProps) {
  const [preview, setPreview] = useState(initialIconUrl);

  const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onIconUpload(file);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Upload Icon
      </label>
      {preview && (
        <img
          src={preview}
          alt="Icon Preview"
          className="my-2 w-16 h-16 object-contain"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleIconChange}
        className="mt-2 border rounded p-1 w-full"
      />
    </div>
  );
}
