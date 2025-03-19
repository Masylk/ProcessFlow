import { createPortal } from 'react-dom';

interface DeletePathModalProps {
  onClose: () => void;
  onConfirm: () => void;
  pathName: string;
}

export default function DeletePathModal({ onClose, onConfirm, pathName }: DeletePathModalProps) {
  return createPortal(
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Delete Path</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete {pathName}? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </>,
    document.body
  );
} 