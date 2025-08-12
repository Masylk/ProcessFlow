import { motion } from 'framer-motion';
import React from 'react';

interface MotionStepProps {
  children: React.ReactNode;
}

const MotionStep: React.FC<MotionStepProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default MotionStep; 