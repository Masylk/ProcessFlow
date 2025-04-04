import React, { useState, useEffect } from 'react';
import { useColors } from '@/app/theme/hooks';
import { DelayType } from '../../../types';
import FixedDelayModal from './FixedDelayModal';
import EventDelayModal from './EventDelayModal';
import Modal from '@/app/components/Modal';

interface DelayTypeModalProps {
  onClose: () => void;
  onSelect: (
    delayType: DelayType,
    data: { seconds?: number; eventName?: string }
  ) => void;
}

const DelayTypeModal: React.FC<DelayTypeModalProps> = ({
  onClose,
  onSelect,
}) => {
  const colors = useColors();
  const [selectedType, setSelectedType] = useState<DelayType | null>(null);
  const [showNextModal, setShowNextModal] = useState(false);

  useEffect(() => {
    console.log('Selected delay type:', selectedType);
  }, [selectedType]);

  const handleFixedDelaySubmit = (seconds: number) => {
    onSelect(DelayType.FIXED_DURATION, { seconds });
  };

  const handleEventDelaySubmit = (
    eventName: string,
    expirationTime?: number
  ) => {
    onSelect(DelayType.WAIT_FOR_EVENT, { seconds: expirationTime, eventName });
  };

  if (showNextModal) {
    if (selectedType === DelayType.FIXED_DURATION) {
      return (
        <FixedDelayModal
          onClose={() => setShowNextModal(false)}
          onSubmit={handleFixedDelaySubmit}
        />
      );
    }
    if (selectedType === DelayType.WAIT_FOR_EVENT) {
      return (
        <EventDelayModal
          onClose={() => setShowNextModal(false)}
          onSubmit={handleEventDelaySubmit}
        />
      );
    }
  }

  return (
    <Modal
      title="Set delay"
      subtitle="Pause the Flow"
      onClose={onClose}
      width="w-[400px]"
      icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock-stopwatch-1.svg`}
      actions={
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border text-base font-semibold"
            style={{
              borderColor: colors['border-primary'],
              color: colors['text-primary'],
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => setShowNextModal(true)}
            disabled={!selectedType}
            className="flex-1 px-4 py-2.5 rounded-lg text-white text-base font-semibold disabled:opacity-50"
            style={{ backgroundColor: colors['fg-brand-primary'] }}
          >
            Continue
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label
            className="block mb-1.5 text-sm font-medium"
            style={{ color: colors['text-primary'] }}
          >
            Type of delay*
          </label>
          <select
            value={selectedType ?? ''}
            onChange={(e) => setSelectedType(e.target.value as DelayType)}
            className="w-full px-3 py-2 rounded-lg border"
            style={{
              borderColor: colors['border-primary'],
              backgroundColor: colors['bg-secondary'],
              color: colors['text-primary'],
            }}
          >
            <option value="" disabled>
              Select a delay type
            </option>
            <option value={DelayType.FIXED_DURATION}>Fixed Duration</option>
            <option value={DelayType.WAIT_FOR_EVENT}>Wait for Event</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};

export default DelayTypeModal;
