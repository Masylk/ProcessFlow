'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useColors } from '@/app/theme/hooks';
import ProcessCard from '../components/ProcessCard';
import ButtonNormal from '@/app/components/ButtonNormal';
import { cn } from '@/lib/utils';
import ProcessCanvas from '../components/ProcessCanvas';
import HorizontalLastStep from '../components/steps/HorizontalLastStep';
import HorizontalStep from '../components/steps/HorizontalStep';
import HorizontalDelay from '../components/steps/HorizontalDelay';
import { usePathsStore } from '../store/pathsStore';
import { Block, Path } from '../../types';

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

// Modify the type for source block pairs
type SourceBlockPair = {
  originalId: number;
  copies: Block[];
};

// Add after imports, before component
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

export default function SharePage() {
  const params = useParams();
  const colors = useColors();
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [selectedOptions, setSelectedOptions] = useState<[number, number][]>(
    []
  );
  const [pathsToDisplay, setPathsToDisplay] = useState<typeof paths>([]);
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [showLinkCopiedAlert, setShowLinkCopiedAlert] =
    useState<boolean>(false);
  const [generatedPathIds] = useState<Set<number>>(new Set());
  const [generatedBlockIds] = useState<Set<number>>(new Set());
  const [copyPaths, setCopyPaths] = useState<Path[]>([]);

  // Add sourceBlockPairs as a component-level variable
  const sourceBlockPairs: SourceBlockPair[] = [];

  const paths = usePathsStore((state) => state.paths);
  const mainPath = useMemo(
    () => paths.find((path) => path.parent_blocks.length === 0),
    [paths]
  );

  const PathsToDisplayBlocks = useMemo(() => {
    return pathsToDisplay.flatMap((path) => {
      return path.blocks.filter(
        (block) => !['BEGIN', 'LAST', 'MERGE', 'END'].includes(block.type)
      );
    });
  }, [pathsToDisplay, selectedOptions, paths]);

  // Fetch paths
  useEffect(() => {
    const fetchPathsAndStrokeLines = async () => {
      try {
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
            const strokeLinesData = await strokeLinesResponse.json();

            strokeLinesData.forEach((strokeLine: any) => {
              const sourcePath = newPaths.find((p: Path) =>
                p.blocks.some((b) => b.id === strokeLine.source_block_id)
              );
              let targetPath = newPaths.find((p: Path) =>
                p.blocks.some((b) => b.id === strokeLine.target_block_id)
              );

              if (sourcePath && targetPath) {
                const sourceBlockIndex = sourcePath.blocks.findIndex(
                  (b: Block) => b.id === strokeLine.source_block_id
                );

                if (sourceBlockIndex !== -1) {
                  // Get the next block after source
                  const nextBlock = sourcePath.blocks[sourceBlockIndex + 1];

                  let continuePath: Path | undefined;

                  if (nextBlock?.type === 'PATH') {
                    // If next block is PATH, append its child paths to source block
                    const sourceBlock = newPaths
                      .flatMap((p) => p.blocks)
                      .find((b: Block) => b.id === strokeLine.source_block_id);

                    if (sourceBlock && nextBlock.child_paths) {
                      sourceBlock.child_paths = [
                        ...(sourceBlock.child_paths || []),
                        ...nextBlock.child_paths.map((childPath: any) => ({
                          ...childPath,
                          block_id: sourceBlock.id,
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
                    //   .filter(
                    //     (b: Block) => b.type !== 'END' && b.type !== 'LAST'
                    //   );

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
                }
              }

              const targetBlockIndex = targetPath.blocks.findIndex(
                (b: Block) => b.id === strokeLine.target_block_id
              );

              if (targetBlockIndex !== -1) {
                const newPath = {
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
                };

                const sourceBlock = newPaths
                  .flatMap((p) => p.blocks)
                  .find((b) => b.id === strokeLine.source_block_id);

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

                newPaths.push(newPath);
              }
            });
          }

          // Then process MERGE blocks
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
                const clonedBlocks = childPath.blocks
                  .filter((b: Block) => !['BEGIN', 'END'].includes(b.type))
                  .map((block: Block) => ({
                    ...block,
                    path_id: path.id,
                  }));

                path.blocks = [
                  ...path.blocks.slice(0, mergeBlockIndex),
                  ...clonedBlocks,
                  ...path.blocks.slice(mergeBlockIndex + 1),
                ];
              }
            }
          });

          usePathsStore.getState().setPaths(newPaths);
        }
      } catch (error) {
        console.error('Error fetching paths:', error);
      }
    };

    fetchPathsAndStrokeLines();
  }, [params.id, params.workflowId]);

  // Update initial pathsToDisplay
  useEffect(() => {
    if (mainPath) {
      setPathsToDisplay([mainPath]);
    }
  }, [mainPath]);

  // Fetch workflow data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const workflowResponse = await fetch(
          `/api/workflows/${params.workflowId}`
        );
        const workflowData = await workflowResponse.json();
        setWorkflowData(workflowData);
      } catch (error) {
        console.error('Error fetching workflow data:', error);
      }
    };

    fetchData();
  }, [params.workflowId]);

  // Initialize copyPaths when paths change
  useEffect(() => {
    setCopyPaths(paths);
  }, [paths]);

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowLinkCopiedAlert(true);
    setTimeout(() => {
      setShowLinkCopiedAlert(false);
    }, 5000);
  };

  const handleRestart = () => {
    setCurrentStep(-1);
    setSelectedOptions([]);
    if (mainPath) {
      setPathsToDisplay([mainPath]);
    }
  };

  // Process card data preparation
  const processCardData = workflowData
    ? {
        icon:
          workflowData.icon ||
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/processflow_logo.png`,
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
        author: workflowData.author && {
          name: workflowData.author.full_name,
          avatar:
            workflowData.author.avatar_url ||
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/images/default_avatar.png`,
        },
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

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors['bg-primary'] }}
    >
      <ProcessCanvas className="w-full overflow-hidden">
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
                  <div className="flex items-center justify-end mt-8">
                    <ButtonNormal
                      variant="primary"
                      size="small"
                      onClick={() => handleStepNavigation('next')}
                      trailingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-right.svg`}
                    >
                      Get Started
                    </ButtonNormal>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-[472px] flex">
                    <div className="w-full flex flex-col">
                      {currentStep === PathsToDisplayBlocks.length ? (
                        <HorizontalLastStep
                          onCopyLink={handleCopyLink}
                          onRestart={handleRestart}
                        />
                      ) : PathsToDisplayBlocks[currentStep]?.type ===
                        'DELAY' ? (
                        <HorizontalDelay
                          block={PathsToDisplayBlocks[currentStep]}
                        />
                      ) : (
                        <HorizontalStep
                          block={PathsToDisplayBlocks[currentStep]}
                          selectedOptionIds={selectedOptions}
                          onOptionSelect={handleOptionSelect}
                          isFirstStep={currentStep === 0}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end mt-8">
                    <div className="flex items-center gap-2">
                      <ButtonNormal
                        variant="secondary"
                        size="small"
                        onClick={() => handleStepNavigation('prev')}
                        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
                      >
                        Previous step
                      </ButtonNormal>
                      <ButtonNormal
                        variant="primary"
                        size="small"
                        onClick={() => handleStepNavigation('next')}
                        disabled={
                          currentStep === PathsToDisplayBlocks.length ||
                          (PathsToDisplayBlocks[currentStep]?.child_paths
                            ?.length > 0 &&
                            !selectedOptions.some(
                              ([_, blockId]) =>
                                blockId === PathsToDisplayBlocks[currentStep].id
                            ))
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
      </ProcessCanvas>
    </div>
  );
}
