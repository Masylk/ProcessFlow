'use client';

import { Workflow } from '@/types/workflow';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import the useRouter hook
import { Workspace } from '@/types/workspace';
import DynamicIcon from '../../../utils/DynamicIcon';

type MenuItem = { label: string; icon: string } | 'separator';

const menuItems: MenuItem[] = [
  { label: 'Open in read mode', icon: 'play.svg' },
  'separator',
  { label: 'Edit Flow info', icon: 'edit-05.svg' },
  { label: 'Duplicate', icon: 'duplicate-icon.svg' },
  { label: 'Move', icon: 'folder-download.svg' },
  'separator',
  { label: 'Delete Flow', icon: 'trash-delete.svg',  },
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
}

export default function WorkflowCard({
  workflow,
  workspace,
  onSelectWorkflow,
  onDeleteWorkflow,
  onEditWorkflow,
  onDuplicateWorkflow,
  onMoveWorkflow,
  tags = ['Human Resources'],
  assignee = 'Maxime Togbe',
}: WorkflowCardProps) {
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
      className="bg-white rounded-lg border border-lightMode-border-secondary p-4 hover:border-lightMode-border-primary transition-all ease-in-out hover:cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(isHovered || isMenuOpen) && (
        <div className="absolute top-1 right-1 transition-opacity duration-150 z-20">
          <div className="h-6 rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start items-start inline-flex overflow-hidden bg-white">
            {/* Star Button - Toggle Fill on Click */}
            <div
              className="px-2 py-1 border-r border-[#d0d5dd] justify-center items-center gap-2 flex transition duration-300 group hover:bg-[#F9FAFB] cursor-pointer"
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
                className="w-4 h-4 transition duration-300 group-hover:brightness-50"
              />
            </div>
            <div className="px-2 py-1 border-r border-[#d0d5dd] justify-center items-center gap-2 flex transition duration-300 group hover:bg-[#F9FAFB]">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-02.svg`}
                alt="Link Icon"
                className="w-4 h-4 transition duration-300 group-hover:brightness-50"
              />
            </div>
            <div
              className="px-2 py-1 justify-center items-center gap-2 flex transition duration-300 group hover:bg-[#F9FAFB] cursor-pointer"
              onClick={(e) => {
                onSelectWorkflow(workflow);
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal-quinary.svg`}
                alt="Dots Icon"
                className="w-4 h-4 transition duration-300 group-hover:brightness-50"
              />
            </div>
          </div>
        </div>
      )}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute w-48 bg-white border border-[#e4e7ec] py-1 rounded-lg shadow-md z-30 mt-2 overflow-hidden"
          style={{ top: 'calc(10% + 8px)', right: '4px' }}
        >
          {menuItems.map((item, index) =>
            item === 'separator' ? (
              <div
                key={`sep-${index}`}
                className="w-full border-t my-1 border-[#e4e7ec]"
              />
            ) : (
              <div
                key={index}
                className="self-stretch px-1.5 py-px flex items-center gap-3 cursor-pointer"
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
                  className={`grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex transition-all duration-300 overflow-hidden ${
                    item.label === 'Delete Flow' ? 'hover:bg-lightMode-bg-error-primary' : 'hover:bg-lightMode-bg-primary_hover'
                  }`}
                >
                  <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                    <div className="w-4 h-4 relative overflow-hidden">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${item.icon}`}
                        alt={`${item.label} Icon`}
                        className={`w-4 h-4 ${item.label === 'Delete Flow' ? 'text-lightMode-fg-error-primary' : ''}`}
                      />
                    </div>
                    <div 
                      className={`grow shrink basis-0  text-sm font-normal font-['Inter'] leading-tight ${
                        item.label === 'Delete Flow' ? 'text-lightMode-fg-error-primary' : 'text-[#344054]'
                      }`}
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
      <h3 className="font-medium text-[#101828] text-lg mb-2">{workflow.name}</h3>
      {/* Description */}
      <p className="text-sm text-[#475467] mb-3">{workflow.description}</p>
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`px-spacing-sm py-0.5 text-xs rounded-md
              ${tag === 'Human Resources' ? 'bg-[#eef4ff] text-[#3538cd]' : ''}
              ${tag === 'Engineering' ? 'bg-[#f2f4f7] text-[#344054]' : ''}
              ${tag === 'Marketing' ? 'bg-[#fdf2fa] text-[#c11574]' : ''}
              ${tag === 'Design' ? 'bg-[#fef6ee] text-[#b93815]' : ''}
            `}
          >
            {tag}
          </span>
        ))}
      </div>
      {/* Steps and Assignee */}
      <div className="flex items-center text-sm text-[#667085]">
        <span>6 Steps</span>
        <div className="w-1 h-1 rounded-full bg-[#d0d5dd] mx-2" />
        <span className="truncate">{assignee}</span>
      </div>
    </div>
  );
}
