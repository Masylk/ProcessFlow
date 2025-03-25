'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import { useParams } from 'next/navigation';
import { User } from '@/types/user';
import { createClient } from '@/utils/supabase/client';
import UserSettings from '@/app/dashboard/components/UserSettings';
import HelpCenterModal from '@/app/dashboard/components/HelpCenterModal';
import dynamic from 'next/dynamic';
import Sidebar from './components/Sidebar';
import { Workspace } from '@/types/workspace';
import { useColors } from '@/app/theme/hooks';
import ProcessCard from './components/ProcessCard';
import ViewModeSwitch from './components/ViewModeSwitch';
import VerticalStep from './components/steps/VerticalStep';
import HorizontalLastStep from './components/steps/HorizontalLastStep';
import ButtonNormal from '@/app/components/ButtonNormal';
import { cn } from '@/lib/utils';
import Alert from '@/app/components/Alert';
import { usePathsStore } from './store/pathsStore';
import ProcessCanvas from './components/ProcessCanvas';
import VerticalLastStep from './components/steps/VerticalLastStep';
import HorizontalStep from './components/steps/HorizontalStep';
import { Block, Path } from '../types';
import { BlockEndType } from '@/types/block';

const HelpCenterModalDynamic = dynamic(
  () => import('@/app/dashboard/components/HelpCenterModal'),
  {
    ssr: false,
  }
);

const UserSettingsDynamic = dynamic(
  () => import('@/app/dashboard/components/UserSettings'),
  {
    ssr: false,
  }
);

interface WorkflowData {
  id: string;
  name: string;
  workspace: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
}

interface StepOption {
  id: string;
  title: string;
  description: string;
}

interface StepData {
  number: number;
  label: string;
  description: string;
  icon: string;
  isActive?: boolean;
  isConditional?: boolean;
  options?: StepOption[];
}

interface StrokeLine {
  id: number;
  source_block_id: number;
  target_block_id: number;
  workflow_id: number;
  label: string;
}

export default function ExamplePage() {
  const params = useParams();
  const supabase = createClient();
  const colors = useColors();
  const [user, setUser] = useState<User | null>(null);
  const [userSettingsVisible, setUserSettingsVisible] =
    useState<boolean>(false);
  const [helpCenterVisible, setHelpCenterVisible] = useState<boolean>(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isDeleteAvatar, setIsDeleteAvatar] = useState<boolean>(false);
  const [passwordChanged, setPasswordChanged] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [viewMode, setViewMode] = useState<'vertical' | 'carousel'>('vertical');
  const [selectedOptions, setSelectedOptions] = useState<[number, number][]>(
    []
  );
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [showLinkCopiedAlert, setShowLinkCopiedAlert] =
    useState<boolean>(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pathsToDisplay, setPathsToDisplay] = useState<typeof paths>([]);
  const [strokeLines, setStrokeLines] = useState<StrokeLine[]>([]);

  const paths = usePathsStore((state) => state.paths);
  const mainPath = useMemo(
    () => paths.find((path) => path.parent_blocks.length === 0),
    [paths]
  );

  const PathsToDisplayBlocks = useMemo(() => {
    return pathsToDisplay.flatMap((path) =>
      path.blocks.filter(
        (block) => !['BEGIN', 'LAST', 'MERGE', 'END'].includes(block.type)
      )
    );
  }, [pathsToDisplay]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check authentication status first
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (!authUser || authError) {
          window.location.href = '/login';
          return;
        }

        const res = await fetch('/api/user');
        const data = await res.json();
        if (data) {
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        window.location.href = '/login';
      }
    };
    fetchUser();
  }, []);

  // Fetch workspace data
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await fetch(`/api/workspace/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch workspace');
        const data = await response.json();
        setWorkspace(data);
      } catch (error) {
        console.error('Error fetching workspace:', error);
      }
    };

    if (params.id) {
      fetchWorkspace();
    }
  }, [params.id]);

  useEffect(() => {
    console.log('paths', paths);
  }, [paths]);
  // Fetch paths
  useEffect(() => {
    const fetchPathsAndStrokeLines = async () => {
      try {
        // Fetch paths
        const response = await fetch(
          `/api/workspace/${params.id}/paths?workflow_id=${params.workflowId}`
        );
        const pathsData = await response.json();

        // Fetch stroke lines
        const strokeLinesResponse = await fetch(
          `/api/stroke-lines?workflow_id=${params.workflowId}`
        );
        if (strokeLinesResponse.ok) {
          const strokeLinesData: StrokeLine[] =
            await strokeLinesResponse.json();
          setStrokeLines(strokeLinesData);

          // Create new paths from stroke lines
          const newPaths: Path[] = [...pathsData.paths];

          strokeLinesData.forEach((strokeLine) => {
            const sourcePath = pathsData.paths.find((p: Path) =>
              p.blocks.some((b) => b.id === strokeLine.source_block_id)
            );
            const targetPath = pathsData.paths.find((p: Path) =>
              p.blocks.some((b) => b.id === strokeLine.target_block_id)
            );

            if (sourcePath && targetPath) {
              const targetBlockIndex = targetPath.blocks.findIndex(
                (b: Block) => b.id === strokeLine.target_block_id
              );

              if (targetBlockIndex !== -1) {
                const { clonedPath: newPath, sourceBlocks } =
                  clonePathWithMergeBlocks(
                    {
                      id: generateUniqueId(newPaths),
                      name: strokeLine.label,
                      workflow_id: parseInt(params.workflowId as string),
                      workflow: targetPath.workflow,
                      blocks: targetPath.blocks.slice(targetBlockIndex),
                      parent_blocks: [
                        {
                          path_id: -1,
                          block_id: strokeLine.source_block_id,
                          created_at: new Date().toISOString(),
                          path: {} as Path,
                          block: {} as Block,
                        },
                      ],
                    },
                    pathsData.paths,
                    strokeLine.source_block_id
                  );

                // Add the new path to the original source block as a child path
                console.log('newPaths', newPaths);
                console.log(
                  'strokeLine source block id',
                  strokeLine.source_block_id
                );
                const sourceBlock = newPaths
                  .flatMap((p) => p.blocks)
                  .find((b: Block) => b.id === strokeLine.source_block_id);
                console.log('sourceBlock', sourceBlock);
                if (sourceBlock) {
                  console.log(
                    'adding original child path to source block',
                    sourceBlock
                  );
                  sourceBlock.child_paths = [
                    ...(sourceBlock.child_paths || []),
                    {
                      path_id: newPath.id,
                      block_id: sourceBlock.id,
                      created_at: new Date().toISOString(),
                      path: newPath,
                      block: sourceBlock,
                    },
                  ];
                }
                // Add the new path to all cloned source blocks as a child path
                sourceBlocks.forEach((sourceBlock) => {
                  console.log(
                    'adding child path to duplicate source blocks',
                    newPath,
                    sourceBlock
                  );
                  sourceBlock.child_paths = [
                    ...(sourceBlock.child_paths || []),
                    {
                      path_id: newPath.id,
                      block_id: sourceBlock.id,
                      created_at: new Date().toISOString(),
                      path: newPath,
                      block: sourceBlock,
                    },
                  ];
                });

                newPaths.push(newPath);

                // Update paths store with the new paths
                usePathsStore.getState().setPaths(newPaths);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching paths and stroke lines:', error);
      }
    };

    fetchPathsAndStrokeLines();
  }, [params.id, params.workflowId]);

  // Update this useEffect to set initial pathsToDisplay
  useEffect(() => {
    if (mainPath) {
      setPathsToDisplay([mainPath]);
    }
  }, [mainPath]);

  // Update the deepCloneBlock function to handle MERGE blocks
  const deepCloneBlock = (
    block: Block,
    sourceBlockId: number,
    sourceBlocks: Block[]
  ): Block => {
    const clonedBlock = {
      ...block,
      id: Math.floor(Math.random() * -1000000), // Negative ID to avoid conflicts
      child_paths: block.child_paths
        ? block.child_paths.map((cp) => ({
            ...cp,
            block_id: block.id,
            path: { ...cp.path },
          }))
        : [],
    };
    if (block.id === sourceBlockId) {
      sourceBlocks.push(clonedBlock);
    }

    return clonedBlock;
  };

  // Update the clonePathWithMergeBlocks function to track stroke line source blocks
  const clonePathWithMergeBlocks = (
    path: Path,
    allPaths: Path[],
    sourceBlockId: number
  ): { clonedPath: Path; sourceBlocks: Block[] } => {
    // Find all blocks in all paths that match the source block ID
    const sourceBlocks: Block[] = [];

    // Clone the path normally
    const clonedPath = {
      ...path,
      id: Math.floor(Math.random() * -1000000),
      blocks: path.blocks.reduce<Block[]>((acc, block) => {
        if (block.type === 'MERGE' && block.child_paths?.[0]) {
          const childPath = allPaths.find(
            (p) => p.id === block.child_paths[0].path.id
          );
          if (childPath) {
            // Add only the child path's blocks
            const childBlocks = childPath.blocks
              .filter((b) => b.type !== 'BEGIN' && b.type !== 'END')
              .map((b) => deepCloneBlock(b, sourceBlockId, sourceBlocks));
            return [...acc, ...childBlocks];
          }
          return acc;
        }
        return [...acc, deepCloneBlock(block, sourceBlockId, sourceBlocks)];
      }, []),
    };

    return { clonedPath, sourceBlocks };
  };

  // Add this helper function for generating unique IDs
  const generateUniqueId = (existingPaths: Path[]): number => {
    let newId: number;
    do {
      newId = Math.floor(Math.random() * -1000000);
    } while (existingPaths.some((p) => p.id === newId));
    return newId;
  };

  // This is example data - in a real app, you would fetch this from your API
  const workflowData: WorkflowData = {
    id: params.workflowId as string,
    name: 'Employee Onboarding',
    workspace: {
      id: params.id as string,
      name: 'Human Resources',
    },
    category: {
      id: 'shared',
      name: 'Shared with me',
    },
  };

  // Construct breadcrumb items based on the workflow data
  const breadcrumbItems = [
    {
      label: workflowData.category.name,
      href: `/${workflowData.category.id}`,
    },
    {
      label: workflowData.workspace.name,
      href: `/workspace/${workflowData.workspace.id}`,
    },
    {
      label: workflowData.name,
    },
  ];

  const openUserSettings = () => {
    setUserSettingsVisible(true);
  };

  const closeUserSettings = () => {
    setFileToUpload(null);
    setUserSettingsVisible(false);
    setPasswordChanged(false);
  };

  const openHelpCenter = () => {
    setHelpCenterVisible(true);
  };

  const closeHelpCenter = () => {
    setHelpCenterVisible(false);
  };

  // Function to update the user in state
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const processCardData = {
    icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/processflow_logo.png`,
    title: workflowData.name,
    description:
      "This process guides new employees through each steps of ProcessFlow's onboarding.",
    integrations: [
      {
        name: 'Linear',
        icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/step-icons/apps/linear.svg`,
      },
      {
        name: 'Gmail',
        icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/step-icons/apps/gmail.svg`,
      },
      {
        name: 'Figma',
        icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/step-icons/apps/figma.svg`,
      },
    ],
    author: {
      name: 'Jane Doe',
      avatar: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/images/placeholder-avatar1.png`,
    },
    lastUpdate: '23/08/24',
    steps: PathsToDisplayBlocks.length,
    duration: '15 minutes',
  };

  const handleOptionSelect = (
    optionId: number,
    blockId: number,
    isMerge: boolean = false
  ) => {
    const pathToAdd = paths.find((path) => path.id === optionId);
    if (!pathToAdd) return;

    // Find if the new path shares any parent blocks with existing paths
    const sharedParentIndex = pathsToDisplay.findIndex((displayPath) =>
      displayPath.parent_blocks.some((displayParentBlock) =>
        pathToAdd.parent_blocks.some(
          (newParentBlock) =>
            newParentBlock.block_id === displayParentBlock.block_id &&
            newParentBlock.block_id !== blockId
        )
      )
    );

    // Rest of the function for normal path addition...
    setPathsToDisplay((currentPaths) => {
      const newPaths = [...currentPaths];

      // Get all parent block IDs of the path to add
      const parentBlockIds = pathToAdd.parent_blocks.map((pb) => pb.block_id);

      // Find if there's a path with any matching parent block
      const sameParentIndex = newPaths.findIndex((path) =>
        path.parent_blocks.some((pb) => parentBlockIds.includes(pb.block_id))
      );

      if (sameParentIndex !== -1) {
        // Remove this path and all following paths
        newPaths.splice(sameParentIndex);
      }

      // Insert the new path
      newPaths.push(pathToAdd);

      // Check if last block has exactly one child path
      const lastBlock = pathToAdd.blocks[pathToAdd.blocks.length - 1];
      if (lastBlock?.child_paths?.length === 1) {
        const childPath = paths.find(
          (p) => p.id === lastBlock.child_paths[0].path.id
        );
        if (childPath && !newPaths.some((p) => p.id === childPath.id)) {
          // Add the child path if it's not already in pathsToDisplay
          newPaths.push(childPath);
        }
      }

      // Schedule scroll after state update
      setTimeout(() => {
        const firstBlock = pathToAdd.blocks.find(
          (block) => !['BEGIN', 'LAST', 'MERGE', 'END'].includes(block.type)
        );
        if (firstBlock) {
          const element = document.getElementById(`block-${firstBlock.id}`);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'end',
            });
          }
        }
      }, 100);

      return newPaths;
    });

    // Update selectedOptions
    setSelectedOptions((currentSelected) => {
      const newSelected = [...currentSelected];

      // Get the block ID from the path's parent block instead of the parameter
      const blockIdFromPath = pathToAdd.parent_blocks[0]?.block_id;
      if (!blockIdFromPath) return currentSelected;

      // Check if this selection pair already exists
      const selectionExists = newSelected.some(
        ([pathId, blockId]) =>
          pathId === optionId && blockId === blockIdFromPath
      );

      // Only add if it doesn't exist
      if (!selectionExists) {
        newSelected.push([optionId, blockIdFromPath]);
      }

      // Keep only selections for remaining paths
      return newSelected.filter(([pathId]) =>
        [
          ...pathsToDisplay.slice(
            0,
            sharedParentIndex !== -1 ? sharedParentIndex : undefined
          ),
          pathToAdd,
        ]
          .map((p) => p.id)
          .includes(pathId)
      );
    });
  };

  // Add this function to handle step navigation
  const handleStepNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (currentStep === PathsToDisplayBlocks.length - 1) {
        setCurrentStep(PathsToDisplayBlocks.length);
      } else {
        setCurrentStep((prev) =>
          Math.min(prev + 1, PathsToDisplayBlocks.length - 1)
        );
      }
    } else {
      if (currentStep === PathsToDisplayBlocks.length) {
        setCurrentStep(PathsToDisplayBlocks.length - 1);
      } else {
        setCurrentStep((prev) => Math.max(prev - 1, -1));
      }
    }
  };

  // Add this function to calculate progress
  const calculateProgress = () => {
    return ((currentStep + 1) / (PathsToDisplayBlocks.length + 1)) * 100;
  };

  const handleCopyLink = () => {
    // Copy the current URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    setShowLinkCopiedAlert(true);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setShowLinkCopiedAlert(false);
    }, 5000);
  };

  // Function to handle step click from sidebar
  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    // Toggle expansion: if step is expanded, remove it, otherwise add it
    setExpandedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );

    // Scroll to step with centering
    const element = stepRefs.current[index];
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        // Adjust for header height
        window.scrollBy(0, -120); // Offset for header height
      }, 50);
    }
  };

  const handleStepToggle = (blockId: number, isExpanded: boolean) => {
    if (isExpanded) {
      setCurrentStep(blockId);
      // Add scrolling behavior
      const element = stepRefs.current[blockId];
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          window.scrollBy(0, -120);
        }, 50);
      }
    }
    setExpandedSteps((prev) =>
      isExpanded ? [...prev, blockId] : prev.filter((i) => i !== blockId)
    );
  };

  // Add this function after other function declarations
  const addPathToDisplay = (pathId: number, index: number) => {
    const pathToAdd = paths.find((path) => path.id === pathId);
    if (!pathToAdd) return;

    // If path already exists, scroll to its first block
    const existingPath = pathsToDisplay.find((p) => p.id === pathId);
    if (existingPath) {
      const firstBlock = existingPath.blocks.find(
        (block) => !['BEGIN', 'LAST', 'MERGE', 'END'].includes(block.type)
      );
      if (firstBlock) {
        // Find the block element by its ID
        const element = document.getElementById(`block-${firstBlock.id}`);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
            window.scrollBy(0, -120); // Offset for header height
          }, 50);
        }
      }
      return;
    }

    setPathsToDisplay((currentPaths) => {
      const newPaths = [...currentPaths];

      // Get all parent block IDs of the path to add
      const parentBlockIds = pathToAdd.parent_blocks.map((pb) => pb.block_id);

      // Find if there's a path with any matching parent block
      const sameParentIndex = newPaths.findIndex((path) =>
        path.parent_blocks.some((pb) => parentBlockIds.includes(pb.block_id))
      );

      if (sameParentIndex !== -1) {
        // Remove this path and all following paths
        newPaths.splice(sameParentIndex);
      }

      // Insert the new path
      newPaths.splice(index, 0, pathToAdd);
      return newPaths;
    });
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: colors['bg-primary'] }}
    >
      {user && workspace && (
        <>
          <Sidebar
            className="w-64"
            workspace={workspace}
            activeStepId={currentStep}
            onStepClick={handleStepClick}
            pathsToDisplay={pathsToDisplay}
          />
          <div className="flex-1 ml-64">
            <div className="fixed right-0 left-64 bg-primary z-30">
              <Header
                breadcrumbItems={breadcrumbItems}
                user={user}
                onOpenUserSettings={openUserSettings}
                onOpenHelpCenter={openHelpCenter}
              />
              <div className="absolute right-4 top-20 flex items-center gap-2">
                <ViewModeSwitch mode={viewMode} onModeChange={setViewMode} />
              </div>
            </div>

            {/* User Settings Modal */}
            {userSettingsVisible && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <UserSettingsDynamic
                  user={user}
                  onClose={closeUserSettings}
                  onUserUpdate={updateUser}
                  selectedFile={fileToUpload}
                  isDeleteAvatar={isDeleteAvatar}
                  onDeleteAvatar={() => setIsDeleteAvatar(true)}
                  passwordChanged={passwordChanged}
                  openImageUpload={() => {}}
                  openDeleteAccount={() => {}}
                  updateNewPassword={setNewPassword}
                />
              </div>
            )}

            {/* Help Center Modal */}
            {helpCenterVisible && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <HelpCenterModalDynamic onClose={closeHelpCenter} user={user} />
              </div>
            )}

            {/* Link Copied Alert */}
            {showLinkCopiedAlert && (
              <div className="fixed bottom-4 right-4 z-50">
                <Alert
                  variant="success"
                  title=""
                  message="Step's link copied to your clipboard"
                  onClose={() => setShowLinkCopiedAlert(false)}
                />
              </div>
            )}

            {/* Main content */}
            <ProcessCanvas>
              {viewMode === 'vertical' ? (
                <div className="p-6">
                  <div className="ml-28 flex flex-col gap-[72px]">
                    <ProcessCard {...processCardData} />
                    {pathsToDisplay.map((path) => (
                      <div key={path.id} className="space-y-16">
                        {path.blocks
                          .filter(
                            (block) =>
                              block.type !== 'BEGIN' && block.type !== 'LAST'
                          )
                          .map((block, index) => (
                            <div
                              key={block.id}
                              id={`block-${block.id}`}
                              ref={(el) => {
                                if (el) stepRefs.current[index] = el;
                              }}
                            >
                              <VerticalStep
                                variant="default"
                                block={block}
                                isActive={currentStep === block.id}
                                defaultExpanded={expandedSteps.includes(
                                  block.id
                                )}
                                onToggle={(isExpanded) =>
                                  handleStepToggle(block.id, isExpanded)
                                }
                                selectedOptionIds={selectedOptions}
                                onOptionSelect={(optionId, blockId) =>
                                  handleOptionSelect(optionId, blockId)
                                }
                                isLastStep={false}
                              />
                            </div>
                          ))}
                      </div>
                    ))}
                    <VerticalLastStep
                      onCopyLink={handleCopyLink}
                      icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-circle.svg`}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div
                    className="rounded-2xl border w-full max-w-3xl"
                    style={{
                      backgroundColor: colors['bg-primary'],
                      borderColor: colors['border-secondary'],
                    }}
                  >
                    <div className="p-8 flex flex-col">
                      {currentStep === -1 ? (
                        <>
                          <div
                            style={{
                              height: '472px',
                              backgroundColor: colors['bg-primary'],
                            }}
                            className="flex items-center"
                          >
                            <ProcessCard {...processCardData} />
                          </div>
                          {/* Navigation and Progress Bar */}
                          <div className="flex items-center justify-between mt-8">
                            {/* Progress Bar */}
                            <div className="flex items-center">
                              <div className="relative flex items-center w-[400px]">
                                {/* Home Icon */}
                                <img
                                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/home-05.svg`}
                                  alt="Home icon"
                                  className="w-6 h-6"
                                />

                                {/* Line from home to first step */}
                                <div
                                  className="w-[40px] h-[1px] mx-2"
                                  style={{
                                    backgroundColor:
                                      currentStep >= 0
                                        ? colors['bg-brand-solid']
                                        : colors['border-secondary'],
                                  }}
                                />

                                {/* Step Dots - Initial View */}
                                {PathsToDisplayBlocks.map((_, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center"
                                  >
                                    {/* Step Indicator */}
                                    <div className="relative z-10 flex items-center justify-center w-6 h-6">
                                      {index < currentStep ? (
                                        // Completed step - show tick icon
                                        <img
                                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/step-icon-done.svg`}
                                          alt="Completed step"
                                          className="w-6 h-6"
                                        />
                                      ) : (
                                        // Current or future step - show simple dot
                                        <div
                                          className={cn('w-2 h-2 rounded-full')}
                                          style={{
                                            backgroundColor:
                                              index === currentStep
                                                ? colors['bg-brand-solid']
                                                : colors['border-secondary'],
                                          }}
                                        />
                                      )}
                                    </div>
                                    {/* Connecting Line */}
                                    {index <
                                      PathsToDisplayBlocks.length - 1 && (
                                      <div
                                        className="w-[40px] h-[1px] mx-2"
                                        style={{
                                          backgroundColor:
                                            index < currentStep
                                              ? colors['bg-brand-solid']
                                              : colors['border-secondary'],
                                        }}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center gap-2">
                              <ButtonNormal
                                variant="secondary"
                                size="small"
                                onClick={() => handleStepNavigation('prev')}
                                disabled={currentStep === -1}
                                iconOnly
                                leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
                              />
                              <ButtonNormal
                                variant="primary"
                                size="small"
                                onClick={() => handleStepNavigation('next')}
                                disabled={
                                  currentStep ===
                                  PathsToDisplayBlocks.length - 1
                                }
                                trailingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-right.svg`}
                              >
                                Next step
                              </ButtonNormal>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="flex flex-col"
                            style={{ height: '472px' }}
                          >
                            {currentStep === PathsToDisplayBlocks.length ? (
                              <HorizontalLastStep onCopyLink={handleCopyLink} />
                            ) : (
                              <HorizontalStep
                                block={PathsToDisplayBlocks[currentStep]}
                              />
                            )}
                          </div>

                          {/* Navigation and Progress Bar */}
                          <div className="flex items-center justify-between mt-8">
                            {/* Progress Bar */}
                            <div className="flex items-center">
                              <div className="relative flex items-center w-[400px]">
                                {/* Home Icon */}
                                <img
                                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/home-05.svg`}
                                  alt="Home icon"
                                  className="w-6 h-6"
                                />

                                {/* Line from home to first step */}
                                <div
                                  className="w-[40px] h-[1px] mx-2"
                                  style={{
                                    backgroundColor:
                                      currentStep >= 0
                                        ? colors['bg-brand-solid']
                                        : colors['border-secondary'],
                                  }}
                                />

                                {/* Step Dots - Step View */}
                                {PathsToDisplayBlocks.map((_, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center"
                                  >
                                    {/* Step Indicator */}
                                    <div className="relative z-10 flex items-center justify-center w-6 h-6">
                                      {index < currentStep ? (
                                        // Completed step - show tick icon
                                        <img
                                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/step-icon-done.svg`}
                                          alt="Completed step"
                                          className="w-6 h-6"
                                        />
                                      ) : (
                                        // Current or future step - show simple dot
                                        <div
                                          className={cn('w-2 h-2 rounded-full')}
                                          style={{
                                            backgroundColor:
                                              index === currentStep
                                                ? colors['bg-brand-solid']
                                                : colors['border-secondary'],
                                          }}
                                        />
                                      )}
                                    </div>
                                    {/* Connecting Line */}
                                    {index <
                                      PathsToDisplayBlocks.length - 1 && (
                                      <div
                                        className="w-[40px] h-[1px] mx-2"
                                        style={{
                                          backgroundColor:
                                            index < currentStep
                                              ? colors['bg-brand-solid']
                                              : colors['border-secondary'],
                                        }}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center gap-2">
                              <ButtonNormal
                                variant="secondary"
                                size="small"
                                onClick={() => handleStepNavigation('prev')}
                                disabled={currentStep === -1}
                                iconOnly
                                leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
                              />
                              <ButtonNormal
                                variant="primary"
                                size="small"
                                onClick={() => handleStepNavigation('next')}
                                disabled={
                                  currentStep === PathsToDisplayBlocks.length
                                }
                                trailingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-right.svg`}
                              >
                                {currentStep === PathsToDisplayBlocks.length - 1
                                  ? 'Complete'
                                  : 'Next step'}
                              </ButtonNormal>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </ProcessCanvas>
          </div>
        </>
      )}
    </div>
  );
}
