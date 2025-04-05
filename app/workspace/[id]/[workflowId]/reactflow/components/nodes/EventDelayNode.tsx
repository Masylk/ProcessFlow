import React, { useState, useEffect } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';
import { DelayType, NodeData } from '../../../types';
import { useColors } from '@/app/theme/hooks';
import { createPortal } from 'react-dom';
import DelayTypeModal from '../modals/DelayTypeModal';
import { usePathsStore } from '../../store/pathsStore';

const EventDelayNode = ({
  id,
  data,
  selected,
}: NodeProps & { data: NodeData }) => {
  const colors = useColors();
  const { block } = data;
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [showDelayModal, setShowDelayModal] = useState(false);
  const allPaths = usePathsStore((state) => state.paths);
  const setAllPaths = usePathsStore((state) => state.setPaths);

  // Add useEffect for handling clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showDropdown) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        x: rect.right - 170,
        y: rect.bottom + 4,
      });
    }
    setShowDropdown(!showDropdown);
  };

  const handleModifyDelay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDelayModal(true);
    setShowDropdown(false);
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setShowDropdown(false);
      const response = await fetch(
        `/api/blocks/${id.replace('block-', '')}/duplicate`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) throw new Error('Failed to duplicate block');
      const result = await response.json();
      data.onPathsUpdate?.(result.paths);
    } catch (error) {
      console.error('Error duplicating block:', error);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onDelete?.(id);
    setShowDropdown(false);
  };

  const renderDropdown = () => {
    if (!showDropdown) return null;

    return createPortal(
      <div
        style={{
          backgroundColor: colors['bg-secondary'],
          border: `1px solid ${colors['border-primary']}`,
          left: dropdownPosition.x,
          top: dropdownPosition.y,
          zIndex: 99999999,
        }}
        className="fixed shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] py-1 flex flex-col overflow-hidden cursor-pointer rounded-lg"
      >
        <div
          onClick={handleModifyDelay}
          className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
        >
          <div
            style={
              { '--hover-bg': colors['bg-quaternary'] } as React.CSSProperties
            }
            className="w-[170px] grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300"
          >
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                  alt="Modify"
                  className="w-4 h-4"
                />
              </div>
              <div
                style={{ color: colors['text-primary'] }}
                className="text-sm"
              >
                Modify delay
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={handleDuplicate}
          className="self-stretch px-1.5 py-px flex items-center gap-3"
        >
          <div
            style={
              { '--hover-bg': colors['bg-quaternary'] } as React.CSSProperties
            }
            className="w-[170px] grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300"
          >
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/duplicate-icon.svg`}
                  alt="Duplicate"
                  className="w-4 h-4"
                />
              </div>
              <div
                style={{ color: colors['text-primary'] }}
                className="text-sm"
              >
                Duplicate
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={handleDelete}
          className="self-stretch px-1.5 py-px flex items-center gap-3"
        >
          <div
            style={
              { '--hover-bg': colors['bg-quaternary'] } as React.CSSProperties
            }
            className="w-[170px] grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300"
          >
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                  alt="Delete"
                  className="w-4 h-4"
                />
              </div>
              <div
                style={{ color: colors['text-primary'] }}
                className="text-sm"
              >
                Delete
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

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

    return parts.length > 0 ? `${parts.join(' and ')}` : '';
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
          cursor: 'default',
        }}
      />
      <div
        className="p-4 rounded-xl border-2 flex flex-col gap-4"
        style={{
          backgroundColor: colors['bg-primary'],
          borderColor: colors['border-secondary'],
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
              style={{
                border: `1px solid ${colors['border-secondary']}`,
              }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/calendar-clock-1.svg`}
                alt="Event Delay"
                className="w-6 h-6"
              />
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: colors['text-primary'] }}
            >
              Event-Based Delay
            </span>
          </div>
          <button
            className="p-1 rounded-md hover:bg-[var(--hover-bg)] transition-all duration-300"
            onClick={handleDropdownToggle}
            style={{ 
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal.svg`}
              alt="Menu"
              className="w-4 h-4"
            />
          </button>
        </div>

        <div className="flex items-center gap-2">
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
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/hourglass-01.svg`}
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
          style={{ backgroundColor: colors['bg-secondary'] }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/pause-circle.svg`}
            alt="Info"
            className="w-5 h-5"
          />
          <span className="text-sm whitespace-nowrap" style={{ color: colors['text-secondary'] }}>
            {block.delay_seconds ? "Flow paused until event occurs or time expires" : "Flow paused until event occurs"}
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
      {renderDropdown()}
      {showDelayModal && (
        <DelayTypeModal
          onClose={() => setShowDelayModal(false)}
          onSelect={async (delayType, delayData) => {
            try {
              setShowDelayModal(false);
              const blockId = id.replace('block-', '');
              const response = await fetch(`/api/blocks/${blockId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'DELAY',
                  delay_type: delayType,
                  delay_seconds: delayData.seconds,
                  delay_event: delayData.eventName,
                }),
              });

              if (!response.ok) throw new Error('Failed to update delay');

              const updatedBlock = await response.json();
              const updatedPaths = allPaths.map((path) => ({
                ...path,
                blocks: path.blocks.map((block) =>
                  block.id === parseInt(blockId)
                    ? { ...block, ...updatedBlock }
                    : block
                ),
              }));

              setAllPaths(updatedPaths);
              data.onPathsUpdate?.(updatedPaths);
            } catch (error) {
              console.error('Error updating delay:', error);
            }
          }}
          initialData={{
            delayType: data.delayType || undefined,
            eventName: data.eventName || undefined,
            seconds: data.seconds || undefined,
          }}
        />
      )}
    </div>
  );
};

export default EventDelayNode;
