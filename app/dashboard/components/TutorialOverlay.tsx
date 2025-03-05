'use client';

import { useState } from 'react';
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
    position: { top: "70px", right: "20px" },
    arrowPosition: { bottom: "100%", left: "50%" }
  },
  {
    title: "Organize your folders",
    description: "Create folders to organize your processes and keep everything tidy.",
    position: { top: "50px", left: "250px" },
    arrowPosition: { right: "100%", top: "50%" }
  },
  {
    title: "Switch workspaces",
    description: "Easily switch between different workspaces to manage multiple projects.",
    position: { top: "70px", left: "20px" },
    arrowPosition: { right: "80%", bottom: "100%" }
  },
  {
    title: "Account settings",
    description: "Set up everything related to your account here.",
    position: { top: "70px", right: "10px" },
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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      {/* Tutorial popup */}
      <div
        className="absolute p-6 rounded-lg shadow-lg max-w-[300px]"
        style={{
          backgroundColor: colors['bg-primary'],
          color: colors['text-primary'],
          ...step.position
        }}
      >
        {/* Arrow */}
        <div
          className="absolute w-4 h-4 transform rotate-45"
          style={{
            backgroundColor: colors['bg-primary'],
            ...step.arrowPosition
          }}
        />

        <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
        <p className="text-sm mb-4" style={{ color: colors['text-secondary'] }}>
          {step.description}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: colors['text-secondary'] }}>
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
  );
} 