import React from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';
import { NodeData } from '../../../types';
import { useColors } from '@/app/theme/hooks';

const EventDelayNode = ({
  id,
  data,
  selected,
}: NodeProps & { data: NodeData }) => {
  const colors = useColors();
  const { block } = data;

  const expirationText = () => {
    if (!block.delay_seconds) return '';
    const days = Math.floor(block.delay_seconds / 86400);
    const hours = Math.floor((block.delay_seconds % 86400) / 3600);
    const minutes = Math.floor((block.delay_seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    if (minutes > 0)
      parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);

    return parts.length > 0 ? ` (expires in ${parts.join(' and ')})` : '';
  };

  return (
    <div className="w-[531px]">
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          width: 8,
          height: 8,
          opacity: 0,
          background: colors['fg-brand-primary'],
          border: `2px solid ${colors['bg-primary']}`,
          pointerEvents: 'none',
        }}
      />
      <div
        className="px-6 py-4 rounded-lg border h-[223px] flex flex-col gap-4"
        style={{
          backgroundColor: colors['bg-secondary'],
          borderColor: colors['border-primary'],
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/bell-02.svg`}
              alt="Event Delay"
              className="w-5 h-5"
            />
            <span
              className="text-base font-semibold"
              style={{ color: colors['text-primary'] }}
            >
              Event-Based Delay
            </span>
          </div>
          <button className="opacity-0 hover:opacity-100">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/more-01.svg`}
              alt="More"
              className="w-5 h-5"
            />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm" style={{ color: colors['text-secondary'] }}>
            Waiting for:
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: colors['text-primary'] }}
          >
            {block.delay_event}
          </span>
        </div>

        {block.delay_seconds && (
          <div className="flex items-center gap-2">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock.svg`}
              alt="Clock"
              className="w-4 h-4"
            />
            <span
              className="text-sm"
              style={{ color: colors['text-secondary'] }}
            >
              Expires after {expirationText()}
            </span>
          </div>
        )}

        <div
          className="flex items-center gap-2 p-3 mt-auto rounded-lg bg-opacity-5"
          style={{ backgroundColor: colors['fg-brand-primary'] }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/pause-circle.svg`}
            alt="Info"
            className="w-5 h-5"
          />
          <span className="text-sm" style={{ color: colors['text-secondary'] }}>
            Flow paused until event occurs or time expires
          </span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          width: 8,
          height: 8,
          opacity: 0,
          background: colors['fg-brand-primary'],
          border: `2px solid ${colors['bg-primary']}`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default EventDelayNode;
