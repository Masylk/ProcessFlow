'use client';

import { Folder, Workspace } from '@/types/workspace';
import React from 'react';
import CanvaHeader from './CanvaHeader';
import WorkflowCard from './WorkflowCard';
import { Workflow, WorkflowStatus } from '@/types/workflow';
import ButtonNormal from '@/app/components/ButtonNormal';
import { useColors } from '@/app/theme/hooks';

interface CanvasProps {
  workspace: Workspace;
  openCreateFlow: () => void;
  onSelectWorkflow: (w: Workflow) => void;
  onDeleteWorkflow: () => void;
  onEditWorkflow: () => void;
  onDuplicateWorkflow: () => void;
  onMoveWorkflow: () => void;
  onStatusChange: (workflow: Workflow, newStatus: WorkflowStatus) => void;
  selectedFolder?: Folder;
  searchTerm?: string;
  currentView: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
}

const Canvas: React.FC<CanvasProps> = ({
  workspace,
  selectedFolder,
  openCreateFlow,
  onSelectWorkflow,
  onDeleteWorkflow,
  onEditWorkflow,
  onDuplicateWorkflow,
  onMoveWorkflow,
  onStatusChange,
  searchTerm = '',
  currentView,
  onViewChange,
}) => {
  const colors = useColors();

  // Filter workflows based on selectedFolder and searchTerm
  const workflowsToDisplay = workspace.workflows.filter((workflow) => {
    const matchesFolder = selectedFolder
      ? workflow.folder_id === selectedFolder.id
      : true;
    const matchesSearch = workflow.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  // Sort workflows by last_opened (recently used first)
  const recentlyUsedWorkflows = [...workflowsToDisplay]
    .filter((workflow) => workflow.last_opened) // Ensure last_opened exists
    .sort(
      (a, b) =>
        new Date(b.last_opened!).getTime() - new Date(a.last_opened!).getTime()
    )
    .slice(0, 4); // Get the top 4 most recent workflows

  return (
    <div 
      style={{ backgroundColor: colors['bg-secondary'] }}
      className="flex flex-col flex-1 w-full h-full"
    >
      <CanvaHeader
        openCreateFlow={openCreateFlow}
        selectedFolder={selectedFolder}
        currentView={currentView}
        onViewChange={onViewChange}
      />

      <div className="flex-1 overflow-y-auto px-8 py-4 pb-40">
        {recentlyUsedWorkflows.length > 0 && (
          <div className="mb-6">
            <h2 
              style={{ color: colors['text-primary'] }}
              className="text-xl font-medium mb-4"
            >
              Recently Used
            </h2>
            {currentView === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentlyUsedWorkflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    workspace={workspace}
                    onSelectWorkflow={onSelectWorkflow}
                    onDuplicateWorkflow={onDuplicateWorkflow}
                    onDeleteWorkflow={onDeleteWorkflow}
                    onEditWorkflow={onEditWorkflow}
                    onMoveWorkflow={onMoveWorkflow}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div 
                style={{ 
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-primary']
                }}
                className="flex flex-col h-min rounded-lg overflow-hidden border"
              >
                <div 
                  style={{ color: colors['text-secondary'] }}
                  className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium"
                >
                  <div className="col-span-3">Name</div>
                  <div className="col-span-3">Tags</div>
                  <div className="col-span-2">Steps</div>
                  <div className="col-span-2">Assignee</div>
                  <div className="col-span-1">Last Used</div>
                  <div className="col-span-1"></div>
                </div>
                <div style={{ backgroundColor: colors['border-primary'] }} className="h-[1px] w-full" />
                {recentlyUsedWorkflows.map((workflow, index) => (
                  <React.Fragment key={workflow.id}>
                    <div 
                      style={{ backgroundColor: colors['bg-primary'] }}
                      className="grid grid-cols-12 px-4 py-3 hover:bg-opacity-80 transition-colors"
                    >
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-[#12B76A] rounded-lg">
                          <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/command.svg`}
                            alt="Workflow icon"
                            className="w-4 h-4"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span style={{ color: colors['text-primary'] }} className="font-medium">
                            {workflow.name}
                          </span>
                          <span style={{ color: colors['text-secondary'] }} className="text-sm">
                            {workflow.description}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <span 
                          style={{ 
                            backgroundColor: colors['bg-secondary'],
                            color: colors['text-secondary']
                          }}
                          className="px-2 py-1 rounded-md text-sm"
                        >
                          Human Resources
                        </span>
                        <span 
                          style={{ 
                            backgroundColor: colors['bg-secondary'],
                            color: colors['text-secondary']
                          }}
                          className="px-2 py-1 rounded-md text-sm"
                        >
                          Engineering
                        </span>
                      </div>
                      <div style={{ color: colors['text-secondary'] }} className="col-span-2 flex items-center">
                        6 Steps
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                        <span style={{ color: colors['text-secondary'] }}>Maxime Togbe</span>
                      </div>
                      <div style={{ color: colors['text-tertiary'] }} className="col-span-1 flex items-center">
                        2 hours ago
                      </div>
                      <div className="col-span-1 flex justify-center pl-16 items-center">
                        <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-vertical.svg`} alt="Actions" className="w-5 h-5" />
                      </div>
                    </div>
                    {index < recentlyUsedWorkflows.length - 1 && (
                      <div style={{ backgroundColor: colors['border-primary'] }} className="h-[1px] w-full" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <h2 
            style={{ color: colors['text-primary'] }}
            className="text-xl font-medium mb-4"
          >
            All Workflows
          </h2>
          {currentView === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {workflowsToDisplay.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  workspace={workspace}
                  onSelectWorkflow={onSelectWorkflow}
                  onDuplicateWorkflow={onDuplicateWorkflow}
                  onDeleteWorkflow={onDeleteWorkflow}
                  onEditWorkflow={onEditWorkflow}
                  onMoveWorkflow={onMoveWorkflow}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          ) : (
            <div 
              style={{ 
                backgroundColor: colors['bg-primary'],
                borderColor: colors['border-primary']
              }}
              className="flex flex-col h-min rounded-lg overflow-hidden border"
            >
              <div 
                style={{ color: colors['text-secondary'] }}
                className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium justify-between"
              >
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Tags</div>
                <div className="col-span-2">Steps</div>
                <div className="col-span-2">Assignee</div>
                <div className="col-span-1">Last Used</div>
                <div className="col-span-1"></div>
              </div>
              <div style={{ backgroundColor: colors['border-primary'] }} className="h-[1px] w-full" />
              {workflowsToDisplay.map((workflow, index) => (
                <React.Fragment key={workflow.id}>
                  <div 
                    style={{ backgroundColor: colors['bg-primary'] }}
                    className="grid grid-cols-12 px-4 py-3 hover:bg-opacity-80 transition-colors"
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="flex flex-col">
                        <span style={{ color: colors['text-primary'] }} className="font-medium">
                          {workflow.name}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <span 
                        style={{ 
                          backgroundColor: colors['bg-secondary'],
                          color: colors['text-secondary']
                        }}
                        className="px-2 py-1 rounded-md text-sm"
                      >
                        Human Resources
                      </span>
                      <span 
                        style={{ 
                          backgroundColor: colors['bg-secondary'],
                          color: colors['text-secondary']
                        }}
                        className="px-2 py-1 rounded-md text-sm"
                      >
                        Engineering
                      </span>
                    </div>
                    <div style={{ color: colors['text-secondary'] }} className="col-span-2 flex items-center">
                      6 Steps
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200" />
                      <span style={{ color: colors['text-secondary'] }}>{workflow.workspaceId}</span>
                    </div>
                    <div style={{ color: colors['text-tertiary'] }} className="col-span-1 flex items-center">
                      2 hours ago
                    </div>
                    <div className="col-span-1 pl-16 flex justify-center items-center">
                      <ButtonNormal
                        variant="secondary"
                        size="small"
                        iconOnly
                        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-vertical.svg`}
                        className="border-none bg-transparent"
                      >
                      </ButtonNormal>
                    </div>
                  </div>
                  {index < workflowsToDisplay.length - 1 && (
                    <div style={{ backgroundColor: colors['border-primary'] }} className="h-[1px] w-full" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
