import { useEffect, useState } from 'react';
import { Droppable, DroppableProps } from 'react-beautiful-dnd';

export const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  // Ensure boolean props are properly typed
  const sanitizedProps = {
    ...props,
    isDropDisabled: props.isDropDisabled === true,
    isCombineEnabled: props.isCombineEnabled === true,
    ignoreContainerClipping: props.ignoreContainerClipping === true,
  };

  return <Droppable {...sanitizedProps}>{children}</Droppable>;
};
