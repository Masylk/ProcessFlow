// components/AddBlock.tsx
interface AddBlockProps {
  id: number;
  onAdd: (position: number) => void;
  label: string;
}

export default function AddBlock({ id, onAdd, label }: AddBlockProps) {
  return (
    <div className="flex justify-center w-full p-4">
      <button
        onClick={() => onAdd(id)}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
      >
        {label}
      </button>
    </div>
  );
}
