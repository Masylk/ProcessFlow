'use client';

import { Workflow, WorkflowStatus } from '@/types/workflow';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import the useRouter hook
import { Workspace } from '@/types/workspace';
import DynamicIcon from '../../../utils/DynamicIcon';
import { useColors } from '@/app/theme/hooks';

interface StatusStyle {
  bg: string;
  border: string;
  text: string;
  label: string;
}

const STATUS_STYLES: Record<WorkflowStatus, StatusStyle> = {
  'ACTIVE': {
    bg: '#ECFDF3',
    border: '#ABEFC6',
    text: '#067647',
    label: 'Active'
  },
  'DRAFT': {
    bg: '#F9FAFB',
    border: '#E4E7EC',
    text: '#344054',
    label: 'Draft'
  },
  'IN_REVIEW': {
    bg: '#F4F3FF',
    border: '#D9D6FE',
    text: '#5925DC',
    label: 'In review'
  },
  'NEEDS_UPDATE': {
    bg: '#FEF0C7',
    border: '#FEDF89',
    text: '#B54708',
    label: 'Needs update'
  },
  'ARCHIVED': {
    bg: '#FEF3F2',
    border: '#FECDCA',
    text: '#B42318',
    label: 'Archived'
  }
};

type MenuItem = { label: string; icon: string } | 'separator';

const menuItems: MenuItem[] = [
  { label: 'Open in read mode', icon: 'play.svg' },
  'separator',
  { label: 'Edit Flow info', icon: 'edit-05.svg' },
  { label: 'Duplicate', icon: 'duplicate-icon.svg' },
  { label: 'Move', icon: 'folder-download.svg' },
  'separator',
  { label: 'Delete Flow', icon: 'trash-01.svg' },
];

interface WorkflowCardProps {
  workflow: Workflow;
  workspace: Workspace;
  onSelectWorkflow: (workflow: Workflow) => void;
  onDeleteWorkflow: (workflow: Workflow) => void;
  onEditWorkflow: (workflow: Workflow) => void;
  onDuplicateWorkflow: (workflow: Workflow) => void;
  onMoveWorkflow: (workflow: Workflow) => void;
  onStatusChange: (workflow: Workflow, newStatus: WorkflowStatus) => void;
  lastEdited: string;
}

export default function WorkflowCard({
  workflow,
  workspace,
  onSelectWorkflow,
  onDeleteWorkflow,
  onEditWorkflow,
  onDuplicateWorkflow,
  onMoveWorkflow,
  onStatusChange,
  lastEdited = '2 hours ago',
}: WorkflowCardProps) {
  const colors = useColors();
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isStarFilled, setIsStarFilled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleWorkflowClick = (workflowId: number) => {
    router.push(`/workspace/${workspace.id}/${workflowId}/reactflow`);
  };

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const menuButton = document.querySelector('[data-menu-button]');
      const isClickOnMenuButton = menuButton?.contains(event.target as Node);

      if (!isClickOnMenuButton && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setIsStatusMenuOpen(false);
      }
    }

    if (isMenuOpen || isStatusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Also handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMenuOpen(false);
          setIsStatusMenuOpen(false);
        }
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isMenuOpen, isStatusMenuOpen]);

  const currentStatus = STATUS_STYLES[workflow.status as WorkflowStatus];

  return (
    <div
      onClick={() => handleWorkflowClick(workflow.id)}
      style={{
        backgroundColor: colors['bg-primary'],
        borderColor: isHovered || isMenuOpen ? colors['border-primary'] : colors['border-secondary'],
        '--hover-bg': colors['bg-quaternary'],
      } as React.CSSProperties}
      className="rounded-lg border hover:cursor-pointer relative transition-all ease-in-out hover:bg-[var(--hover-bg)] h-[180px] flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Menu Icons */}
      <div className="absolute top-3 right-3 z-20">
        <div className="flex items-center gap-2">
          {/* Star Button */}
          <div
            className="w-6 h-6 rounded flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsStarFilled(!isStarFilled);
            }}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${isStarFilled ? 'star-filled.svg' : 'star-01.svg'}`}
              alt="Star Icon"
              className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Link Button */}
          <div
            className="w-6 h-6 rounded flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-02.svg`}
              alt="Link Icon"
              className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Menu Button */}
          <div
            data-menu-button
            className="w-6 h-6 rounded flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal-quinary.svg`}
              alt="Menu"
              className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-full">
        {/* Top Section */}
        <div className="p-4 flex-1">
          {/* Icon */}
          <div className="mb-3">
            <div className="flex items-center justify-center w-8 h-8">
              {workflow.icon ? (
                <DynamicIcon 
                  url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${workflow.icon}`} 
                  size={32} 
                  color="inherit" 
                />
              ) : (
                <img
                  src={workspace.icon_url || `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logomark-pf.png`}
                  alt={`${workspace.name} Icon`}
                  className="w-8 h-8"
                />
              )}
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-1">
            <h3 
              style={{ color: colors['text-primary'] }} 
              className="font-medium text-md line-clamp-2 break-words pr-20 overflow-hidden"
              title={workflow.name}
            >
              {workflow.name}
            </h3>
            
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto">
          <div style={{ borderColor: colors['border-secondary'] }} className="border-t w-full" />
          <div className="px-4 py-3 flex items-center justify-between">
            <div
              className="relative"
              onClick={(e) => {
                e.stopPropagation();
                setIsStatusMenuOpen(!isStatusMenuOpen);
              }}
            >
              <div
                style={{
                  backgroundColor: currentStatus.bg,
                  borderColor: currentStatus.border,
                  color: currentStatus.text,
                }}
                className="px-2 py-0.5 text-xs rounded-full border cursor-pointer"
              >
                {currentStatus.label}
              </div>

              {/* Status Dropdown Menu */}
              {isStatusMenuOpen && (
                <div
                  ref={statusMenuRef}
                  style={{
                    backgroundColor: colors['bg-secondary'],
                    borderColor: colors['border-primary'],
                  }}
                  className="absolute left-0 top-full mt-1 z-30 rounded-lg border shadow-lg overflow-hidden"
                >
                  {Object.entries(STATUS_STYLES).map(([key, style]) => (
                    <div
                      key={key}
                      style={{
                        backgroundColor: key === workflow.status ? style.bg : 'transparent',
                        color: style.text,
                      }}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                      onClick={() => {
                        onStatusChange(workflow, key as WorkflowStatus);
                        setIsStatusMenuOpen(false);
                      }}
                    >
                      {style.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <span style={{ color: colors['text-tertiary'] }} className="text-xs">
              Last update: {lastEdited}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Dropdown */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          style={{
            backgroundColor: colors['bg-secondary'],
            borderColor: colors['border-primary'],
            top: 'calc(10% + 8px)',
            right: '4px',
          }}
          className="absolute w-48 py-1 rounded-lg shadow-md z-30 mt-2 overflow-hidden border"
          onClick={e => e.stopPropagation()}
        >
          {menuItems.map((item, index) =>
            item === 'separator' ? (
              <div
                key={`sep-${index}`}
                style={{ borderColor: colors['border-secondary'] }}
                className="w-full border-b my-1"
              />
            ) : (
              <div
                key={index}
                className="self-stretch px-1.5 py-px flex items-center gap-3 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWorkflow(workflow);
                  if (item.label === 'Delete Flow') {
                    onDeleteWorkflow(workflow);
                  } else if (item.label === 'Move') {
                    onMoveWorkflow(workflow);
                  } else if (item.label === 'Edit Flow info') {
                    onEditWorkflow(workflow);
                  } else if (item.label === 'Open in read mode') {
                    handleWorkflowClick(workflow.id);
                  } else if (item.label === 'Duplicate') {
                    onDuplicateWorkflow(workflow);
                  }
                  setIsMenuOpen(false);
                }}
              >
                <div
                  style={{
                    '--hover-bg': colors['bg-quaternary'],
                  } as React.CSSProperties}
                  className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
                >
                  <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                    <div className="w-4 h-4 relative overflow-hidden">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${item.icon}`}
                        alt={`${item.label} Icon`}
                        className="w-4 h-4"
                      />
                    </div>
                    <div
                      style={{ color: colors['text-primary'] }}
                      className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
                    >
                      {item.label}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
