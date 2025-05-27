import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Modal from '@/app/components/Modal';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import { useColors, useTheme } from '@/app/theme/hooks';
import { remove } from 'lodash';
import IconModifier from '../IconModifier';
import { Block } from '../../../types';
import DOMPurify from 'dompurify';

interface UpdatePathModalProps {
  onClose: () => void;
  onConfirm: (data: {
    conditionName: string;
    conditionDescription: string;
    icon?: string;
    pathsToUpdate: { index: number; name: string }[];
    pathsToAdd: string[];
    pathsToRemove: { index: number; name: string }[];
  }) => void;
  existingPathsCount: number;
  existingPaths?: string[];
  block: Block;
}

type PathRow = {
  id: number;
  name: string;
  originalName?: string;
  originalIndex?: number;
};

const UpdatePathModal: React.FC<UpdatePathModalProps> = ({
  onClose,
  onConfirm,
  existingPathsCount = 0,
  existingPaths = [],
  block,
}) => {
  const [conditionName, setConditionName] = useState<string>(block.title || '');
  const [conditionDescription, setConditionDescription] = useState<string>(
    block.description || ''
  );
  const [icon, setIcon] = useState<string | undefined>(
    block.icon || 'step-icons/default-icons/dataflow.svg'
  );
  const [pathRows, setPathRows] = useState<PathRow[]>([]);
  const [removedPaths, setRemovedPaths] = useState<PathRow[]>([]);

  const colors = useColors();
  const { currentTheme } = useTheme();

  // Initialize pathRows with existing paths when the modal opens
  useEffect(() => {
    if (existingPaths.length > 0) {
      // If you want to pass IDs, you need to pass them from the parent as well.
      // For now, we assume only names, so we can't track updates/removes by ID.
      // Let's assume the parent will pass an array of {id, name} instead of just names.
      // For now, fallback to names only.
      setPathRows(
        existingPaths.map((name, idx) => ({
          id: idx,
          name,
          originalName: name,
          originalIndex: idx,
        }))
      );
    } else {
      setPathRows([
        { id: 0, name: 'Path n°1' },
        { id: 1, name: 'Path n°2' },
      ]);
    }
    setRemovedPaths([]);
  }, [existingPaths]);

  // Check if any path name is empty
  const hasEmptyPath = pathRows.some((row) => row.name.trim() === '');

  const handleAddPath = () => {
    const nextPathNumber = pathRows.length;
    setPathRows([
      ...pathRows,
      { id: nextPathNumber, name: `Path n°${nextPathNumber + 1}` },
    ]);
    // No need to update removedPaths
  };

  const handleRemovePath = (index: number) => {
    setPathRows((prevRows) => {
      const removed = prevRows[index];
      const newRows = [...prevRows];
      newRows.splice(index, 1);

      if (removed.id !== undefined && removed.originalIndex !== undefined) {
        setRemovedPaths((old) => {
          // Only add if there is no existing pair with same index and name
          if (!old.some((p) => p.id === index && p.name === removed.name)) {
            return [
              ...old,
              { id: removed.originalIndex ?? 0, name: removed.name },
            ];
          }
          return old;
        });
      }

      return newRows;
    });
  };

  const handleNameChange = (index: number, value: string) => {
    setPathRows((prev) => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], name: value };
      return newRows;
    });
  };

  const handleConfirm = () => {
    // pathsToAdd: all rows without id
    const pathsToAdd = pathRows
      .filter((row) => row.originalIndex === undefined)
      .map((row) => row.name);

    // pathsToRemove: all removed paths with id, deduplicated by (index, name)
    const seen = new Set<string>();
    const pathsToRemove = removedPaths
      .map((row) => ({
        index: row?.id ?? 0,
        name: row.name,
      }))
      .filter((row) => {
        const key = `${row.index}|${row.name}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    // pathsToUpdate: all rows with id and name changed
    const pathsToUpdate = pathRows
      .filter(
        (row) =>
          row.id !== undefined &&
          row.name !== row.originalName &&
          row.originalIndex !== undefined
      )
      .map((row) => ({
        index: row.id as number,
        name: row.name,
      }));

    onConfirm({
      conditionName: conditionName,
      conditionDescription: conditionDescription,
      icon,
      pathsToUpdate,
      pathsToAdd,
      pathsToRemove,
    });
  };

  // Minimal block for icon selector
  const minimalBlock: Block = useMemo(
    () => ({
      ...block,
      icon: icon || undefined,
    }),
    [icon, block]
  );

  const modalContent = (
    <div className={currentTheme}>
      <Modal
        title="Add Child Paths"
        onClose={onClose}
        icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dataflow-icon.svg`}
        iconBackgroundColor={colors['bg-secondary']}
        iconBorderColor={colors['border-secondary']}
        showHeaderSeparator={true}
        showActionsSeparator={true}
        width="w-[600px]"
        className="overflow-hidden"
        actions={
          <div className="flex justify-end gap-2 w-full">
            <ButtonNormal variant="secondary" size="small" onClick={onClose}>
              Cancel
            </ButtonNormal>
            <ButtonNormal
              variant="primary"
              size="small"
              onClick={handleConfirm}
              disabled={hasEmptyPath || pathRows.length <= 1}
            >
              {existingPaths.length > 0 ? 'Update paths' : 'Create paths'}
            </ButtonNormal>
          </div>
        }
      >
        <div
          className="flex flex-col gap-6 pb-4"
          style={{ color: colors['text-primary'] }}
        >
          {/* Condition Name + Icon Selector */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold flex items-center gap-1 text-left"
              style={{ color: colors['text-secondary'] }}
            >
              Condition name <span className="text-primary">*</span>
            </label>
            <div className="flex flex-row items-center w-full gap-2">
              <div className="flex items-center">
                <IconModifier
                  block={minimalBlock}
                  onUpdate={(update) => {
                    setIcon(update.icon ?? 'step-icons/default-icons/dataflow.svg');
                  }}
                />
              </div>
              <div className="flex-1">
                <InputField
                  type="default"
                  value={conditionName}
                  onChange={setConditionName}
                  placeholder="Enter condition name"
                />
              </div>
            </div>
          </div>
          {/* Condition Description */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold"
              style={{ color: colors['text-secondary'] }}
            >
              Condition description
            </label>
            <textarea
              className="border rounded-lg p-3 min-h-[80px] resize-y text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-primary"
              style={{
                background: colors['bg-primary'],
                borderColor: colors['border-primary'],
              }}
              value={conditionDescription}
              onChange={(e) => setConditionDescription(e.target.value)}
              placeholder="Describe the condition (optional)"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 max-h-[240px] overflow-y-auto p-1">
              {pathRows.map((row, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex flex-col gap-1 flex-grow">
                    <label
                      className="text-sm"
                      style={{ color: colors['text-secondary'] }}
                    >
                      Path n°{index + 1}
                    </label>
                    <InputField
                      type="default"
                      value={row.name}
                      onChange={(value) => handleNameChange(index, value)}
                      placeholder={`This is your path n°${index + 1}`}
                    />
                  </div>
                  <ButtonNormal
                    variant="secondary"
                    size="medium"
                    onClick={() => handleRemovePath(index)}
                    leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                  />
                </div>
              ))}
            </div>
            <ButtonNormal
              variant="secondary"
              size="small"
              onClick={handleAddPath}
              leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon-white.svg`}
            >
              Add new path
            </ButtonNormal>
          </div>
        </div>
      </Modal>
    </div>
  );

  // Only render if we're in a browser environment
  if (typeof window === 'undefined') return null;

  return createPortal(modalContent, document.body);
};

export default UpdatePathModal;
