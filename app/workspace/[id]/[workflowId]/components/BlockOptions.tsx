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
  // Prevent the event from bubbling up
  const handleOptionClick = (event: React.MouseEvent, action: () => void) => {
    event.stopPropagation();
    action(); // Trigger the actual action
  };

  return (
    <div className="w-32 bg-white border border-black p-2">
      <ul className="space-y-2">
        <li>
          <button
            className="w-full text-left hover:bg-gray-100 p-1"
            onClick={(event) => handleOptionClick(event, onDelete)}
          >
            Delete
          </button>
        </li>
        <li>
          <button
            className="w-full text-left hover:bg-gray-100 p-1"
            onClick={(event) => handleOptionClick(event, onCopy)}
          >
            Copy
          </button>
        </li>
        <li>
          <button
            className="w-full text-left hover:bg-gray-100 p-1"
            onClick={(event) => handleOptionClick(event, onCopyLink)}
          >
            Copy Link
          </button>
        </li>
        <li>
          <button
            className="w-full text-left hover:bg-gray-100 p-1"
            onClick={(event) => handleOptionClick(event, onDuplicate)}
          >
            Duplicate
          </button>
        </li>
      </ul>
    </div>
  );
};

export default BlockOptions;
