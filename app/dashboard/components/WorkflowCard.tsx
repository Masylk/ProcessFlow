'use client';

import { Workflow } from '@/types/workflow';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import the useRouter hook
import { Workspace } from '@/types/workspace';

type MenuItem = { label: string; icon: string } | 'separator';

const menuItems: MenuItem[] = [
  { label: 'Open', icon: 'link-external-02.svg' },
  'separator',
  { label: 'Edit Flow info', icon: 'edit-05.svg' },
  { label: 'Duplicate', icon: 'duplicate-icon.svg' },
  'separator',
  { label: 'Move', icon: 'folder-download.svg' },
  { label: 'Delete Flow', icon: 'trash-01.svg' },
];

interface WorkflowCardProps {
  workflow: Workflow;
  workspace: Workspace;
}
export default function WorkflowCard({
  workflow,
  workspace,
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
      className="relative h-[164.75px] px-6 py-5 bg-white rounded-[10px] border border-[#e4e7ec] flex-col justify-start items-start gap-4 inline-flex overflow-visible cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(isHovered || isMenuOpen) && (
        <div className="absolute top-1 right-1 transition-opacity duration-150 z-20">
          <div className="h-6 rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start items-start inline-flex overflow-hidden bg-white">
            {/* Star Button - Toggle Fill on Click */}
            <div
              className="px-2 py-1 border-r border-[#d0d5dd] justify-center items-center gap-2 flex transition duration-300 group hover:bg-[#F9FAFB] cursor-pointer"
              onClick={() => setIsStarFilled(!isStarFilled)}
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
          className="absolute w-48 bg-white border border-[#e4e7ec] rounded-lg shadow-md z-30 mt-2 overflow-hidden"
          style={{ top: 'calc(10% + 8px)', right: '4px' }}
        >
          {menuItems.map((item, index) =>
            item === 'separator' ? (
              <div
                key={`sep-${index}`}
                className="w-full border-t border-[#e4e7ec]"
              />
            ) : (
              <div
                key={index}
                className="px-4 py-3 flex items-center gap-2 transition duration-300 hover:bg-[#F9FAFB] cursor-pointer"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${item.icon}`}
                  alt={`${item.label} Icon`}
                  className="w-4 h-4"
                />
                <span className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  {item.label}
                </span>
              </div>
            )
          )}
        </div>
      )}
      {/* Workflow Name */}
      <div className="flex-col justify-start items-start gap-2 flex">
        <div className="justify-start items-center gap-2 inline-flex">
          <div className="justify-start items-start gap-[7.19px] flex">
            <div className="w-[94.05px] h-[28.75px] relative" />
          </div>
        </div>
        <div className="text-[#101828] text-sm font-semibold font-['Inter'] leading-tight">
          {workflow.name}
        </div>
      </div>
      {/* Default values for now */}
      <div className="flex-col justify-start items-start gap-2 flex">
        <div className="self-stretch justify-start items-start gap-2 inline-flex">
          <div className="pl-1 pr-1.5 py-0.5 bg-[#eef3ff] rounded-md border-[#c6d7fe] justify-start items-center gap-1 flex">
            <div className="text-center text-[#3537cc] text-xs font-medium font-['Inter'] leading-[18px]">
              Human Resources
            </div>
          </div>
          <div className="pl-1 pr-1.5 py-0.5 bg-[#eff8ff] rounded-md border-[#b2ddff] justify-start items-center gap-1 flex">
            <div className="text-center text-[#175cd3] text-xs font-medium font-['Inter'] leading-[18px]">
              Engineering
            </div>
          </div>
        </div>
        <div className="justify-start items-start gap-2 inline-flex">
          <div className="px-1.5 py-0.5 bg-gray-50 rounded-md justify-start items-center flex">
            <div className="text-center text-[#344054] text-xs font-medium font-['Inter'] leading-[18px]">
              6 Steps
            </div>
          </div>
          <div className="pl-1 pr-1.5 py-0.5 bg-gray-50 rounded-md justify-start items-center gap-1 flex">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/user-circle.svg`}
              alt="User Icon"
              className="w-3 h-3"
            />
            <div className="text-center text-[#344054] text-xs font-medium font-['Inter'] leading-[18px]">
              Maxime Togbe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
