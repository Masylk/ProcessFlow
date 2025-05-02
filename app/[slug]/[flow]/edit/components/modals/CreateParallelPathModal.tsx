import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Modal from '@/app/components/Modal';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import InputDropdown from '@/app/components/InputDropdown';
import { useColors, useTheme } from '@/app/theme/hooks';
import { themeRegistry } from '@/app/theme/registry';
import { Path } from '../../../types';
import IconModifier from '../IconModifier';
import DOMPurify from 'dompurify';

/**
 * Modal for creating a new parallel path condition.
 * Allows user to specify a condition name, description, and multiple paths.
 * @param onClose - Closes the modal
 * @param onConfirm - Confirms creation with all data
 * @param path - The current path object
 * @param position - The position in the flow
 * @param existingPaths - Optional, pre-existing path names
 */
interface CreateParallelPathModalProps {
  /** Closes the modal */
  onClose: () => void;
  /** Confirms creation with all data */
  onConfirm: (data: {
    conditionName: string;
    conditionDescription?: string;
    icon?: string;
    paths_to_create: string[];
    path_to_move: number;
  }) => void;
  path: Path;
  position: number;
  existingPaths?: string[];
}

const CreateParallelPathModal: React.FC<CreateParallelPathModalProps> = ({
  onClose,
  onConfirm,
  path,
  position,
  existingPaths = [],
}) => {
  const [conditionName, setConditionName] = useState<string>("");
  const [conditionDescription, setConditionDescription] = useState<string>("");
  const [icon, setIcon] = useState<string | undefined>(`step-icons/default-icons/dataflow.svg`);
  const [pathNames, setPathNames] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<number>(0);
  const colors = useColors();
  const { currentTheme } = useTheme();

  // Get theme variables for direct application
  const themeVars = useMemo(() => {
    const theme = themeRegistry.get(currentTheme);
    return Object.entries(theme.tokens.colors).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        acc[`--${key}`] = value;
        return acc;
      },
      {}
    );
  }, [currentTheme]);

  // Initialize pathNames with existing paths when the modal opens
  useEffect(() => {
    if (existingPaths.length > 0) {
      setPathNames(existingPaths);
    } else {
      setPathNames(['Path n°1', 'Path n°2']);
    }
  }, [existingPaths]);

  // Check if there are blocks after the specified position
  const hasBlocksAfterPosition = (position: number) => {
    return path.blocks.some(
      (block) =>
        block.position > position ||
        (block.type === 'PATH' && block.position === position)
    );
  };

  // Check if any path name is empty or if condition name is empty
  const hasEmptyPath = pathNames.some((name) => name.trim() === "");
  const isConditionNameEmpty = conditionName.trim() === "";

  const handleAddPath = () => {
    setPathNames([...pathNames, `Path n°${pathNames.length + 1}`]);
  };

  const handleRemovePath = (index: number) => {
    const newPathNames = [...pathNames];
    newPathNames.splice(index, 1);
    setPathNames(newPathNames);
  };

  const minimalBlock = useMemo(() => ({
    id: 0,
    created_at: '',
    updated_at: '',
    type: 'STEP' as const,
    position: 0,
    workflow_id: 0,
    path_id: 0,
    workflow: path.workflow,
    path: path,
    child_paths: [],
    icon: icon || undefined,
  }), [icon, path]);

  const modalContent = (
    <div style={themeVars as React.CSSProperties} className={currentTheme}>
      <Modal
        title="Create a new condition"
        onClose={onClose}
        icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dataflow-icon.svg`}
        iconBackgroundColor={colors['bg-secondary']}
        iconBorderColor={colors['border-light']}
        showHeaderSeparator={true}
        showActionsSeparator={true}
        width="w-[600px]"
        className="overflow-hidden"
        actions={
          <div className="flex justify-end gap-2 w-full">
            <ButtonNormal variant="tertiary" size="small" onClick={onClose}>
              Cancel
            </ButtonNormal>
            <ButtonNormal
              variant="primary"
              size="small"
              onClick={() =>
                onConfirm({
                  conditionName: DOMPurify.sanitize(conditionName),
                  conditionDescription: DOMPurify.sanitize(conditionDescription),
                  icon,
                  paths_to_create: pathNames.map((n) => DOMPurify.sanitize(n)),
                  path_to_move: selectedPath,
                })
              }
              disabled={isConditionNameEmpty || hasEmptyPath || pathNames.length === 0}
            >
              Create condition
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
            <label className="text-sm font-semibold flex items-center gap-1 text-left" style={{ color: colors['text-secondary'] }}>
              Condition name <span className="text-primary">*</span>
            </label>
            <div className="flex flex-row items-center w-full gap-2">
              <div className="flex items-center">
                <IconModifier
                  block={minimalBlock}
                  onUpdate={update => setIcon(update.icon ?? undefined)}
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
            <label className="text-sm font-semibold" style={{ color: colors['text-secondary'] }}>
              Condition description
            </label>
            <textarea
              className="border rounded-lg p-3 min-h-[80px] resize-y text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-primary"
              style={{ background: colors['bg-primary'], borderColor: colors['border-primary'] }}
              value={conditionDescription}
              onChange={e => setConditionDescription(e.target.value)}
              placeholder="Describe the condition (optional)"
            />
          </div>
          {/* Paths Section */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 max-h-[240px] overflow-y-auto p-1">
              {pathNames.map((name, index) => (
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
                      value={name}
                      onChange={(value) => {
                        const newNames = [...pathNames];
                        newNames[index] = value;
                        setPathNames(newNames);
                      }}
                      placeholder={`This is your path n°${index + 1}`}
                    />
                  </div>
                  {index > 1 && (
                    <ButtonNormal
                      variant="tertiary"
                      size="medium"
                      onClick={() => handleRemovePath(index)}
                      leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                    />
                  )}
                </div>
              ))}
            </div>
            <ButtonNormal
              variant="secondary"
              size="small"
              onClick={handleAddPath}
              leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/assets/shared_components/plus-icon-white.svg`}
            >
              Add new path
            </ButtonNormal>
          </div>
          {/* Move blocks dropdown if needed */}
          {hasBlocksAfterPosition(position) && (
            <div className="flex flex-col gap-1">
              <label
                className="text-sm"
                style={{ color: colors['text-secondary'] }}
              >
                Move blocks to
              </label>
              <InputDropdown
                value={pathNames[selectedPath]}
                onChange={(value) => {
                  const index = pathNames.findIndex((name) => name === value);
                  if (index !== -1) {
                    setSelectedPath(index);
                  }
                }}
                options={pathNames.map((name) => ({ name, handle: name }))}
                mode={currentTheme === 'dark' ? 'dark' : 'light'}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );

  // Only render if we're in a browser environment
  if (typeof window === 'undefined') return null;

  return createPortal(modalContent, document.body);
};

export default CreateParallelPathModal;
