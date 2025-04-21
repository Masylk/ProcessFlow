import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Modal from '@/app/components/Modal';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import { useColors, useTheme } from '@/app/theme/hooks';
import { themeRegistry } from '@/app/theme/registry';

interface UpdatePathModalProps {
  onClose: () => void;
  onConfirm: (pathNames: string[]) => void;
  existingPathsCount: number;
  existingPaths?: string[];
}

const UpdatePathModal: React.FC<UpdatePathModalProps> = ({
  onClose,
  onConfirm,
  existingPathsCount = 0,
  existingPaths = [],
}) => {
  const [pathNames, setPathNames] = useState<string[]>([]);
  const colors = useColors();
  const { currentTheme } = useTheme();

  // Initialize pathNames with existing paths when the modal opens
  useEffect(() => {
    if (existingPaths.length > 0) {
      setPathNames([...existingPaths]);
    } else {
      setPathNames(['Path n°1', 'Path n°2']);
    }
  }, [existingPaths]);

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

  // Check if any path name is empty
  const hasEmptyPath = pathNames.some((name) => name.trim() === '');

  const handleAddPath = () => {
    const nextPathNumber = pathNames.length + 1;
    setPathNames([...pathNames, `Path n°${nextPathNumber}`]);
  };

  const handleRemovePath = (index: number) => {
    const newPathNames = [...pathNames];
    newPathNames.splice(index, 1);
    setPathNames(newPathNames);
  };

  const modalContent = (
    <div style={themeVars as React.CSSProperties} className={currentTheme}>
      <Modal
        title="Add Child Paths"
        onClose={onClose}
        icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dataflow-04.svg`}
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
              onClick={() => onConfirm(pathNames)}
              disabled={hasEmptyPath || pathNames.length <= 1}
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 max-h-[240px] overflow-y-auto">
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
                  <ButtonNormal
                    variant="tertiary"
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

  // Don't use ThemeProvider in portal to avoid theme flash
  return createPortal(modalContent, document.body);
};

export default UpdatePathModal;
