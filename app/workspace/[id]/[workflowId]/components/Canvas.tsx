import React, { useState, useEffect, useRef } from 'react';
import { Block } from '@/types/block';
import { Path as PathType } from '@/types/path';
import Path from './Path';
import BlockDetailsSidebar from './BlockDetailsSidebar';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface CanvasProps {
  initialPath: PathType;
  workspaceId: string;
  workflowId: string;
}

export default function Canvas({
  initialPath,
  workspaceId,
  workflowId,
}: CanvasProps) {
  const [path, setPath] = useState<PathType | null>(initialPath);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [handleUpdateBlock, setHandleUpdateBlock] = useState<
    ((updatedBlock: Block) => Promise<void>) | null
  >(null);
  const [handleDeleteBlock, setHandleDeleteBlock] = useState<
    ((blockId: number) => Promise<void>) | null
  >(null);
  const [isAddBlockFormOpen, setIsAddBlockFormOpen] = useState(false);
  const [disableZoom, setDisableZoom] = useState(false); // State for zoom enabling/disabling
  const zoomRef = useRef<any>(null); // Ref to control zoom

  useEffect(() => {
    setPath(initialPath);
  }, [initialPath]);

  const handleBlockClick = (
    block: Block,
    updateBlockFn: (updatedBlock: Block) => Promise<void>,
    deleteBlockFn: (blockId: number) => Promise<void>
  ) => {
    setSelectedBlock(block);
    setHandleUpdateBlock(() => updateBlockFn);
    setHandleDeleteBlock(() => deleteBlockFn);
  };

  const handleCloseSidebar = () => {
    setSelectedBlock(null);
  };

  const handleDisableZoom = (disable: boolean) => {
    setDisableZoom(disable);
  };

  // Updated handleAddBlock function to match the expected type
  const handleAddBlock = (
    pathId: number,
    position: number,
    addBlockFn: (
      blockData: any,
      pathId: number,
      position: number
    ) => Promise<void>
  ) => {
    // You can open a form or directly handle block data here
    const blockData = {
      // Example block data to be passed
      name: 'New Block',
      type: 'example',
    };

    // Use the provided addBlockFn to handle the actual block addition
    addBlockFn(blockData, pathId, position).then(() => {
      console.log(`Block added at path ${pathId} at position ${position}`);
    });
  };

  return (
    <div className="relative h-screen w-screen flex flex-col">
      {/* Canvas Area with Zoom and Pan */}
      <div className="flex-1 w-full h-full overflow-hidden">
        {path ? (
          <TransformWrapper
            ref={zoomRef} // Attach ref to TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            wheel={{ step: 0.1 }}
            alignmentAnimation={{ disabled: true }} // Disable automatic centering
            limitToBounds={false} // Allow free movement beyond bounds
            disabled={disableZoom} // Disable zoom when dragging blocks
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Zoom Controls */}
                <div className="controls absolute top-4 right-4 z-20">
                  <button
                    onClick={() => zoomIn()}
                    className="px-4 py-2 mx-2 bg-gray-200 rounded"
                  >
                    Zoom In
                  </button>
                  <button
                    onClick={() => zoomOut()}
                    className="px-4 py-2 mx-2 bg-gray-200 rounded"
                  >
                    Zoom Out
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    className="px-4 py-2 mx-2 bg-gray-200 rounded"
                  >
                    Reset Zoom
                  </button>
                </div>

                <TransformComponent
                  wrapperStyle={{
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden', // Ensure free movement
                  }}
                  contentStyle={{
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Path
                    pathId={path.id}
                    workspaceId={parseInt(workspaceId)}
                    workflowId={parseInt(workflowId)}
                    onBlockClick={handleBlockClick}
                    closeDetailSidebar={handleCloseSidebar}
                    disableZoom={handleDisableZoom} // Pass disableZoom handler to Path
                    handleAddBlock={handleAddBlock} // Pass the new handleAddBlock function to Path
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      {/* Sidebar for Block Details */}
      {selectedBlock && handleUpdateBlock && handleDeleteBlock && (
        <BlockDetailsSidebar
          block={selectedBlock}
          onClose={handleCloseSidebar}
          onUpdate={async (updatedBlock) => {
            await handleUpdateBlock(updatedBlock);
            handleCloseSidebar();
          }}
          onDelete={async (blockId) => {
            await handleDeleteBlock(blockId);
            handleCloseSidebar();
          }}
        />
      )}
    </div>
  );
}
