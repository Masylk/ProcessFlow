'use client';
import { Workflow } from '@/types/workflow';
import { Folder } from '@/types/workspace';
import { useState } from 'react';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import TextAreaInput from '@/app/components/TextAreaInput';
import { useColors } from '@/app/theme/hooks';
import IconUpload from '@/app/components/IconUpload';
import IconModifier from './IconModifier';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

interface EditFlowModalProps {
  onClose: () => void;
  onConfirm: (
    id: number,
    name: string,
    description: string,
    folder: Folder | null | undefined,
    icon: string | null
  ) => Promise<{
    workflow: Workflow | null;
    error?: { title: string; description: string };
  }>;
  selectedWorkflow: Workflow;
}

export default function EditFlowModal({
  onClose,
  onConfirm,
  selectedWorkflow,
}: EditFlowModalProps) {
  const colors = useColors();
  const [processName, setProcessName] = useState(selectedWorkflow.name);
  const [flowDescription, setFlowDescription] = useState(
    selectedWorkflow.description
  );
  const [isSaving, setIsSaving] = useState(false);
  const [flowIcon, setFlowIcon] = useState(selectedWorkflow.icon || null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const sanitizedProcessName = DOMPurify.sanitize(processName);
      const sanitizedFlowDescription = DOMPurify.sanitize(flowDescription);
      const result = await onConfirm(
        selectedWorkflow.id,
        sanitizedProcessName,
        sanitizedFlowDescription,
        undefined,
        flowIcon
      );

      if (result.error) {
        toast.error(result.error.title, {
          description: result.error.description,
        });
        return;
      }

      if (result.workflow) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Error Saving Flow', {
        description: 'An unexpected error occurred while saving the flow.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 w-full"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0">
        <div
          style={{ backgroundColor: colors['bg-overlay'] }}
          className="absolute inset-0 opacity-70"
        />
      </div>

      {/* Modal content */}
      <div
        style={{ backgroundColor: colors['bg-primary'] }}
        className="w-[550px] rounded-xl shadow-lg flex-col justify-start items-center flex relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full overflow-visible">
          <div className="self-stretch px-6 pt-6 flex-col justify-start items-start gap-4 flex">
            <div
              style={{
                backgroundColor: colors['bg-secondary'],
                borderColor: colors['border-secondary'],
              }}
              className="w-12 h-12 p-3 rounded-[10px] border shadow-sm flex items-center justify-center"
            >
              <div className="w-6 h-6 relative flex-col justify-start items-start flex overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/layers-three-01.svg`}
                  alt="Flow icon"
                  className="w-6 h-6"
                />
              </div>
            </div>
            <div className="flex-col justify-start items-start gap-1 flex">
              <div
                style={{ color: colors['text-primary'] }}
                className="text-lg font-semibold leading-7"
              >
                Edit a Flow
              </div>
              <div
                style={{ color: colors['text-secondary'] }}
                className="text-sm font-normal leading-tight"
              >
                Edit your Flow's name
              </div>
            </div>
          </div>

          <div
            className="self-stretch px-6 pt-6 flex-col justify-start items-start gap-5 flex"
            style={{ zIndex: 0 }}
          >
            <div className="self-stretch flex-col justify-start items-start gap-3 flex">
              <div className="justify-start items-start gap-0.5 inline-flex">
                <div
                  style={{ color: colors['text-primary'] }}
                  className="text-sm font-semibold leading-tight"
                >
                  Process name{' '}
                  <span style={{ color: colors['text-accent'] }}>*</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full">
                <div style={{ zIndex: 30 }}>
                  <IconModifier
                    initialIcon={flowIcon || undefined}
                    onUpdate={(icon) => setFlowIcon(icon || null)}
                    allowEmoji={false}
                  />
                </div>
                <div style={{ zIndex: 0 }} className="flex-1">
                  <InputField
                    type="default"
                    value={processName}
                    onChange={setProcessName}
                    placeholder="Onboarding Process"
                    required
                  />
                </div>
              </div>
            </div>
            <div
              className="self-stretch flex-col justify-start items-start gap-1.5 flex"
              style={{ zIndex: 0 }}
            >
              <div
                style={{ color: colors['text-primary'] }}
                className="text-sm font-semibold leading-tight"
              >
                Flow description
              </div>
              <TextAreaInput
                value={flowDescription}
                onChange={setFlowDescription}
                placeholder="This Flow defines how to onboard a new employee"
              />
            </div>
          </div>

          <div
            style={{ borderColor: colors['border-secondary'] }}
            className="self-stretch py-6 mt-6 border-t flex-col justify-start items-start flex"
          >
            <div className="self-stretch px-6 justify-start items-start gap-3 inline-flex">
              <ButtonNormal
                variant="secondary"
                size="small"
                onClick={onClose}
                className="flex-1"
              >
                Discard changes
              </ButtonNormal>
              <ButtonNormal
                variant="primary"
                size="small"
                isLoading={isSaving}
                loadingText="Saving changes..."
                onClick={handleSave}
                className="flex-1"
                disabled={!processName.trim() || isSaving}
              >
                Save changes
              </ButtonNormal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
