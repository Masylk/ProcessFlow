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
import { Workspace, Folder } from '@/types/workspace';
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
  icon?: string;
  description?: string;
  author?: {
    full_name: string;
    avatar_url?: string;
  };
  folder?: {
    id: string;
    name: string;
    parent?: {
      id: string;
      name: string;
    };
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

interface BreadcrumbItem {
  label: string;
  href?: string;
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
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);
  const [mergePathsParents, setMergePathsParents] = useState<
    [number, number][]
  >([]);
  const [generatedPathIds] = useState<Set<number>>(new Set());
  const [generatedBlockIds] = useState<Set<number>>(new Set());
  const [copyPaths, setCopyPaths] = useState<Path[]>([]);

  const paths = usePathsStore((state) => state.paths);
  const mainPath = useMemo(
    () => paths.find((path) => path.parent_blocks.length === 0),
    [paths]
  );

  const PathsToDisplayBlocks = useMemo(() => {
    return pathsToDisplay.flatMap((path) => {
      // Filter blocks and apply skip logic
      return path.blocks.filter(
        (block) => !['BEGIN', 'LAST', 'MERGE', 'END'].includes(block.type)
      );
    });
  }, [pathsToDisplay, selectedOptions, paths]);

  // Initialize all steps as expanded when paths are loaded
  useEffect(() => {
    if (pathsToDisplay.length > 0) {
      const allBlockIds = pathsToDisplay.flatMap(path =>
        path.blocks
          .filter(block => block.type !== 'BEGIN' && block.type !== 'LAST')
          .map(block => block.id)
      );
      setExpandedSteps(allBlockIds);
    }
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

  useEffect(() => {}, [paths]);
  // Fetch paths
  useEffect(() => {
    const fetchPathsAndStrokeLines = async () => {
      try {
        // Fetch paths
        const response = await fetch(
          `/api/workspace/${params.id}/paths?workflow_id=${params.workflowId}`
        );
        const pathsData = await response.json();

        if (pathsData.paths) {
          const newPaths = [...pathsData.paths];

          // First process stroke lines
          const strokeLinesResponse = await fetch(
            `/api/stroke-lines?workflow_id=${params.workflowId}`
          );
          if (strokeLinesResponse.ok) {
            const strokeLinesData: StrokeLine[] =
              await strokeLinesResponse.json();
            setStrokeLines(strokeLinesData);

            strokeLinesData.forEach((strokeLine) => {
              const sourcePath = pathsData.paths.find((p: Path) =>
                p.blocks.some((b) => b.id === strokeLine.source_block_id)
              );
              const targetPath = pathsData.paths.find((p: Path) =>
                p.blocks.some((b) => b.id === strokeLine.target_block_id)
              );

              if (sourcePath && targetPath) {
                // Find the source block index
                const sourceBlockIndex = sourcePath.blocks.findIndex(
                  (b: Block) => b.id === strokeLine.source_block_id
                );

                if (sourceBlockIndex !== -1) {
                  // Get the next block after source
                  const nextBlock = sourcePath.blocks[sourceBlockIndex + 1];

                  if (nextBlock?.type === 'PATH') {
                    // If next block is PATH, append its child paths to source block
                    const sourceBlock = newPaths
                      .flatMap((p) => p.blocks)
                      .find((b: Block) => b.id === strokeLine.source_block_id);

                    if (sourceBlock && nextBlock.child_paths) {
                      sourceBlock.child_paths = [
                        ...(sourceBlock.child_paths || []),
                        ...nextBlock.child_paths.map((childPath: Path) => ({
                          ...childPath,
                          block_id: sourceBlock.id, // Update block_id to point to source block
                        })),
                      ];
                    }

                    // Remove blocks after source block including the PATH block
                    sourcePath.blocks = sourcePath.blocks.slice(
                      0,
                      sourceBlockIndex + 1
                    );
                  } else {
                    // Original logic for non-PATH blocks
                    const blocksAfterSource = sourcePath.blocks.slice(
                      sourceBlockIndex + 1
                    );
                    if (blocksAfterSource.length > 0) {
                      const continuePath = {
                        id: generateUniqueId(generatedPathIds, true),
                        name: blocksAfterSource[0].title || 'Continue',
                        workflow_id: parseInt(params.workflowId as string),
                        workflow: sourcePath.workflow,
                        blocks: blocksAfterSource,
                        parent_blocks: [
                          {
                            path_id: -1,
                            block_id: strokeLine.source_block_id,
                            created_at: new Date().toISOString(),
                            path: {} as Path,
                            block: {} as Block,
                          },
                        ],
                      };

                      const sourceBlock = newPaths
                        .flatMap((p) => p.blocks)
                        .find(
                          (b: Block) => b.id === strokeLine.source_block_id
                        );

                      if (sourceBlock) {
                        sourceBlock.child_paths = [
                          ...(sourceBlock.child_paths || []),
                          {
                            path_id: continuePath.id,
                            block_id: sourceBlock.id,
                            created_at: new Date().toISOString(),
                            path: continuePath,
                            block: sourceBlock,
                          },
                        ];
                      }

                      newPaths.push(continuePath);
                    }

                    // Remove blocks after source block
                    sourcePath.blocks = sourcePath.blocks.slice(
                      0,
                      sourceBlockIndex + 1
                    );
                  }

                  const targetBlockIndex = targetPath.blocks.findIndex(
                    (b: Block) => b.id === strokeLine.target_block_id
                  );

                  if (targetBlockIndex !== -1) {
                    // Rest of the existing code for creating the target path...
                    const { clonedPath: newPath, sourceBlocks } =
                      clonePathWithMergeBlocks(
                        {
                          id: generateUniqueId(generatedPathIds, true),
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

                    // Add the new path to all source blocks as a child path
                    const sourceBlock = newPaths
                      .flatMap((p) => p.blocks)
                      .find((b: Block) => b.id === strokeLine.source_block_id);
                    if (sourceBlock) {
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

                    // Add the new path to newPaths
                    newPaths.push(newPath);
                  }
                }
              }
            });

            // Update paths store with the new paths
            usePathsStore.getState().setPaths(newPaths);
          }

          // Then process MERGE blocks in each path
          newPaths.forEach((path: Path) => {
            const mergeBlockIndex = path.blocks.findIndex(
              (block: Block) => block.type === 'MERGE' && block.child_paths?.[0]
            );

            if (mergeBlockIndex !== -1) {
              const mergeBlock = path.blocks[mergeBlockIndex];
              const childPath = pathsData.paths.find(
                (p: Path) => p.id === mergeBlock.child_paths[0].path.id
              );

              if (childPath) {
                // Deep clone the blocks from child path
                const clonedBlocks = childPath.blocks
                  .filter((b: Block) => !['BEGIN', 'END'].includes(b.type))
                  .map((block: Block) => ({
                    ...block,
                    path_id: path.id,
                  }));

                // Replace MERGE block with the cloned blocks
                path.blocks = [
                  ...path.blocks.slice(0, mergeBlockIndex),
                  ...clonedBlocks,
                  ...path.blocks.slice(mergeBlockIndex + 1),
                ];
              }
            }
          });

          // Update paths store with the final processed paths
          usePathsStore.getState().setPaths(newPaths);
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

  // Add utility function for generating unique IDs
  const generateUniqueId = (
    existingIds: Set<number>,
    isPath: boolean = false
  ): number => {
    let id: number;
    do {
      id = Math.floor(Math.random() * -1000000);
    } while (existingIds.has(id));

    existingIds.add(id);
    return id;
  };

  // Modify deepCloneBlock function
  const deepCloneBlock = (
    block: Block,
    sourceBlockId: number,
    sourceBlocks: Block[]
  ): Block => {
    const newBlockId = generateUniqueId(generatedBlockIds);
    const newBlock = {
      ...block,
      id: newBlockId,
      path_id: block.path_id, // This will be updated later when adding to path
    };

    if (newBlock.id === sourceBlockId) {
      sourceBlocks.push(newBlock);
    }

    return newBlock;
  };

  // Modify clonePathWithMergeBlocks function
  const clonePathWithMergeBlocks = (
    path: Path,
    allPaths: Path[],
    sourceBlockId: number
  ): { clonedPath: Path; sourceBlocks: Block[] } => {
    const sourceBlocks: Block[] = [];
    const newPathId = generateUniqueId(generatedPathIds, true);

    // Clone the path normally
    const clonedPath = {
      ...path,
      id: newPathId,
      blocks: path.blocks.reduce<Block[]>((acc, block, index, blocks) => {
        const clonedBlock = deepCloneBlock(block, sourceBlockId, sourceBlocks);
        clonedBlock.path_id = newPathId; // Update path_id to match new path

        if (block.type === 'MERGE' && block.child_paths?.[0]) {
          const childPath = allPaths.find(
            (p) => p.id === block.child_paths[0].path.id
          );
          if (childPath) {
            const childBlocks = childPath.blocks
              .filter((b) => b.type !== 'BEGIN' && b.type !== 'END')
              .map((b) => {
                const clonedChildBlock = deepCloneBlock(
                  b,
                  sourceBlockId,
                  sourceBlocks
                );
                clonedChildBlock.path_id = newPathId;
                return clonedChildBlock;
              });
            return [...acc, ...childBlocks];
          }
          return acc;
        }

        return [...acc, clonedBlock];
      }, []),
      parent_blocks: path.parent_blocks.map((pb) => ({
        ...pb,
        path_id: newPathId,
        path: { ...pb.path },
        block: { ...pb.block },
      })),
    };

    return { clonedPath, sourceBlocks };
  };

  // Update the useEffect to only fetch workflow data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const workflowResponse = await fetch(
          `/api/workflows/${params.workflowId}`
        );
        const workflowData = await workflowResponse.json();
        setWorkflowData(workflowData);

        // Create breadcrumbs from workflow data
        const items: BreadcrumbItem[] = [];

        if (workflowData.folder?.parent) {
          items.push({
            label: workflowData.folder.parent.name,
            href: `/dashboard?folder=${workflowData.folder.parent.id}`,
          });
        }

        if (workflowData.folder) {
          items.push({
            label: workflowData.folder.name,
            href: `/dashboard?folder=${workflowData.folder.id}`,
          });
        }

        items.push({ label: workflowData.name });
        setBreadcrumbItems(items);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [params.id, params.workflowId]);

  // Update processCardData to use workflow data
  const processCardData = workflowData
    ? {
        icon:
          workflowData.icon && workflowData.icon.trim() !== ''
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${workflowData.icon}`
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/processflow_logo.png`,
        workflow: {
          name: workflowData.name,
          description: workflowData.description,
        },
        integrations: paths
          .flatMap((path) =>
            path.blocks
              .filter((block) => block.icon && block.icon.includes('/apps/'))
              .map((block) => ({
                name: block
                  .icon!.split('/apps/')[1]
                  .split('.svg')[0]
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' '),
                icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${block.icon}`,
              }))
          )
          .filter(
            (integration, index, self) =>
              index === self.findIndex((i) => i.name === integration.name)
          ),
        ...(workflowData.author && {
          author: {
            name: workflowData.author.full_name,
            avatar:
              workflowData.author.avatar_url &&
              workflowData.author.avatar_url !== null &&
              workflowData.author.avatar_url.trim() !== ''
                ? workflowData.author.avatar_url
                : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/images/default_avatar.png`,
          },
        }),
        lastUpdate:
          paths
            .flatMap((path) => path.blocks)
            .reduce(
              (latest, block) =>
                block.last_modified &&
                (!latest || new Date(block.last_modified) > new Date(latest))
                  ? new Date(block.last_modified).toLocaleDateString('en-GB')
                  : latest,
              ''
            ) || 'No updates',
      }
    : null;

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

  // Add this effect to handle view mode changes
  useEffect(() => {
    // Reset to main path when view mode changes
    const mainPath = paths.find((path) => path.parent_blocks.length === 0);
    if (mainPath) {
      setPathsToDisplay([mainPath]);
      setSelectedOptions([]); // Clear selected options
      setCurrentStep(-1); // Reset current step to initial state
    }
  }, [viewMode, paths]);

  // Update useEffect to initialize copyPaths when paths change
  useEffect(() => {
    setCopyPaths(paths);
  }, [paths]);

  // Modify handleOptionSelect to use copyPaths
  const handleOptionSelect = (optionId: number, blockId: number) => {
    if (
      selectedOptions.some(
        ([pathId, bId]) => pathId === optionId && bId === blockId
      )
    ) {
      console.log('already selected');
      return;
    }

    // Search in copyPaths instead of paths
    const pathToAdd = copyPaths.find((path) => path.id === optionId);
    if (!pathToAdd) {
      console.log('no path to add');
      return;
    }

    // Find the index where this selection will replace an existing one
    const replaceIndex = pathsToDisplay.findIndex((path) =>
      path.blocks.some((block) =>
        selectedOptions.some(
          ([_, selectedBlockId]) =>
            selectedBlockId === block.id && block.id === blockId
        )
      )
    );

    // Remove any existing selection for this blockId
    const existingSelection = selectedOptions.find(
      ([_, bId]) => bId === blockId
    );
    if (existingSelection) {
      const [existingPathId] = existingSelection;
      setSelectedOptions((prev) => prev.filter(([_, bId]) => bId !== blockId));
      setPathsToDisplay((prev) => prev.filter((p) => p.id !== existingPathId));
    }

    // If path already exists in display and selection is from a different block
    if (
      pathsToDisplay.some((p) => p.id === pathToAdd.id) &&
      !selectedOptions.some(([_, bId]) => bId === blockId)
    ) {
      const newPathId = generateUniqueId(generatedPathIds, true);
      const pathCopy = {
        ...pathToAdd,
        id: newPathId,
        blocks: pathToAdd.blocks.map((block) => ({
          ...block,
          id: generateUniqueId(generatedBlockIds),
          path_id: newPathId,
        })),
        parent_blocks: [
          {
            path_id: newPathId,
            block_id: blockId,
            created_at: new Date().toISOString(),
            path: {} as Path,
            block:
              PathsToDisplayBlocks.find((b) => b.id === blockId) ||
              ({} as Block),
          },
        ],
      };

      // Add the new path copy to copyPaths
      setCopyPaths((current) => [...current, pathCopy]);

      // Replace in child_paths of the parent block
      const parentBlock = PathsToDisplayBlocks.find(
        (block) =>
          block.id === blockId &&
          block.child_paths?.some((cp) => cp.path.id === pathToAdd.id)
      );

      if (parentBlock) {
        parentBlock.child_paths = parentBlock.child_paths?.map((cp) =>
          cp.path.id === pathToAdd.id
            ? {
                ...cp,
                path_id: newPathId,
                block_id: blockId,
                path: pathCopy,
              }
            : cp
        );
      }

      // If we found a replace index, remove everything after it
      if (replaceIndex !== -1) {
        setPathsToDisplay((current) => [
          ...current.slice(0, replaceIndex + 1),
          pathCopy,
        ]);
        setSelectedOptions((prev) => {
          const blockIdsToKeep = new Set(
            pathsToDisplay
              .slice(0, replaceIndex + 1)
              .flatMap((p) => p.blocks)
              .map((b) => b.id)
          );
          return [
            ...prev.filter(([_, bId]) => blockIdsToKeep.has(bId)),
            [pathCopy.id, blockId],
          ];
        });
      } else {
        setPathsToDisplay((current) => [...current, pathCopy]);
        setSelectedOptions((prev) => [...prev, [pathCopy.id, blockId]]);
      }
    } else {
      // Add new path and selection, considering replace index
      if (replaceIndex !== -1) {
        setPathsToDisplay((current) => [
          ...current.slice(0, replaceIndex + 1),
          pathToAdd,
        ]);
        setSelectedOptions((prev) => {
          const blockIdsToKeep = new Set(
            pathsToDisplay
              .slice(0, replaceIndex + 1)
              .flatMap((p) => p.blocks)
              .map((b) => b.id)
          );
          return [
            ...prev.filter(([_, bId]) => blockIdsToKeep.has(bId)),
            [optionId, blockId],
          ];
        });
      } else {
        setPathsToDisplay((current) => [...current, pathToAdd]);
        setSelectedOptions((prev) => [...prev, [optionId, blockId]]);
      }
    }
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
  const handleStepClick = (blockId: number) => {
    setCurrentStep(blockId);
    
    // Add to expanded steps if not already expanded
    if (!expandedSteps.includes(blockId)) {
      setExpandedSteps(prev => [...prev, blockId]);
    }
    
    // Find the element with the matching block ID
    const blockElement = document.getElementById(`block-${blockId.toString()}`);
    if (blockElement) {
      setTimeout(() => {
        blockElement.scrollIntoView({
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

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: colors['bg-primary'] }}
    >
      {user && workspace && workflowData && (
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
                    {processCardData && <ProcessCard {...processCardData} />}
                    {pathsToDisplay
                      .map((path) => {
                        // Check if any parent block's path has a selected block

                        return (
                          <div key={path.id} className="space-y-16">
                            {path.blocks
                              .filter(
                                (block) =>
                                  block.type !== 'BEGIN' &&
                                  block.type !== 'LAST'
                              )
                              .map((block, index, filteredBlocks) => {
                                // Check if any block in this path up to current index has been selected
                                return (
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
                                );
                              })
                              .filter(Boolean)}{' '}
                          </div>
                        );
                      })
                      .filter(Boolean)}
                    <VerticalLastStep
                      onCopyLink={handleCopyLink}
                      icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-circle.svg`}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div
                    className="rounded-lg border w-full max-w-3xl"
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
                            {processCardData && (
                              <ProcessCard {...processCardData} />
                            )}
                          </div>
                          {/* Navigation and Progress Bar */}
                          <div className="flex items-center justify-end mt-8">
                            {/* Progress Bar - hidden */}
                            <div className=" items-center hidden">
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
                                selectedOptionIds={selectedOptions}
                                onOptionSelect={(optionId, blockId) =>
                                  handleOptionSelect(optionId, blockId)
                                }
                              />
                            )}
                          </div>

                          {/* Navigation and Progress Bar */}
                          <div className="flex items-center justify-end mt-8">
                            {/* Progress Bar */}
                            <div className=" items-center hidden">
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
