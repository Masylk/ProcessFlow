'use client';
import { useState } from 'react';
import ButtonNormal from '../../components/ButtonNormal';
import InputField from '../../components/InputFields';
import TextAreaInput from '../../components/TextAreaInput';
import DatePicker from '../../components/DatePicker';
import { useColors } from '@/app/theme/hooks';
import IconUpload from '../../components/IconUpload';
import IconModifier from './IconModifier';
import DOMPurify from 'dompurify';

interface CreateFlowModalProps {
  onClose: () => void;
  onCreateFlow: (
    name: string,
    description: string,
    process_owner: string,
    review_date: string,
    additional_notes: string,
    icon: string | null,
    signedIcon: string | null
  ) => Promise<void>;
}

export default function CreateFlowModal({
  onClose,
  onCreateFlow,
}: CreateFlowModalProps) {
  const colors = useColors();
  const [flowName, setFlowName] = useState('');
  const [processOwner, setProcessOwner] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [description, setdescription] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [flowIcon, setFlowIcon] = useState<string | null>(null);
  const [previewIcon, setPreviewIcon] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-8 animate-in fade-in-0 duration-200 z-[100]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 animate-in fade-in-0 duration-300">
        <div
          style={{ backgroundColor: colors['bg-overlay'] }}
          className="absolute inset-0 opacity-70"
        />
      </div>

      <div
        onClick={handleModalClick}
        style={{ backgroundColor: colors['bg-primary'] }}
        className="w-[550px] rounded-xl shadow-[0px_8px_8px_-4px_rgba(16,24,40,0.03)] flex-col justify-start items-start flex relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out"
      >
        <div className="w-full overflow-visible">
          <div className="flex items-start gap-4 px-6 pt-6">
            <div
              style={{
                backgroundColor: colors['bg-secondary'],
                borderColor: colors['border-secondary'],
              }}
              className="w-12 h-12 p-3 rounded-[10px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border justify-center items-center inline-flex overflow-hidden"
            >
              <div className="w-6 h-6 relative flex-col justify-start items-start flex overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/layers-three-01.svg`}
                  alt="3 layers icon"
                  className="w-6 h-6"
                />
              </div>
            </div>
            <div className="flex-col justify-start items-start gap-1 flex">
              <div
                style={{ color: colors['text-primary'] }}
                className="text-lg font-semibold font-['Inter'] leading-7"
              >
                Create a new Flow
              </div>
              <div
                style={{ color: colors['text-secondary'] }}
                className="text-sm font-normal font-['Inter'] leading-tight"
              >
                Give your Flow some context.
              </div>
            </div>
          </div>
          <div
            style={{ borderColor: colors['border-secondary'] }}
            className="self-stretch px-6 pt-4 pb-4 border-b flex-col justify-start items-start gap-5 flex"
          >
            {/* Flow name with icon */}
            <div className="w-full">
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: colors['input-label'] }}
              >
                Flow name{' '}
                <span style={{ color: colors['text-accent'] }}>*</span>
              </label>
              <div className="flex items-center gap-2 w-full">
                <div style={{ zIndex: 30 }}>
                  <IconModifier
                    initialIcon={previewIcon || undefined}
                    onUpdate={(icon, emote, signedIcon, file) => {
                      setFlowIcon(icon || null);
                      setPreviewIcon(signedIcon ? signedIcon : icon || null);
                      setPreviewFile(file || null);
                    }}
                    allowEmoji={false}
                    flow={true}
                  />
                </div>
                <div style={{ zIndex: 0 }} className="flex-1">
                  <InputField
                    type="default"
                    value={flowName}
                    onChange={(value) => setFlowName(value)}
                    placeholder="e.g Create a new task"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Process Owner and Review Date row */}
            <div className="w-full flex gap-4">
              <div className="flex-1">
                <InputField
                  label="Flow owner"
                  type="default"
                  value={processOwner}
                  onChange={setProcessOwner}
                  placeholder="Enter owner name"
                />
              </div>
              <div className="flex-1">
                <DatePicker
                  label="Review Date"
                  value={reviewDate}
                  onChange={setReviewDate}
                  placeholder="Pick a date"
                />
              </div>
            </div>

            {/* Why does this process exist? */}
            <div className="w-full">
              <TextAreaInput
                label="Why does this Flow exist?"
                value={description}
                onChange={(value) => setdescription(value)}
                placeholder="Enter a description..."
              />
            </div>

            {/* How do we complete this process? */}
            <div className="w-full">
              <TextAreaInput
                label="Additional notes"
                value={additionalNotes}
                onChange={(value) => setAdditionalNotes(value)}
                placeholder="Enter a description..."
              />
            </div>
          </div>

          <div className="opacity-50 h-[296px] relative w-full px-6 pt-4 hidden">
            <div
              style={{ color: colors['text-primary'] }}
              className="text-sm font-semibold font-['Inter'] leading-tight mb-4"
            >
              Templates (coming soon...)
            </div>
            <div
              style={{
                backgroundColor: colors['bg-secondary'],
                borderColor: colors['border-secondary'],
              }}
              className="w-full h-[72px] p-4 rounded-xl border justify-start items-start gap-1 inline-flex"
            >
              <div className="grow shrink basis-0 h-10 justify-start items-start gap-3 flex">
                <div className="w-8 h-8 p-2 bg-[#DCFAE6] rounded-full justify-center items-center flex overflow-hidden">
                  <div className="w-4 h-4 relative flex-col justify-start items-start flex overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/layers-two-green.svg`}
                      alt="2 layers green icon"
                      className="w-4 h-4"
                    />
                  </div>
                </div>
                <div className="grow shrink basis-0 flex-col justify-start items-start inline-flex">
                  <div className="justify-start items-start gap-1 inline-flex">
                    <div
                      style={{ color: colors['text-primary'] }}
                      className="text-sm font-medium font-['Inter'] leading-tight"
                    >
                      Onboarding
                    </div>
                  </div>
                  <div
                    style={{ color: colors['text-secondary'] }}
                    className="self-stretch text-sm font-normal font-['Inter'] leading-tight"
                  >
                    Placeholder explaining the flow
                  </div>
                </div>
              </div>
              <div
                style={{ borderColor: colors['border-secondary'] }}
                className="w-4 h-4 relative rounded-full border"
              />
            </div>
          </div>

          <div
            style={{ borderColor: colors['border-secondary'] }}
            className="self-stretch py-6 border-t flex-col justify-start items-start flex"
          >
            <div className="self-stretch px-6 justify-start items-start gap-3 inline-flex">
              <ButtonNormal
                onClick={onClose}
                variant="secondary"
                size="small"
                className="grow shrink basis-0 transition-all duration-200 hover:scale-[1.02]"
              >
                Cancel
              </ButtonNormal>
              <ButtonNormal
                onClick={async () => {
                  if (!flowName.trim()) return;
                  setIsSaving(true);
                  const sanitizedFlowName = flowName;
                  const sanitizedProcessOwner = processOwner;
                  const sanitizeddescription = description;
                  const sanitizedadditionalNotes = additionalNotes;
                  let uploadedIconUrl = flowIcon;
                  let uploadedSignedIcon = previewIcon;
                  if (previewFile) {
                    try {
                      const formData = new FormData();
                      formData.append('file', previewFile);
                      const response = await fetch('/api/upload-icon', {
                        method: 'POST',
                        body: formData,
                      });
                      const data = await response.json();
                      if (!response.ok || !data.success)
                        throw new Error(data.error || 'Upload failed');
                      uploadedIconUrl = data.data.iconUrl;
                      // Optionally fetch signed URL if needed
                      uploadedSignedIcon =
                        data.data.publicUrl || uploadedIconUrl;
                      console.log('uploadedSignedIcon', uploadedSignedIcon);
                    } catch (error) {
                      console.error('Error uploading icon:', error);
                      setIsSaving(false);
                      return;
                    }
                  }
                  onCreateFlow(
                    sanitizedFlowName,
                    sanitizeddescription,
                    sanitizedProcessOwner,
                    reviewDate,
                    sanitizedadditionalNotes,
                    uploadedIconUrl,
                    uploadedSignedIcon
                  )
                    .then(() => {
                      setIsSaving(false);
                      onClose();
                    })
                    .catch((error) => {
                      console.error('Error creating flow:', error);
                      setIsSaving(false);
                    });
                }}
                variant="primary"
                size="small"
                className="grow shrink basis-0 transition-all duration-200 hover:scale-[1.02]"
                isLoading={isSaving}
                loadingText="Creating..."
                disabled={!flowName.trim() || isSaving}
              >
                Create Flow
              </ButtonNormal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
