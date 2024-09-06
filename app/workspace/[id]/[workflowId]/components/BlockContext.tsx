// BlockContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Block } from '@/types/block';

// Define the context type
interface BlockContextType {
  selectedBlock: Block | null;
  setSelectedBlock: (block: Block | null) => void;
  handleUpdateBlock: ((updatedBlock: Block) => Promise<void>) | null;
  setHandleUpdateBlock: (
    handler: (updatedBlock: Block) => Promise<void>
  ) => void;
  handleDeleteBlock: ((blockId: number) => Promise<void>) | null;
  setHandleDeleteBlock: (handler: (blockId: number) => Promise<void>) => void;
}

// Create the context
const BlockContext = createContext<BlockContextType | undefined>(undefined);

// Provider component
export const BlockProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [handleUpdateBlock, setHandleUpdateBlock] = useState<
    ((updatedBlock: Block) => Promise<void>) | null
  >(null);
  const [handleDeleteBlock, setHandleDeleteBlock] = useState<
    ((blockId: number) => Promise<void>) | null
  >(null);

  return (
    <BlockContext.Provider
      value={{
        selectedBlock,
        setSelectedBlock,
        handleUpdateBlock,
        setHandleUpdateBlock,
        handleDeleteBlock,
        setHandleDeleteBlock,
      }}
    >
      {children}
    </BlockContext.Provider>
  );
};

// Hook to use the context
export const useBlockContext = () => {
  const context = useContext(BlockContext);
  if (!context) {
    throw new Error('useBlockContext must be used within a BlockProvider');
  }
  return context;
};
