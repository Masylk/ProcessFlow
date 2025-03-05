'use client';

import { Workflow } from '@/types/workflow';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import the useRouter hook
import { Workspace } from '@/types/workspace';
import DynamicIcon from '../../../utils/DynamicIcon';
import { useColors } from '@/app/theme/hooks';

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
  tags?: string[];
  assignee?: string;
  status?: 'active' | 'draft' | 'inactive';
  lastEdited?: string;
}

export default function WorkflowCard({
  workflow,
  workspace,
  onSelectWorkflow,
  onDeleteWorkflow,
  onEditWorkflow,
  onDuplicateWorkflow,
  onMoveWorkflow,
  tags = ['customer', 'onboarding'],
  assignee = '',
  status = 'active',
  lastEdited = '2 hours ago',
}: WorkflowCardProps) {
  const colors = useColors();
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStarFilled, setIsStarFilled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter(); // Initialize the router

  const handleWorkflowClick = (workflowId: number) => {
    // Redirect to the workflow edit page
    router.push(`/workspace/${workspace.id}/${workflowId}/reactflow`);
  };
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div
      onClick={() => handleWorkflowClick(workflow.id)}
      style={
        {
          backgroundColor: colors['bg-primary'],
          borderColor:
            isHovered || isMenuOpen
              ? colors['border-primary']
              : colors['border-secondary'],
          '--hover-bg': colors['bg-quaternary'],
        } as React.CSSProperties
      }
      className="rounded-lg border p-4 hover:cursor-pointer relative transition-all ease-in-out hover:bg-[var(--hover-bg)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(isHovered || isMenuOpen) && (
        <div className="absolute top-1 right-1 transition-opacity duration-150 z-20">
          <div
            style={{
              backgroundColor: colors['bg-secondary'],
              borderColor: colors['border-primary'],
            }}
            className="h-6 rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border justify-start items-start inline-flex overflow-hidden"
          >
            {/* Star Button - Toggle Fill on Click */}
            <div
              style={
                {
                  borderColor: colors['border-primary'],
                  backgroundColor: colors['bg-secondary'],
                  '--hover-bg': colors['bg-quaternary'],
                } as React.CSSProperties
              }
              className="px-2 py-1 border-r justify-center items-center gap-2 flex transition duration-300 hover:bg-[var(--hover-bg)] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsStarFilled(!isStarFilled);
              }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${
                  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH
                }/assets/shared_components/${
                  isStarFilled ? 'star-filled.svg' : 'star-01.svg'
                }`}
                alt="Star Icon"
                className="w-4 h-4 transition duration-300"
              />
            </div>
            <div
              style={
                {
                  borderColor: colors['border-primary'],
                  backgroundColor: colors['bg-secondary'],
                  '--hover-bg': colors['bg-quaternary'],
                } as React.CSSProperties
              }
              className="px-2 py-1 border-r justify-center items-center gap-2 flex transition duration-300 hover:bg-[var(--hover-bg)] cursor-pointer"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-02.svg`}
                alt="Link Icon"
                className="w-4 h-4 transition duration-300"
              />
            </div>
            <div
              style={
                {
                  backgroundColor: colors['bg-secondary'],
                  '--hover-bg': colors['bg-quaternary'],
                } as React.CSSProperties
              }
              className="px-2 py-1 justify-center items-center gap-2 flex transition duration-300 hover:bg-[var(--hover-bg)] cursor-pointer"
              onClick={(e) => {
                onSelectWorkflow(workflow);
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal-quinary.svg`}
                alt="Dots Icon"
                className="w-4 h-4 transition duration-300"
              />
            </div>
          </div>
        </div>
      )}
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
                className="self-stretch px-1.5 py-px flex items-center gap-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
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
                }}
              >
                <div
                  style={
                    {
                      '--hover-bg': colors['bg-quaternary'],
                    } as React.CSSProperties
                  }
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
      {/* Commented out for now - New icon implementation
      <div className="flex mb-4">
        <div className="bg-gray-100 rounded-[6px] flex items-center justify-center w-10 h-10">
          <DynamicIcon url={workflow.icon || '/placeholder.svg'} size={20} color="currentColor" />
        </div>
      </div>
      */}
      {/* Title */}
      <h3
        style={{ color: colors['text-primary'] }}
        className="font-medium text-lg mb-2"
      >
        {workflow.name}
      </h3>
      {/* Description */}
      <p style={{ color: colors['text-secondary'] }} className="text-sm mb-3">
        {workflow.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.filter(tag => tag.trim() !== '').map((tag) => (
          <span
            key={tag}
            style={{
              backgroundColor: colors['bg-secondary'],
              color: colors['text-secondary'],
            }}
            className="px-3 py-1 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      {/* Steps and Assignee */}
      <div
        style={{ color: colors['text-tertiary'] }}
        className="flex items-center text-sm"
      >
        <span>6 Steps</span>
        <span className="truncate">{assignee}</span>
      </div>
    </div>
  );
}
