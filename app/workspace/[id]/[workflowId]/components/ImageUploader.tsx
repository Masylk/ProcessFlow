import React, { useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (image: File) => void;
  initialImageUrl?: string;
}

export default function ImageUploader({
  onImageUpload,
  initialImageUrl = '',
}: ImageUploaderProps) {
  const [preview, setPreview] = useState(initialImageUrl);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImageUpload(file);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Upload Image
      </label>
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="my-2 w-full h-32 object-cover"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mt-2 border rounded p-1 w-full"
      />
    </div>
  );
}
