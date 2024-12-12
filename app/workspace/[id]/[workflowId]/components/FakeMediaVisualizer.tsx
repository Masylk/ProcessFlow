interface FakeMediaVisualizerProps {
  imageFile: File;
  altText: string;
  handleDelete: () => void;
}

export default function FakeMediaVisualizer({
  imageFile,
  altText,
  handleDelete,
}: FakeMediaVisualizerProps) {
  const objectUrl = URL.createObjectURL(imageFile);

  return (
    <div className="relative w-full h-[267px]">
      {/* Image */}
      <img
        className="w-full h-full object-cover rounded-xl border border-[#e4e7ec]"
        src={objectUrl}
        alt={altText}
        onLoad={() => URL.revokeObjectURL(objectUrl)} // Clean up object URL when no longer needed
      />
      {/* Trash Icon */}
      <div
        className="absolute top-2 right-2 h-9 p-2 bg-white rounded-lg shadow border border-[#d0d5dd] flex justify-center items-center cursor-pointer"
        onClick={handleDelete} // Attach the delete handler here
      >
        <img
          src="/assets/shared_components/trash-icon.svg"
          alt="Trash Icon"
          className="w-5 h-5"
        />
      </div>
    </div>
  );
}
