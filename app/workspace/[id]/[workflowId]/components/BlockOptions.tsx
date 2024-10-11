interface BlockOptionsProps {
  onDelete: () => void;
  onCopy: () => void;
  onCopyLink: () => void;
  onDuplicate: () => void;
}

const BlockOptions = ({
  onDelete,
  onCopy,
  onCopyLink,
  onDuplicate,
}: BlockOptionsProps) => {
  return (
    <div className="w-32 bg-white border border-black p-2">
      <ul className="space-y-2">
        <li>
          <button
            className="w-full text-left hover:bg-gray-100 p-1"
            onClick={onDelete}
          >
            Delete
          </button>
        </li>
        <li>
          <button
            className="w-full text-left hover:bg-gray-100 p-1"
            onClick={onCopy}
          >
            Copy
          </button>
        </li>
        <li>
          <button
            className="w-full text-left hover:bg-gray-100 p-1"
            onClick={onCopyLink}
          >
            Copy Link
          </button>
        </li>
        <li>
          <button
            className="w-full text-left hover:bg-gray-100 p-1"
            onClick={onDuplicate}
          >
            Duplicate
          </button>
        </li>
      </ul>
    </div>
  );
};

export default BlockOptions;
