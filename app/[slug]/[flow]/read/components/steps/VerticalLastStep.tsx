import React from 'react';
import { cn } from '@/lib/utils';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import { motion } from 'framer-motion';
import { BaseStepProps } from './BaseStep';

interface VerticalLastStepProps {
  icon: string;
  onRestart: () => void;
  className?: string;
  onCopyLink: () => void;
}

export default function VerticalLastStep({
  onCopyLink,
  icon,
  onRestart,
  className,
}: VerticalLastStepProps) {
  const colors = useColors();

  const slideUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const renderIcon = () => {
    if (!icon) return null;

    return (
      <motion.div
        className="w-12 h-12 rounded-md border shadow-sm flex items-center justify-center will-change-transform"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: colors['bg-primary'],
          borderColor: colors['border-secondary'],
          transform: 'translateZ(0)',
        }}
      >
        <img src={icon} alt="Success" className="w-6 h-6" />
      </motion.div>
    );
  };

  return (
    <div className="relative">
      <motion.div
        className="absolute left-4 -top-16 w-[1px] h-16"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.3 }}
        style={{ backgroundColor: colors['border-secondary'], originY: 0 }}
      />
      <motion.div
        className={cn(
          'max-w-[950px] min-w-[300px] rounded-lg overflow-hidden will-change-transform',
          'border transition-all duration-200 p-6',
          className
        )}
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: colors['bg-primary'],
          borderColor: colors['border-secondary'],
          transform: 'translateZ(0)',
        }}
      >
        <div className="flex flex-col items-start text-left">
          {renderIcon()}
          <motion.h3
            className="text-md font-semibold mb-3 mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ color: colors['text-primary'] }}
          >
            Congratulations! Your process has been completed.
          </motion.h3>
          <motion.p
            className="text-base mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ color: colors['text-secondary'] }}
          >
            Share it with your team members!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <ButtonNormal
              variant="primary"
              size="small"
              onClick={onCopyLink}
              leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-02-white.svg`}
            >
              Copy link
            </ButtonNormal>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          ></motion.div>
        </div>
      </motion.div>
    </div>
  );
}
