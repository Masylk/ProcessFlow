'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './Header';
import { useParams } from 'next/navigation';
import { User } from '@/types/user';
import { createClient } from '@/utils/supabase/client';
import UserSettings from '@/app/dashboard/components/UserSettings';
import HelpCenterModal from '@/app/dashboard/components/HelpCenterModal';
import dynamic from 'next/dynamic';
import Sidebar from './Sidebar';
import { Workspace, Folder } from '@/types/workspace';
import { useColors } from '@/app/theme/hooks';
import ProcessCard from './ProcessCard';
import ViewModeSwitch from './ViewModeSwitch';
import VerticalStep from './steps/VerticalStep';
import HorizontalLastStep from './steps/HorizontalLastStep';
import ButtonNormal from '@/app/components/ButtonNormal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePathsStore } from '../store/pathsStore';
import ProcessCanvas from './ProcessCanvas';
import VerticalLastStep from './steps/VerticalLastStep';
import HorizontalStep from './steps/HorizontalStep';
import { Block, Path, PathParentBlock, WorkflowData } from '../../types';
import { BlockEndType } from '@/types/block';
import { cp } from 'fs';
import VerticalDelay from './steps/VerticalDelay';
import HorizontalDelay from './steps/HorizontalDelay';
import ShareModal from '@/app/components/ShareModal';
import {
  createAndCopyShareLink,
  createShareLink,
} from '../../utils/createLinks';

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

// Modify the type for source block pairs
type SourceBlockPair = {
  originalId: number;
  copies: Block[];
};

interface ExtendedWorkspace extends Workspace {
  logo?: string;
}

interface Workflow {
  id: number;
  name: string;
  icon: string;
  description: string;
  workspace_id: number;
  public_access_id: string;
  folder_id?: number;
  last_opened?: Date;
  team_tags: string[];
  updated_at: string;
  created_at: string;
}

export default function ReadPageClient() {
  const params = useParams();
  const supabase = createClient();
  const colors = useColors();
  const [user, setUser] = useState<User | null>(null);
  const [userSettingsVisible, setUserSettingsVisible] =
    useState<boolean>(false);
  const [helpCenterVisible, setHelpCenterVisible] = useState<boolean>(false);
  const [passwordChanged, setPasswordChanged] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [workspace, setWorkspace] = useState<ExtendedWorkspace | null>(null);
  const [viewMode, setViewMode] = useState<'vertical' | 'carousel'>('vertical');
  const [selectedOptions, setSelectedOptions] = useState<[number, number][]>(
    []
  );
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
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
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isToggling, setIsToggling] = useState(false);
  const [localIsPublic, setLocalIsPublic] = useState(
    workflowData?.is_public || false
  );

  // Add sourceBlockPairs as a component-level variable
  const sourceBlockPairs: SourceBlockPair[] = [];

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

  // Parse the flow parameter to get workflowId
  const [workflowName, workflowId] = (params?.flow as string).split('--pf-');

  // Initialize all steps as expanded when paths are loaded
  useEffect(() => {
    if (pathsToDisplay.length > 0) {
      const allBlockIds = pathsToDisplay.flatMap((path) =>
        path.blocks
          .filter((block) => block.type !== 'BEGIN' && block.type !== 'LAST')
          .map((block) => block.id)
      );
      setExpandedSteps(allBlockIds);
    }
  }, [pathsToDisplay]);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('user', user);
      }
      if (user && user.avatar_url && !user.avatar_signed_url) {
        user.avatar_signed_url = user.avatar_url;
      }
    };

    fetchSignedUrl();
  }, [user]);

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
        const response = await fetch(
          `/api/workspace/${workflowData?.workspace_id}`
        );
        if (!response.ok) throw new Error('Failed to fetch workspace');
        const data = await response.json();
        setWorkspace(data);
      } catch (error) {
        console.error('Error fetching workspace:', error);
      }
    };

    if (workflowData?.workspace_id) {
      fetchWorkspace();
    }
  }, [workflowData?.workspace_id]);

  useEffect(() => {}, [paths]);
  // Fetch paths
  useEffect(() => {
    const fetchPathsAndStrokeLines = async () => {
      if (!workflowId || !workflowData?.workspace_id) return;

      try {
        // Fetch paths
        const response = await fetch(
          `/api/workspace/${workflowData?.workspace_id}/paths?workflow_id=${workflowId}`
        );
        const pathsData = await response.json();

        if (pathsData.paths) {
          const newPaths = [...pathsData.paths];

          // First process stroke lines
          const strokeLinesResponse = await fetch(
            `/api/stroke-lines?workflow_id=${workflowId}`
          );
          if (strokeLinesResponse.ok) {
            const strokeLinesData: StrokeLine[] =
              await strokeLinesResponse.json();
            console.log('strokeLinesData', strokeLinesData);
            setStrokeLines(strokeLinesData);

            strokeLinesData.forEach((strokeLine) => {
              const sourcePath = newPaths.find((p: Path) =>
                p.blocks.some((b) => b.id === strokeLine.source_block_id)
              );
              let targetPath = newPaths.find((p: Path) =>
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

                  let continuePath: Path | undefined;

                  // Original logic for non-PATH blocks
                  const blocksAfterSource = sourcePath.blocks.slice(
                    sourceBlockIndex + 1
                  );
                  if (blocksAfterSource.length > 0) {
                    continuePath = {
                      id: generateUniqueId(generatedPathIds, true),
                      name:
                        blocksAfterSource[0].type === 'MERGE' &&
                        blocksAfterSource[0].child_paths?.[0]
                          ? (() => {
                              const childPathId =
                                blocksAfterSource[0].child_paths[0].path_id;
                              const childPath = pathsData.paths.find(
                                (p: Path) => p.id === childPathId
                              );
                              const childBlock = childPath?.blocks[1];
                              return (
                                childBlock?.title ||
                                (childBlock?.type
                                  ? childBlock.type.charAt(0).toUpperCase() +
                                    childBlock.type.slice(1).toLowerCase() +
                                    ' Block'
                                  : 'Merge Block')
                              );
                            })()
                          : blocksAfterSource[0].title ||
                            (blocksAfterSource[0].type === 'LAST' ||
                            blocksAfterSource[0].type === 'END'
                              ? 'Complete process'
                              : blocksAfterSource[0].type
                                  .charAt(0)
                                  .toUpperCase() +
                                blocksAfterSource[0].type
                                  .slice(1)
                                  .toLowerCase() +
                                ' Block'),
                      workflow_id: parseInt(workflowId as string),
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
                      .find((b: Block) => b.id === strokeLine.source_block_id);

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

                  // If target path is the same as source path and we created a continue path,
                  // update targetPath to be the continue path
                  if (targetPath.id === sourcePath.id && continuePath) {
                    const targetBlockIndex = continuePath.blocks.findIndex(
                      (b: Block) => b.id === strokeLine.target_block_id
                    );
                    if (targetBlockIndex !== -1) {
                      targetPath = continuePath;
                    }
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
                          workflow_id: parseInt(workflowId as string),
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
                        newPaths,
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

            // Apply child_paths from original blocks to their copies
            sourceBlockPairs.forEach((pair) => {
              const originalBlock = newPaths
                .flatMap((p) => p.blocks)
                .find((b) => b.id === pair.originalId);

              if (originalBlock?.child_paths) {
                if (process.env.NODE_ENV !== 'production') {
                  console.log('originalBlock', originalBlock);
                }
                pair.copies.forEach((copyBlock) => {
                  const existingPathIds = new Set(
                    copyBlock.child_paths?.map((cp) => cp.path_id) || []
                  );

                  copyBlock.child_paths = [
                    ...(copyBlock.child_paths || []),
                    ...originalBlock.child_paths
                      .filter(
                        (cp: PathParentBlock) =>
                          !existingPathIds.has(cp.path_id)
                      )
                      .map((cp: PathParentBlock) => ({
                        ...cp,
                        block_id: copyBlock.id,
                        block: copyBlock,
                      })),
                  ];
                });
              }
            });

            // Then process MERGE blocks in each path
            newPaths.forEach((path: Path) => {
              const mergeBlockIndex = path.blocks.findIndex(
                (block: Block) =>
                  block.type === 'MERGE' && block.child_paths?.[0]
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

            // After syncing child paths for blocks with original_id
            newPaths.forEach((path) => {
              path.blocks.forEach((block: Block) => {
                if (block.original_id) {
                  // Find original block
                  const originalBlock = newPaths
                    .flatMap((p) => p.blocks)
                    .find((b) => b.id === block.original_id);

                  if (originalBlock?.child_paths) {
                    // Get existing path IDs
                    const existingPathIds = new Set(
                      block.child_paths?.map((cp) => cp.path_id) || []
                    );

                    // Add missing child paths from original block
                    block.child_paths = [
                      ...(block.child_paths || []),
                      ...originalBlock.child_paths
                        .filter(
                          (cp: PathParentBlock) =>
                            !existingPathIds.has(cp.path_id)
                        )
                        .map((cp: PathParentBlock) => ({
                          ...cp,
                          block_id: block.id,
                          block: block,
                        })),
                    ];
                  }
                }
              });
            });

            // Now remove blocks after any block with child paths
            newPaths.forEach((path) => {
              path.blocks.forEach((block: Block) => {
                if (block.child_paths?.length > 0) {
                  const blockIndex = path.blocks.findIndex(
                    (b: Block) => b.id === block.id
                  );
                  if (blockIndex !== -1) {
                    // Trim path to remove blocks after this one
                    path.blocks = path.blocks.slice(0, blockIndex + 1);
                  }
                }
              });
            });

            // Update paths store with the final processed paths
            usePathsStore.getState().setPaths(newPaths);
          }
        }
      } catch (error) {
        console.error('Error fetching paths and stroke lines:', error);
      }
    };

    fetchPathsAndStrokeLines();
  }, [workflowId, workflowData]);

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

  // Remove sourceBlockPairs parameter since we can access it from component scope
  const deepCloneBlock = (block: Block, sourceBlockId: number): Block => {
    const newBlockId = generateUniqueId(generatedBlockIds);
    const newBlock = {
      ...block,
      id: newBlockId,
      original_id: block.original_id ? block.original_id : block.id,
      path_id: block.path_id,
    };

    if (sourceBlockId < 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('sourceBlockId', sourceBlockId);
      }
    }
    if (block.id === sourceBlockId) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('pushing the copy ofsourceBlockId', sourceBlockId);
      }
      const pair = sourceBlockPairs.find((p) => p.originalId === sourceBlockId);
      if (pair) {
        pair.copies.push(newBlock);
      } else {
        sourceBlockPairs.push({
          originalId: sourceBlockId,
          copies: [newBlock],
        });
      }
    }

    return newBlock;
  };

  // Modify clonePathWithMergeBlocks function
  const clonePathWithMergeBlocks = (
    path: Path,
    allPaths: Path[],
    sourceBlockId: number
  ): { clonedPath: Path; sourceBlocks: Block[] } => {
    const newPathId = generateUniqueId(generatedPathIds, true);

    // Clone the path normally
    const clonedPath = {
      ...path,
      id: newPathId,
      blocks: path.blocks.reduce<Block[]>((acc, block, index, blocks) => {
        const clonedBlock = deepCloneBlock(block, sourceBlockId);
        clonedBlock.path_id = newPathId;

        return [...acc, clonedBlock];
      }, []),
      parent_blocks: path.parent_blocks.map((pb) => ({
        ...pb,
        path_id: newPathId,
        path: { ...pb.path },
        block: { ...pb.block },
      })),
    };

    return {
      clonedPath,
      sourceBlocks: sourceBlockPairs.flatMap((pair) => pair.copies),
    };
  };

  // Update the useEffect to only fetch workflow data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!workflowId) {
          console.error('No workflow ID provided');
          return;
        }

        const workflowResponse = await fetch(`/api/workflow/${workflowId}`);
        const workflowData = await workflowResponse.json();
        setWorkflowData(workflowData);
        setLocalIsPublic(workflowData.is_public);
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

        // Generate share URL when we have workflow data
        if (workflowData) {
          const url = createShareLink(
            workflowData.name,
            workflowData.public_access_id
          );
          if (url) {
            setShareUrl(url);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [workflowId]);

  // Update processCardData to use workflow data
  const processCardData = workflowData
    ? {
        icon:
          workflowData.icon && workflowData.icon.trim() !== ''
            ? workflowData.icon.startsWith('https://cdn.brandfetch.io/')
              ? workflowData.icon
              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${workflowData.icon}`
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logomark-pf.png`,
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
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${workflowData.author.avatar_url}`
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
      return;
    }

    // Search in copyPaths instead of paths
    const pathToAdd = copyPaths.find((path) => path.id === optionId);
    if (!pathToAdd) {
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

    // Always create a copy of the path
    const newPathId = generateUniqueId(generatedPathIds, true);
    const pathCopy = {
      ...pathToAdd,
      id: newPathId,
      blocks: pathToAdd.blocks.map((block) => ({
        ...block,
        original_id: block.original_id ? block.original_id : block.id,
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
            PathsToDisplayBlocks.find((b) => b.id === blockId) || ({} as Block),
        },
      ],
    };

    // Add the new path copy to copyPaths
    setCopyPaths((current) => {
      // If pathToAdd was only in copyPaths (not in original paths), remove it
      if (!paths.some((p) => p.id === pathToAdd.id)) {
        return current.filter((p) => p.id !== pathToAdd.id).concat(pathCopy);
      }
      // Otherwise just add the new copy
      return [...current, pathCopy];
    });

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

  const handleCopyLink = async () => {
    if (!workflowData?.id) return;

    try {
      const url = await createAndCopyShareLink(workflowData.id);
      setShareUrl(url);
      toast.success('Link Copied!', {
        description: 'Share link has been copied to your clipboard.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to Copy', {
        description: 'Could not copy the link to your clipboard.',
        duration: 3000,
      });
    }
  };

  // Function to handle step click from sidebar
  const handleStepClick = (blockId: number) => {
    setCurrentStep(blockId);

    // Add to expanded steps if not already expanded
    if (!expandedSteps.includes(blockId)) {
      setExpandedSteps((prev) => [...prev, blockId]);
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

  const handleRestart = () => {
    setCurrentStep(-1);
    setSelectedOptions([]);
    if (mainPath) {
      setPathsToDisplay([mainPath]);
    }
  };

  const toggleWorkflowAccess = async () => {
    if (isToggling || !workflowData) return;

    try {
      setIsToggling(true);

      // Optimistic update for immediate feedback
      setLocalIsPublic(!localIsPublic);

      const response = await fetch(`/api/workflow/${workflowData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_public: !localIsPublic,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Revert the optimistic update if the server request failed
        setLocalIsPublic(workflowData.is_public);
        throw new Error(
          responseData.message || 'Failed to update workflow access'
        );
      }

      // Update workflowData with the actual server response
      setWorkflowData({
        ...workflowData,
        is_public: responseData.is_public,
      });

      // Use the actual server response to determine the new state
      const newState = responseData.is_public;
      toast.success('Access updated', {
        description: `Workflow is now ${newState ? 'public' : 'private'}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error toggling workflow access:', error);
      toast.error('Failed to update access', {
        description: 'Could not update the workflow access settings.',
        duration: 3000,
      });
    } finally {
      setIsToggling(false);
    }
  };

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: colors['bg-primary'] }}
    >
      {user && workspace && workflowData && (
        <>
          {viewMode === 'vertical' && (
            <Sidebar
              className="w-64"
              workspace={workspace}
              activeStepId={currentStep}
              onStepClick={handleStepClick}
              pathsToDisplay={pathsToDisplay}
            />
          )}
          <div
            className={cn(
              'flex-1',
              viewMode === 'vertical' ? 'ml-64' : 'w-full'
            )}
          >
            <div
              className={cn(
                'fixed right-0 bg-primary z-30',
                viewMode === 'vertical' ? 'left-64' : 'left-0'
              )}
            >
              <Header
                breadcrumbItems={breadcrumbItems}
                user={user}
                onOpenUserSettings={openUserSettings}
                onOpenHelpCenter={openHelpCenter}
                params={
                  params
                    ? {
                        id: workflowData.workspace_id.toString(),
                        workflowId: workflowId.toString() ?? '',
                        slug: workflowData.workspace.name ?? '',
                      }
                    : undefined
                }
                is_public={localIsPublic}
                onToggleAccess={toggleWorkflowAccess}
                shareUrl={shareUrl}
                workflowTitle={workflowName}
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
                  passwordChanged={passwordChanged}
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

            {/* Main content */}
            <ProcessCanvas
              className={cn(
                viewMode === 'vertical'
                  ? 'overflow-y-scroll absolute inset-0 left-64 ml-0'
                  : 'w-full overflow-hidden'
              )}
            >
              {viewMode === 'vertical' ? (
                <div className="p-6">
                  <div className="ml-28 flex flex-col gap-[72px]">
                    {processCardData && <ProcessCard {...processCardData} />}
                    {pathsToDisplay
                      .map((path) => {
                        return (
                          <div key={path.id} className="space-y-16">
                            {path.blocks
                              .filter(
                                (block) =>
                                  block.type !== 'BEGIN' &&
                                  block.type !== 'LAST' &&
                                  block.type !== 'END'
                              )
                              .map((block, index, filteredBlocks) => {
                                return (
                                  <div
                                    key={block.id}
                                    id={`block-${block.id}`}
                                    ref={(el) => {
                                      if (el) stepRefs.current[index] = el;
                                    }}
                                  >
                                    {block.type === 'DELAY' ? (
                                      <VerticalDelay
                                        block={block}
                                        isActive={currentStep === block.id}
                                        isLastStep={
                                          index === filteredBlocks.length - 1
                                        }
                                        selectedOptionIds={selectedOptions}
                                        onOptionSelect={(optionId, blockId) =>
                                          handleOptionSelect(optionId, blockId)
                                        }
                                      />
                                    ) : (
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
                                        copyPaths={copyPaths}
                                        isLastStep={
                                          index === filteredBlocks.length - 1
                                        }
                                      />
                                    )}
                                  </div>
                                );
                              })
                              .filter(Boolean)}
                          </div>
                        );
                      })
                      .filter(Boolean)}
                    <VerticalLastStep
                      onCopyLink={handleCopyLink}
                      onRestart={handleRestart}
                      icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-circle.svg`}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div
                    className="rounded-lg border w-full max-w-3xl mx-6"
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
                            className="flex items-center justify-center"
                          >
                            {processCardData && (
                              <div className="w-full flex justify-center">
                                <ProcessCard {...processCardData} />
                              </div>
                            )}
                          </div>
                          {/* Navigation and Progress Bar */}
                          <div className="flex items-center justify-end mt-8">
                            {/* Progress Bar - hidden */}
                            <div className="items-center hidden">
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
                              {currentStep > -1 && (
                                <ButtonNormal
                                  variant="secondary"
                                  size="small"
                                  onClick={() => handleStepNavigation('prev')}
                                  disabled={currentStep === -1}
                                  leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
                                >
                                  Previous step
                                </ButtonNormal>
                              )}
                              {currentStep < PathsToDisplayBlocks.length && (
                                <ButtonNormal
                                  variant="primary"
                                  size="small"
                                  onClick={() => handleStepNavigation('next')}
                                  disabled={
                                    currentStep ===
                                      PathsToDisplayBlocks.length ||
                                    (currentStep >= 0 &&
                                      currentStep <
                                        PathsToDisplayBlocks.length &&
                                      PathsToDisplayBlocks[currentStep]
                                        ?.child_paths?.length > 0 &&
                                      !selectedOptions.some(
                                        ([_, blockId]) =>
                                          blockId ===
                                          PathsToDisplayBlocks[currentStep].id
                                      ))
                                  }
                                  trailingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-right.svg`}
                                >
                                  {currentStep === -1
                                    ? 'Get Started'
                                    : currentStep ===
                                          PathsToDisplayBlocks.length - 1 &&
                                        (!PathsToDisplayBlocks[currentStep]
                                          ?.child_paths?.length ||
                                          selectedOptions.some(
                                            ([_, blockId]) =>
                                              blockId ===
                                              PathsToDisplayBlocks[currentStep]
                                                .id
                                          ))
                                      ? 'Complete'
                                      : 'Next step'}
                                </ButtonNormal>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-[472px] flex">
                            <div
                              className={cn(
                                'w-full flex flex-col',
                                !PathsToDisplayBlocks[currentStep]?.image &&
                                  (!PathsToDisplayBlocks[currentStep]
                                    ?.child_paths ||
                                    PathsToDisplayBlocks[currentStep]
                                      ?.child_paths.length === 0) &&
                                  'justify-center'
                              )}
                            >
                              {currentStep === PathsToDisplayBlocks.length ? (
                                <HorizontalLastStep
                                  onCopyLink={handleCopyLink}
                                  onRestart={handleRestart}
                                />
                              ) : PathsToDisplayBlocks[currentStep] &&
                                PathsToDisplayBlocks[currentStep].type ===
                                  'DELAY' ? (
                                <HorizontalDelay
                                  block={PathsToDisplayBlocks[currentStep]}
                                  selectedOptionIds={selectedOptions}
                                  onOptionSelect={(optionId, blockId) =>
                                    handleOptionSelect(optionId, blockId)
                                  }
                                />
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
                          </div>

                          {/* Navigation and Progress Bar */}
                          <div className="flex items-center justify-end mt-8">
                            {/* Progress Bar */}
                            <div className="items-center hidden">
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
                              {currentStep > -1 && (
                                <ButtonNormal
                                  variant="secondary"
                                  size="small"
                                  onClick={() => handleStepNavigation('prev')}
                                  disabled={currentStep === -1}
                                  leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
                                >
                                  Previous step
                                </ButtonNormal>
                              )}
                              {currentStep < PathsToDisplayBlocks.length && (
                                <ButtonNormal
                                  variant="primary"
                                  size="small"
                                  onClick={() => handleStepNavigation('next')}
                                  disabled={
                                    currentStep ===
                                      PathsToDisplayBlocks.length ||
                                    (currentStep >= 0 &&
                                      currentStep <
                                        PathsToDisplayBlocks.length &&
                                      PathsToDisplayBlocks[currentStep]
                                        ?.child_paths?.length > 0 &&
                                      !selectedOptions.some(
                                        ([_, blockId]) =>
                                          blockId ===
                                          PathsToDisplayBlocks[currentStep].id
                                      ))
                                  }
                                  trailingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-right.svg`}
                                >
                                  {currentStep === -1
                                    ? 'Get Started'
                                    : currentStep ===
                                          PathsToDisplayBlocks.length - 1 &&
                                        (!PathsToDisplayBlocks[currentStep]
                                          ?.child_paths?.length ||
                                          selectedOptions.some(
                                            ([_, blockId]) =>
                                              blockId ===
                                              PathsToDisplayBlocks[currentStep]
                                                .id
                                          ))
                                      ? 'Complete'
                                      : 'Next step'}
                                </ButtonNormal>
                              )}
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
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itemName={workflowData?.name}
        shareUrl={shareUrl}
        is_public={localIsPublic}
        onToggleAccess={toggleWorkflowAccess}
        workspaceLogo={
          workspace?.logo
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/${workspace.logo}`
            : undefined
        }
      />
    </div>
  );
}
