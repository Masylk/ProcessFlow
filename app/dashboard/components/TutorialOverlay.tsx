'use client';

import { useState, useEffect } from 'react';
import { useTheme, useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import styles from '../styles/tutorial.module.css';

interface TutorialStep {
  title: string;
  description: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  arrowPosition?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Create a new process',
    description: 'Click here to create your first process.',
    position: { top: '80px', right: '20px' },
    arrowPosition: { bottom: '100%', left: '50%' },
  },
  {
    title: 'Organize your folders',
    description:
      'Create folders to organize your processes and keep everything tidy.',
    position: { top: '50px', left: '260px' },
    arrowPosition: { right: '100%', top: '50%' },
  },
  {
    title: 'Switch workspaces',
    description:
      'Easily switch between different workspaces to manage multiple projects.',
    position: { top: '80px', left: '20px' },
    arrowPosition: { right: '80%', bottom: '100%' },
  },
  {
    title: 'Account settings',
    description: 'Set up everything related to your account here.',
    position: { top: '80px', right: '10px' },
    arrowPosition: { bottom: '100%', right: '20px' },
  },
];

interface TutorialOverlayProps {
  onComplete: () => void;
}

export default function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { currentTheme } = useTheme();
  const colors = useColors();

  useEffect(() => {
    // Function to handle clicks on the highlighted elements
    const handleElementClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      handleNext();
    };

    // Update class names to use CSS modules
    document.querySelectorAll(`.${styles.highlight}`).forEach((el) => {
      el.classList.remove(
        styles.highlight,
        styles.highlightFolders,
        styles.highlightWorkspace,
        styles.highlightUser
      );
      el.removeEventListener('click', handleElementClick);
    });

    // Handle different step highlights
    switch (currentStep) {
      case 0:
        const newFlowButton = document.querySelector(
          '[data-testid="new-flow-button"]'
        );
        if (newFlowButton) {
          newFlowButton.classList.add(styles.highlight);
          newFlowButton.addEventListener('click', handleElementClick);
        }
        break;

      case 1:
        const foldersSection = document.querySelector(
          '[data-testid="folders-section"]'
        );
        if (foldersSection) {
          foldersSection.classList.add(
            styles.highlight,
            styles.highlightFolders
          );
          // Add dynamic background color using inline style
          (foldersSection as HTMLElement).style.backgroundColor =
            currentTheme === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : colors['bg-primary'];
        }
        break;

      case 2:
        const workspaceSwitcher = document.querySelector(
          '[data-testid="workspace-switcher"]'
        );
        if (workspaceSwitcher) {
          workspaceSwitcher.classList.add(
            styles.highlight,
            styles.highlightWorkspace
          );
          workspaceSwitcher.addEventListener('click', handleElementClick);
        }
        break;

      case 3:
        const userSettings = document.querySelector(
          '[data-testid="user-settings"]'
        );
        if (userSettings) {
          userSettings.classList.add(styles.highlight, styles.highlightUser);
          userSettings.addEventListener('click', handleElementClick);
        }
        break;
    }

    // Update cleanup function
    return () => {
      document.querySelectorAll(`.${styles.highlight}`).forEach((el) => {
        el.classList.remove(
          styles.highlight,
          styles.highlightFolders,
          styles.highlightWorkspace,
          styles.highlightUser
        );
        el.removeEventListener('click', handleElementClick);
      });
    };
  }, [currentStep, currentTheme, colors]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = tutorialSteps[currentStep];

  return (
    <>
      <div
        className={styles.overlayBlocker}
        style={{
          backgroundColor:
            currentTheme === 'dark'
              ? 'rgba(0, 0, 0, 0.75)'
              : 'rgba(0, 0, 0, 0.5)',
        }}
      />

      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Tutorial popup */}
        <div
          className="absolute p-6 rounded-lg shadow-lg max-w-[300px] pointer-events-auto"
          style={{
            backgroundColor:
              currentTheme === 'dark'
                ? '#1a1f2e' // Darker blue-gray for dark mode
                : colors['bg-primary'],
            color: colors['text-primary'],
            boxShadow:
              currentTheme === 'dark'
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.36)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            ...step.position,
          }}
        >
          {/* Arrow with adjusted color */}
          <div
            className="absolute w-4 h-4 transform rotate-45"
            style={{
              backgroundColor:
                currentTheme === 'dark' ? '#1a1f2e' : colors['bg-primary'],
              ...step.arrowPosition,
            }}
          />

          <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
          <p
            className="text-sm mb-4"
            style={{
              color:
                currentTheme === 'dark'
                  ? 'rgba(255, 255, 255, 0.8)'
                  : colors['text-secondary'],
            }}
          >
            {step.description}
          </p>

          <div className="flex justify-between items-center">
            <span
              className="text-sm"
              style={{
                color:
                  currentTheme === 'dark'
                    ? 'rgba(255, 255, 255, 0.6)'
                    : colors['text-secondary'],
              }}
            >
              {currentStep + 1} of {tutorialSteps.length}
            </span>
            <div className="flex gap-2">
              <ButtonNormal
                variant="secondary"
                size="small"
                onClick={handleSkip}
              >
                Skip
              </ButtonNormal>
              <ButtonNormal variant="primary" size="small" onClick={handleNext}>
                {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              </ButtonNormal>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
