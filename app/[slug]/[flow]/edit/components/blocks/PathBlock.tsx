import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../../../types';
import UpdatePathModal from '../modals/UpdatePathModal';
import { createChildPaths } from '../../utils/createChildPaths';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
import { useColors } from '@/app/theme/hooks';
import { BasicBlock } from './BasicBlock';

function PathBlock(props: NodeProps & { data: NodeData }) {
  const { id, data, selected } = props;
  const [showModal, setShowModal] = useState(false);
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const colors = useColors();

  // Find the path block to get the count of existing child paths
  const pathBlock = data.path?.blocks.find(
    (block: { id: number }) => block.id === parseInt(id.replace('block-', ''))
  );

  const existingPathsCount = pathBlock?.child_paths?.length || 0;
  // Get the names and IDs of existing child paths
  const existingPaths: { id: number; name: string }[] =
    pathBlock?.child_paths?.map((cp) => ({
      id: cp.path.id,
      name: cp.path.name,
    })) || [];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  /**
   * Handles updating, adding, and removing child paths.
   * @param modalData Object containing condition name, description, icon, and path updates
   */
  const handleCreateChildPaths = async (modalData: {
    conditionName: string;
    conditionDescription: string;
    icon?: string;
    pathsToUpdate: { index: number; name: string }[];
    pathsToAdd: string[];
    pathsToRemove: { index: number; name: string }[];
  }) => {
    try {
      setShowModal(false);

      if (!data.path?.workflow_id || !data.path) {
        throw new Error('Path data is missing');
      }

      // Add new paths
      if (modalData.pathsToAdd.length > 0) {
        await createChildPaths(modalData.pathsToAdd, data.path.workflow_id, data.path);
      }

      // Delete removed paths
      if (modalData.pathsToRemove.length > 0) {
        const pathsToRemoveIds = modalData.pathsToRemove.map(
          (path) => existingPaths[path.index].id
        );
        await Promise.all(
          pathsToRemoveIds.map(async (id) => {
            await fetch(`/api/paths/${id}`, {
              method: 'DELETE',
            });
          })
        );
      }

      // Update existing paths
      if (modalData.pathsToUpdate.length > 0) {
        const pathsToUpdateIdsandname = modalData.pathsToUpdate.map((path) => ({
          id: existingPaths[path.index].id,
          name: path.name,
        }));
        await Promise.all(
          pathsToUpdateIdsandname.map(async (path) => {
            await fetch(`/api/paths/${path.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: path.name }),
            });
          })
        );
      }

      // Update the block with condition data
      await fetch(`/api/blocks/${pathBlock?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          condition: {
            name: modalData.conditionName,
            title: modalData.conditionName,
            description: modalData.conditionDescription,
          },
        }),
      });

      // Just fetch the updated paths to refresh the UI
      const pathsResponse = await fetch(
        `/api/workspace/${data.path.workflow_id}/paths?workflow_id=${data.path.workflow_id}`
      );
      if (pathsResponse.ok) {
        const pathsData = await pathsResponse.json();
        data.onPathsUpdate?.(pathsData.paths);
      }
    } catch (error) {
      console.error('Error managing child paths:', error);
    }
  };

  return (
    <BasicBlock {...props}>
      <div
        className={`transition-opacity duration-300 ${
          isConnectMode || isEditMode ? 'opacity-40' : 'hover:opacity-80'
        }`}
      >
        <div
          className="transition-all duration-300 relative cursor-pointer rounded-[13.7px] bg-white shadow-sm overflow-hidden"
          style={{
            width: '383px',
            boxShadow: '0px 0.86px 1.72px 0px rgba(16, 24, 40, 0.05), inset 0px -1.72px 0px 0px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 0.86px rgba(16, 24, 40, 0.18)',
          }}
          onClick={handleClick}
        >
          <Handle
            type="target"
            position={Position.Top}
            id="top"
            style={{
              width: 6,
              height: 6,
              opacity: 0,
              background: colors['utility-brand-500'],
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />
          
          {/* Header - Blue background */}
          <div className="bg-[#4761C4] p-[17px] flex items-center justify-between">
            <div className="flex items-center gap-[13.7px]">
              <div className="flex items-center">
                <div 
                  className="w-[46px] h-[46px] rounded-[11.6px] flex items-center justify-center"
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/ticket-icon-white.svg`}
                    alt="Process step"
                    className="w-[27px] h-[27px]"
                  />
                </div>
              </div>
              <div className="text-[13.7px] font-semibold text-white leading-[1.5]">
                {pathBlock?.condition?.name || 'Ticket Triage'}
              </div>
            </div>
            <button className="w-[34px] h-[34px] rounded-[3.4px] flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)]">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal-white.svg`}
                alt="Menu"
                className="w-5 h-5"
              />
            </button>
          </div>

          {/* Content - White background */}
          <div className="bg-white p-[17px] flex flex-col gap-[13.7px]">
            <div className="inline-flex items-center gap-1 px-2 py-[2px] bg-[#EDF0FB] border border-[#AEBBED] rounded-[8543px] w-fit">
              <span className="text-xs font-medium text-[#374C99]">Conditional</span>
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/help-circle-blue.svg`}
                alt="Help"
                className="w-4 h-4"
              />
            </div>
            <div className="flex flex-col gap-[6.9px]">
              <div className="text-[12px] text-[#667085] leading-[1.43] whitespace-pre-line">
                {pathBlock?.condition?.description || ''}
              </div>
            </div>
          </div>

          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            style={{
              width: 6,
              height: 6,
              opacity: 0,
              background: colors['utility-brand-500'],
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />
        </div>

        {showModal && (
          <UpdatePathModal
            onClose={() => setShowModal(false)}
            onConfirm={handleCreateChildPaths}
            existingPathsCount={existingPathsCount}
            existingPaths={existingPaths.map((p) => p.name)}
          />
        )}
      </div>
    </BasicBlock>
  );
}

export default PathBlock;
