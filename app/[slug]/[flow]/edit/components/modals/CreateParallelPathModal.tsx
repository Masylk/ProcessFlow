import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Modal from '@/app/components/Modal';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import InputDropdown from '@/app/components/InputDropdown';
import { useColors, useTheme } from '@/app/theme/hooks';
import { themeRegistry } from '@/app/theme/registry';
import { Path } from '../../../types';

interface CreateParallelPathModalProps {
  onClose: () => void;
  onConfirm: (data: {
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

  // Check if any path name is empty
  const hasEmptyPath = pathNames.some((name) => name.trim() === '');

  const handleAddPath = () => {
    setPathNames([...pathNames, `Path n°${pathNames.length + 1}`]);
  };

  const handleRemovePath = (index: number) => {
    const newPathNames = [...pathNames];
    newPathNames.splice(index, 1);
    setPathNames(newPathNames);
  };

  const modalContent = (
    <div style={themeVars as React.CSSProperties} className={currentTheme}>
      <Modal
        title="Add Conditions"
        onClose={onClose}
        icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dataflow-icon.svg`}
        iconBackgroundColor={colors['bg-secondary']}
        iconBorderColor={colors['border-light']}
        showHeaderSeparator={true}
        showActionsSeparator={true}
        width="w-[600px]"
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
                  paths_to_create: pathNames,
                  path_to_move: selectedPath,
                })
              }
              disabled={hasEmptyPath || pathNames.length === 0}
            >
              Create paths
            </ButtonNormal>
          </div>
        }
      >
        <div
          className="flex flex-col gap-6 pb-4"
          style={{ color: colors['text-primary'] }}
        >
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
              leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon-white.svg`}
            >
              Add new path
            </ButtonNormal>
          </div>

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
