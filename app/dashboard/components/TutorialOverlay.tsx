'use client';

import { useState, useEffect } from 'react';
import { useTheme, useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';

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
    title: "Create a new process",
    description: "Click here to create your first process.",
    position: { top: "80px", right: "20px" },
    arrowPosition: { bottom: "100%", left: "50%" }
  },
  {
    title: "Organize your folders",
    description: "Create folders to organize your processes and keep everything tidy.",
    position: { top: "50px", left: "260px" },
    arrowPosition: { right: "100%", top: "50%" }
  },
  {
    title: "Switch workspaces",
    description: "Easily switch between different workspaces to manage multiple projects.",
    position: { top: "80px", left: "20px" },
    arrowPosition: { right: "80%", bottom: "100%" }
  },
  {
    title: "Account settings",
    description: "Set up everything related to your account here.",
    position: { top: "80px", right: "10px" },
    arrowPosition: { bottom: "100%", right: "20px" }
  }
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

    // Remove any existing highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove(
        'tutorial-highlight', 
        'tutorial-highlight-folders', 
        'tutorial-highlight-workspace',
        'tutorial-highlight-user'
      );
      el.removeEventListener('click', handleElementClick);
    });

    // Handle different step highlights
    switch (currentStep) {
      case 0:
        // First step - highlight New Flow button
        const newFlowButton = document.querySelector('[data-testid="new-flow-button"]');
        if (newFlowButton) {
          newFlowButton.classList.add('tutorial-highlight');
          newFlowButton.addEventListener('click', handleElementClick);
        }
        break;
      
      case 1:
        // Second step - highlight Folders section
        const foldersSection = document.querySelector('[data-testid="folders-section"]');
        if (foldersSection) {
          foldersSection.classList.add('tutorial-highlight', 'tutorial-highlight-folders');
          foldersSection.addEventListener('click', handleElementClick);
        }
        break;
      
      case 2:
        // Third step - highlight Workspace switcher
        const workspaceSwitcher = document.querySelector('[data-testid="workspace-switcher"]');
        if (workspaceSwitcher) {
          workspaceSwitcher.classList.add('tutorial-highlight', 'tutorial-highlight-workspace');
          workspaceSwitcher.addEventListener('click', handleElementClick);
        }
        break;

      case 3:
        // Fourth step - highlight User settings
        const userSettings = document.querySelector('[data-testid="user-settings"]');
        if (userSettings) {
          userSettings.classList.add('tutorial-highlight', 'tutorial-highlight-user');
          userSettings.addEventListener('click', handleElementClick);
        }
        break;
    }

    // Cleanup function
    return () => {
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove(
          'tutorial-highlight', 
          'tutorial-highlight-folders', 
          'tutorial-highlight-workspace',
          'tutorial-highlight-user'
        );
        el.removeEventListener('click', handleElementClick);
      });
    };
  }, [currentStep]);

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
      <style jsx global>{`
        @keyframes tutorialPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.6);  /* Increased opacity for better visibility */
          }
          70% {
            box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
          }
        }

        .tutorial-highlight {
          animation: tutorialPulse 2s infinite;
          position: relative;
          z-index: 51 !important;
          cursor: pointer !important;
        }

        .tutorial-highlight::after {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border-radius: 8px;
          border: 2px solid ${colors['accent-primary']};
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);  /* Added glow effect */
          pointer-events: none;
        }

        /* Special styling for the folders section highlight */
        .tutorial-highlight-folders {
          background-color: ${currentTheme === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : colors['bg-primary']} !important;
        }

        .tutorial-highlight-folders::after {
          border-radius: 4px;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
        }

        /* Special styling for the workspace switcher highlight */
        .tutorial-highlight-workspace {
          background-color: ${currentTheme === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : colors['bg-primary']} !important;
        }

        .tutorial-highlight-workspace::after {
          border-radius: 4px;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        /* Special styling for the user settings highlight */
        .tutorial-highlight-user::after {
          border-radius: 50%;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
        }

        .tutorial-overlay-blocker {
          position: fixed;
          inset: 0;
          z-index: 49;
          cursor: not-allowed;
          background-color: ${currentTheme === 'dark' 
            ? 'rgba(0, 0, 0, 0.75)' 
            : 'rgba(0, 0, 0, 0.5)'};
        }
      `}</style>

      <div className="tutorial-overlay-blocker" />

      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Tutorial popup */}
        <div
          className="absolute p-6 rounded-lg shadow-lg max-w-[300px] pointer-events-auto"
          style={{
            backgroundColor: currentTheme === 'dark' 
              ? '#1a1f2e'  // Darker blue-gray for dark mode
              : colors['bg-primary'],
            color: colors['text-primary'],
            boxShadow: currentTheme === 'dark'
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.36)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            ...step.position
          }}
        >
          {/* Arrow with adjusted color */}
          <div
            className="absolute w-4 h-4 transform rotate-45"
            style={{
              backgroundColor: currentTheme === 'dark' 
                ? '#1a1f2e'
                : colors['bg-primary'],
              ...step.arrowPosition
            }}
          />

          <h3 className="text-lg font-semibold mb-2">
            {step.title}
          </h3>
          <p 
            className="text-sm mb-4" 
            style={{ 
              color: currentTheme === 'dark' 
                ? 'rgba(255, 255, 255, 0.8)'
                : colors['text-secondary']
            }}
          >
            {step.description}
          </p>

          <div className="flex justify-between items-center">
            <span 
              className="text-sm" 
              style={{ 
                color: currentTheme === 'dark' 
                  ? 'rgba(255, 255, 255, 0.6)'
                  : colors['text-secondary']
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
              <ButtonNormal
                variant="primary"
                size="small"
                onClick={handleNext}
              >
                {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              </ButtonNormal>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 