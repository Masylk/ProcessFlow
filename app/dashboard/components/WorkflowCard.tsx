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
  { label: 'Delete Flow', icon: 'trash-01.svg',  },
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
    router.push(`/workspace/${workspace.id}/${workflowId}/edit`);
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
      style={{
        backgroundColor: colors['bg-primary'],
        borderColor: colors['border-secondary'],
        '--hover-bg': colors['bg-quaternary']
      } as React.CSSProperties}
      className="rounded-lg border p-4 hover:cursor-pointer relative transition-all ease-in-out hover:bg-[var(--hover-bg)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top section with title and icons */}
      <div className="flex justify-between items-start mb-2">
        <h3 
          style={{ color: colors['text-primary'] }}
          className="font-medium text-base"
        >
          {workflow.name}
        </h3>
        
        <div className="flex items-center gap-2">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsStarFilled(!isStarFilled);
            }}
            className="cursor-pointer"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${
                process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH
              }/assets/shared_components/${
                isStarFilled ? 'star-filled.svg' : 'star-01.svg'
              }`}
              alt="Star Icon"
              className="w-4 h-4"
            />
          </div>
          <div
            onClick={(e) => {
              onSelectWorkflow(workflow);
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="cursor-pointer"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal-quinary.svg`}
              alt="More options"
              className="w-4 h-4"
            />
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          ref={menuRef}
          style={{
            backgroundColor: colors['bg-secondary'],
            borderColor: colors['border-primary'],
            top: 'calc(10% + 8px)',
            right: '4px'
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
                  style={{
                    '--hover-bg': colors['bg-quaternary']
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

      {/* Category/Subtitle */}
     
      {/* Description */}
      <p 
        style={{ color: colors['text-secondary'] }}
        className="text-sm mb-3"
      >
        {workflow.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.filter(tag => tag.trim() !== '').map((tag) => (
          <span
            key={tag}
            style={{
              backgroundColor: colors['bg-quaternary'],
              color: colors['text-secondary']
            }}
            className="px-3 py-1 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      
      {/* Footer with status and last edited */}
      <div className="flex justify-between items-center mt-2">
        <div className="px-3 py-1 text-xs font-medium rounded-full bg-black text-white">
          {status}
        </div>
        
        <span 
          style={{ color: colors['text-tertiary'] }}
          className="text-xs"
        >
          Edited {lastEdited}
        </span>
      </div>
    </div>
  );
}
