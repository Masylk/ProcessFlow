'use client';

import { Folder, Workspace } from '@/types/workspace';
import React from 'react';
import CanvaHeader from './CanvaHeader';
import WorkflowCard from './WorkflowCard';
import { Workflow } from '@/types/workflow';
import ButtonNormal from '@/app/components/ButtonNormal';

interface CanvasProps {
  workspace: Workspace;
  openCreateFlow: () => void;
  onSelectWorkflow: (w: Workflow) => void;
  onDeleteWorkflow: () => void;
  onEditWorkflow: () => void;
  onDuplicateWorkflow: () => void;
  onMoveWorkflow: () => void;
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
  searchTerm = '',
  currentView,
  onViewChange,
}) => {
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
    <div className="flex flex-col flex-1 w-full h-full bg-lightMode-bg-secondary_alt">
      <CanvaHeader
        openCreateFlow={openCreateFlow}
        selectedFolder={selectedFolder}
        currentView={currentView}
        onViewChange={onViewChange}
      />

      {/* Scrollable Section - Updated height and overflow handling */}
      <div className="flex-1 overflow-y-auto px-8 py-4 pb-40">
        {/* Recently Used Section */}
        {recentlyUsedWorkflows.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lightMode-text-primary text-xl font-medium mb-4">Recently Used</h2>
            {currentView === 'grid' ? (
              <div className="grid grid-cols-4 gap-4">
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
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col h-min bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-600">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-3">Tags</div>
                  <div className="col-span-2">Steps</div>
                  <div className="col-span-2">Assignee</div>
                  <div className="col-span-1">Last Used</div>
                  <div className="col-span-1"></div>
                </div>
                {/* 1px separator */}
                <div className="h-[1px] w-full bg-gray-200" />
                {recentlyUsedWorkflows.map((workflow, index) => (
                  <React.Fragment key={workflow.id}>
                    <div 
                      className="grid grid-cols-12 px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
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
                          <span className="font-medium text-gray-900">{workflow.name}</span>
                          <span className="text-sm text-gray-500">{workflow.description}</span>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
                          Human Resources
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
                          Engineering
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center text-gray-700">
                        6 Steps
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                        <span className="text-gray-700">Maxime Togbe</span>
                      </div>
                      <div className="col-span-1 flex items-center text-gray-500">
                        2 hours ago
                      </div>
                        <div className="col-span-1 flex justify-center pl-16 items-center text-gray-500">
                        <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-vertical.svg`} alt="Actions" className="w-5 h-5" />
                      </div>
                    </div>
                    {/* Add separator if not the last item */}
                    {index < recentlyUsedWorkflows.length - 1 && (
                      <div className="h-[1px] w-full bg-gray-200" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Workflows Section */}
        <div>
          <h2 className="text-lightMode-text-primary text-xl font-medium mb-4">All Workflows</h2>
          {currentView === 'grid' ? (
            <div className="grid grid-cols-4 gap-4 ">
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
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col h-min bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-600 justify-between">
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Tags</div>
                <div className="col-span-2">Steps</div>
                <div className="col-span-2">Assignee</div>
                <div className="col-span-1">Last Used</div>
                <div className="col-span-1"></div>
              </div>
              {/* 1px separator */}
              <div className="h-[1px] w-full bg-gray-200" />
              {workflowsToDisplay.map((workflow, index) => (
                <React.Fragment key={workflow.id}>
                  <div 
                    className="grid grid-cols-12 px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{workflow.name}</span>
                 
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
                        Human Resources
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
                        Engineering
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center text-gray-700">
                      6 Steps
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200" />
                      <span className="text-gray-700">{workflow.workspaceId}</span>
                    </div>
                    <div className="col-span-1 flex items-center text-gray-500">
                      2 hours ago
                    </div>
                    <div className="col-span-1 pl-16 flex justify-center items-center text-gray-500">
                      <ButtonNormal
                        variant="secondaryGray"
                        mode="light"
                        size="small"
                        iconOnly
                        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-vertical.svg`}
                        className="border-none bg-transparent"
                      >
                      </ButtonNormal>
                    </div>
                  </div>
                  {/* Add separator if not the last item */}
                  {index < workflowsToDisplay.length - 1 && (
                    <div className="h-[1px] w-full bg-gray-200" />
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
