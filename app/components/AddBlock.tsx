interface AddBlockProps {
  onAdd: () => void;
}

export default function AddBlock({ onAdd }: AddBlockProps) {
  return (
    <button
      onClick={onAdd}
      className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors mx-auto"
    >
      Add Block
    </button>
  );
}
