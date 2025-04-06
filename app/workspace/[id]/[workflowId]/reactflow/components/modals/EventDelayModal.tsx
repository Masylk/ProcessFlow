import React, { useState } from 'react';
import { useColors } from '@/app/theme/hooks';
import Modal from '@/app/components/Modal';

interface EventDelayModalProps {
  onClose: () => void;
  onSubmit: (eventName: string, expirationTime?: number) => void;
  initialEventName?: string;
  initialSeconds?: number;
}

const EventDelayModal: React.FC<EventDelayModalProps> = ({
  onClose,
  onSubmit,
  initialEventName = '',
  initialSeconds = 0,
}) => {
  const colors = useColors();
  const [eventName, setEventName] = useState(initialEventName);
  const [hasExpiration, setHasExpiration] = useState(initialSeconds > 0);

  // Convert initial seconds to days, hours, minutes
  const [days, setDays] = useState(Math.floor(initialSeconds / 86400));
  const [hours, setHours] = useState(
    Math.floor((initialSeconds % 86400) / 3600)
  );
  const [minutes, setMinutes] = useState(
    Math.floor((initialSeconds % 3600) / 60)
  );

  const increment = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
    max: number | null = null
  ): void => {
    setter((prev) => (max !== null && prev >= max ? prev : prev + value));
  };

  const decrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
    min: number = 0
  ): void => {
    setter((prev) => (prev <= min ? prev : prev - value));
  };

  const delayText = () => {
    if (days === 0 && hours === 0 && minutes === 0) return null;

    const parts = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    if (minutes > 0)
      parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);

    return `Delay of ${parts.join(' and ')}.`;
  };

  const handleSubmit = () => {
    if (eventName.trim()) {
      const expirationSeconds = hasExpiration
        ? days * 86400 + hours * 3600 + minutes * 60
        : 0;
      onSubmit(eventName.trim(), expirationSeconds);
    }
  };

  return (
    <Modal
      title="Set an event based delay"
      subtitle="Pause the Flow until a specific event occurs. Optionally, set a time limit to continue if the event doesn't happen."
      onClose={onClose}
      width="w-[512px]"
      icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/bell-02.svg`}
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
            onClick={handleSubmit}
            disabled={!eventName.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg text-white text-base font-semibold disabled:opacity-50"
            style={{ backgroundColor: colors['fg-brand-primary'] }}
          >
            Confirm
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
            Event to wait for*
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="User completes onboarding"
            className="w-full px-3 py-2 rounded-lg border"
            style={{
              borderColor: colors['border-primary'],
              backgroundColor: colors['bg-secondary'],
              color: colors['text-primary'],
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div
              className="text-sm font-medium"
              style={{ color: colors['text-primary'] }}
            >
              Set expiration time
            </div>
            <div
              className="text-sm"
              style={{ color: colors['text-secondary'] }}
            >
              Continue if the event doesn't occur within a specific time
            </div>
          </div>
          <button
            onClick={() => setHasExpiration(!hasExpiration)}
            className={`w-12 h-6 rounded-full transition-colors ${
              hasExpiration ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                hasExpiration ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {hasExpiration && (
          <div className="flex gap-4">
            {/* Days counter */}
            <div className="flex-1">
              <label
                className="block mb-1.5 text-sm font-medium"
                style={{ color: colors['text-primary'] }}
              >
                Days
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={days}
                  onChange={(e) =>
                    setDays(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full px-3 py-2 rounded-lg border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{
                    borderColor: colors['border-primary'],
                    backgroundColor: colors['bg-secondary'],
                    color: colors['text-primary'],
                  }}
                />
                <div
                  className="absolute right-0 top-0 bottom-0 flex flex-col border-l"
                  style={{ borderColor: colors['border-primary'] }}
                >
                  <button
                    onClick={() => increment(setDays, 1)}
                    className="h-1/2 px-1.5 flex items-center justify-center hover:bg-gray-100"
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/chevron-up.svg`}
                      alt="Increase"
                      className="w-2.5 h-2.5"
                    />
                  </button>
                  <button
                    onClick={() => decrement(setDays, 1)}
                    className="h-1/2 px-1.5 flex items-center justify-center hover:bg-gray-100 border-t"
                    style={{ borderColor: colors['border-primary'] }}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/chevron-down.svg`}
                      alt="Decrease"
                      className="w-2.5 h-2.5"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Hours counter */}
            <div className="flex-1">
              <label
                className="block mb-1.5 text-sm font-medium"
                style={{ color: colors['text-primary'] }}
              >
                Hours
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={hours}
                  onChange={(e) =>
                    setHours(
                      Math.min(23, Math.max(0, parseInt(e.target.value) || 0))
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{
                    borderColor: colors['border-primary'],
                    backgroundColor: colors['bg-secondary'],
                    color: colors['text-primary'],
                  }}
                />
                <div
                  className="absolute right-0 top-0 bottom-0 flex flex-col border-l"
                  style={{ borderColor: colors['border-primary'] }}
                >
                  <button
                    onClick={() => increment(setHours, 1, 23)}
                    className="h-1/2 px-1.5 flex items-center justify-center hover:bg-gray-100"
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/chevron-up.svg`}
                      alt="Increase"
                      className="w-2.5 h-2.5"
                    />
                  </button>
                  <button
                    onClick={() => decrement(setHours, 1)}
                    className="h-1/2 px-1.5 flex items-center justify-center hover:bg-gray-100 border-t"
                    style={{ borderColor: colors['border-primary'] }}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/chevron-down.svg`}
                      alt="Decrease"
                      className="w-2.5 h-2.5"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Minutes counter */}
            <div className="flex-1">
              <label
                className="block mb-1.5 text-sm font-medium"
                style={{ color: colors['text-primary'] }}
              >
                Minutes
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(
                      Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{
                    borderColor: colors['border-primary'],
                    backgroundColor: colors['bg-secondary'],
                    color: colors['text-primary'],
                  }}
                />
                <div
                  className="absolute right-0 top-0 bottom-0 flex flex-col border-l"
                  style={{ borderColor: colors['border-primary'] }}
                >
                  <button
                    onClick={() => increment(setMinutes, 1, 59)}
                    className="h-1/2 px-1.5 flex items-center justify-center hover:bg-gray-100"
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/chevron-up.svg`}
                      alt="Increase"
                      className="w-2.5 h-2.5"
                    />
                  </button>
                  <button
                    onClick={() => decrement(setMinutes, 1)}
                    className="h-1/2 px-1.5 flex items-center justify-center hover:bg-gray-100 border-t"
                    style={{ borderColor: colors['border-primary'] }}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/chevron-down.svg`}
                      alt="Decrease"
                      className="w-2.5 h-2.5"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {delayText() && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl border"
            style={{ borderColor: colors['border-primary'] }}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/alert-circle.svg`}
              alt="Info"
              className="w-5 h-5"
            />
            <span
              className="text-sm font-semibold"
              style={{ color: colors['text-primary'] }}
            >
              {delayText()}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EventDelayModal;
