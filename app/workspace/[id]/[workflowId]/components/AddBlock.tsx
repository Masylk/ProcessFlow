interface AddBlockProps {
  id: number;
  onAdd: (position: number) => void;
}

export default function AddBlock({ id, onAdd }: AddBlockProps) {
  return (
    <div className="flex justify-center w-full">
      <button
        onClick={() => onAdd(id)}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
      >
        Add Block
      </button>
    </div>
  );
}
