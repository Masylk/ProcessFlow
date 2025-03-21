'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import Step from './components/Step';
import ProcessCanvas from './components/ProcessCanvas';
import ButtonNormal from '@/app/components/ButtonNormal';
import { cn } from '@/lib/utils';
import Alert from '@/app/components/Alert';
import { usePathsStore } from '../store/pathsStore';

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
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [showLinkCopiedAlert, setShowLinkCopiedAlert] =
    useState<boolean>(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  const steps = [
    // {
    //   number: 1,
    //   label: 'Read the introduction...',
    //   description: "Add people to your team on Jazzy. Then you should be able to add people to any of your projects and to give them access to your team's resources.",
    //   icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/step-icons/apps/slack.svg`,
    //   isActive: true
    // },
    {
      number: 2,
      label: 'Send your presentation...',
      description:
        'Follow the steps to send your presentation to the team using Jazzy. Make sure to include all the necessary information and attachments.',
      icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/step-icons/apps/gmail.svg`,
    },
    {
      number: 3,
      label: 'Get through all the docs..',
      description:
        'Review all the documentation provided in Notion. This includes company policies, procedures, and guidelines that you need to be familiar with.',
      icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/step-icons/apps/notion.svg`,
    },
    {
      number: 4,
      label: 'Access the Linear',
      description:
        'Set up your Linear account to access and manage your tasks. This will be your main tool for project management and task tracking.',
      icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/step-icons/apps/linear.svg`,
      isConditional: true,
      options: [
        {
          id: 'option1',
          title: 'I already have a Linear account',
          description:
            'If you already have a Linear account, you can connect it to your workspace.',
        },
        {
          id: 'option2',
          title: 'I need to create a Linear account',
          description:
            'Create a new Linear account to start managing your tasks and projects.',
        },
      ],
    },
  ];

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
    steps: steps.length,
    duration: '15 minutes',
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  // Add this function to handle step navigation
  const handleStepNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (currentStep === steps.length - 1) {
        // Show completion view
        setCurrentStep(steps.length);
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      }
    } else {
      if (currentStep === steps.length) {
        // Go back to last step from completion view
        setCurrentStep(steps.length - 1);
      } else {
        setCurrentStep((prev) => Math.max(prev - 1, -1));
      }
    }
  };

  // Add this function to calculate progress
  const calculateProgress = () => {
    return ((currentStep + 1) / (steps.length + 1)) * 100;
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
                    <div className="space-y-16">
                      {steps.map((step, index) => (
                        <div
                          key={step.number}
                          ref={(el) => {
                            if (el) stepRefs.current[index] = el;
                          }}
                        >
                          <Step
                            number={step.number}
                            title={step.label}
                            description={step.description}
                            icon={step.icon}
                            isActive={currentStep === index}
                            defaultExpanded={expandedSteps.includes(index)}
                            onToggle={(isExpanded) => {
                              setExpandedSteps((prev) =>
                                isExpanded
                                  ? [...prev, index]
                                  : prev.filter((i) => i !== index)
                              );
                              if (isExpanded) {
                                setCurrentStep(index);
                                // Add scrolling behavior
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
                              }
                            }}
                            variant={
                              step.isConditional ? 'conditional' : 'default'
                            }
                            options={step.options || []}
                            selectedOptionId={selectedOption}
                            onOptionSelect={handleOptionSelect}
                          >
                            <div className="space-y-4">
                              <div
                                className="rounded-lg overflow-hidden border"
                                style={{
                                  borderColor: colors['border-secondary'],
                                }}
                              >
                                <img
                                  src="https://cdn.prod.website-files.com/674340930391b16981ae722e/674368682422d095ac5beb80_Use%20Case.png"
                                  alt="Step visualization"
                                  className="w-full h-auto"
                                />
                              </div>
                            </div>
                          </Step>
                        </div>
                      ))}
                      <Step
                        variant="last"
                        number={steps.length + 1}
                        title="Complete"
                        icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-circle.svg`}
                        onCopyLink={handleCopyLink}
                      />
                    </div>
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
                                {steps.map((_, index) => (
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
                                    {index < steps.length - 1 && (
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
                                disabled={currentStep === steps.length - 1}
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
                            {currentStep === steps.length ? (
                              // Completion View
                              <div className="flex flex-col items-center justify-center h-full">
                                <div
                                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border"
                                  style={{
                                    backgroundColor: colors['bg-secondary'],
                                    borderColor: colors['border-secondary'],
                                  }}
                                >
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-circle.svg`}
                                    alt="Success"
                                    className="w-6 h-6"
                                  />
                                </div>
                                <h3
                                  className="text-xl font-medium mb-3"
                                  style={{ color: colors['text-primary'] }}
                                >
                                  Congratulations! You've completed the process.
                                </h3>
                                <p
                                  className="text-base mb-6 text-center"
                                  style={{ color: colors['text-secondary'] }}
                                >
                                  Share it with your team members!
                                </p>
                                <ButtonNormal
                                  variant="primary"
                                  size="small"
                                  onClick={handleCopyLink}
                                  leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-02-white.svg`}
                                >
                                  Copy link
                                </ButtonNormal>
                              </div>
                            ) : (
                              <>
                                {/* Step Header */}
                                <div className="flex items-center gap-4 mb-4">
                                  {/* App Icon */}
                                  <div
                                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border"
                                    style={{
                                      backgroundColor: colors['bg-secondary'],
                                      borderColor: colors['border-secondary'],
                                    }}
                                  >
                                    <img
                                      src={steps[currentStep].icon}
                                      alt=""
                                      className="w-6 h-6"
                                    />
                                  </div>
                                  {/* Step Title */}
                                  <div className="flex-1">
                                    <div
                                      className="flex items-center text-xl font-medium"
                                      style={{ color: colors['text-primary'] }}
                                    >
                                      <span className="mr-2">
                                        {steps[currentStep].number}.
                                      </span>
                                      <span>{steps[currentStep].label}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Description */}
                                <p
                                  className="text-base mb-6"
                                  style={{ color: colors['text-secondary'] }}
                                >
                                  {steps[currentStep].description}
                                </p>

                                {/* Step Content */}
                                <div className="rounded-lg overflow-hidden flex-1 mb-8">
                                  <img
                                    src="https://cdn.prod.website-files.com/674340930391b16981ae722e/674368682422d095ac5beb80_Use%20Case.png"
                                    alt="Step visualization"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </>
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
                                {steps.map((_, index) => (
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
                                    {index < steps.length - 1 && (
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
                                disabled={currentStep === steps.length}
                                trailingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-right.svg`}
                              >
                                {currentStep === steps.length - 1
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
