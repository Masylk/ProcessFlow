import { Block, Path } from '../../../types';

export interface BaseStepProps {
  block: Block;
  isActive?: boolean;
  className?: string;
  defaultExpanded?: boolean;
  onToggle?: (isExpanded: boolean) => void;
  children?: React.ReactNode;
  stepRef?: React.RefObject<HTMLDivElement>;
  selectedOptionIds?: [number, number][];
  onOptionSelect?: (optionId: number, blockId: number, isMerge?: boolean) => void;
  isLastStep?: boolean;
  copyPaths?: Path[];
  variant?: 'default' | 'last';
  icon?: string | React.ReactNode;
} 