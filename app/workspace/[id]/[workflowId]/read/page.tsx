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
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [showLinkCopiedAlert, setShowLinkCopiedAlert] =
    useState<boolean>(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pathsToDisplay, setPathsToDisplay] = useState<typeof paths>([]);

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

  // Fetch paths
  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const response = await fetch(
          `/api/workspace/${params.id}/paths?workflow_id=${params.workflowId}`
        );
        const paths = await response.json();
        usePathsStore.getState().setPaths(paths.paths);
      } catch (error) {
        console.error('Error fetching paths:', error);
      }
    };

    fetchPaths();
  }, [params.id, params.workflowId]);

  // Update this useEffect to set initial pathsToDisplay
  useEffect(() => {
    if (mainPath) {
      setPathsToDisplay([mainPath]);
    }
  }, [mainPath]);

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

  const handleOptionSelect = (optionId: number, isMerge: boolean = false) => {
    // Update selectedOptions first
    // if (!isMerge) {
    setSelectedOptions((currentSelected) => {
      const newSelected = [...currentSelected];

      // Find if there's a path with any matching parent block
      const pathToAdd = paths.find((path) => path.id === optionId);
      if (!pathToAdd) return currentSelected;

      const parentBlockIds = pathToAdd.parent_blocks.map((pb) => pb.block_id);
      const sameParentIndex = newSelected.findIndex((selectedId) => {
        const selectedPath = paths.find((p) => p.id === selectedId);
        return selectedPath?.parent_blocks.some((pb) =>
          parentBlockIds.includes(pb.block_id)
        );
      });

      if (sameParentIndex !== -1) {
        // Remove this option and all following options
        newSelected.splice(sameParentIndex);
      }

      // Add the new option
      newSelected.push(optionId);
      return newSelected;
    });
    // }

    // Then find and add the path
    const currentPathIndex = pathsToDisplay.findIndex((path) =>
      path.blocks.some((block) =>
        block.child_paths?.some((cp) => cp.path.id === optionId)
      )
    );
    if (currentPathIndex !== -1) {
      addPathToDisplay(optionId, currentPathIndex + 1);
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

    if (pathsToDisplay.find((p) => p.id === pathId)) return;
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
                                onOptionSelect={handleOptionSelect}
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
