'use client';

import { useEffect, useRef, useState } from 'react';

const HomePage = () => {
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const [svgPosition, setSvgPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const updateSvgPosition = () => {
    if (div1Ref.current && div2Ref.current) {
      const rect1 = div1Ref.current.getBoundingClientRect();
      const rect2 = div2Ref.current.getBoundingClientRect();

      // Calculate start and end points
      const startX = rect1.left + rect1.width / 2;
      const startY = rect1.top + rect1.height / 2;
      const endX = rect2.left + rect2.width / 2;
      const endY = rect2.top + rect2.height / 2;

      // Set SVG container dimensions and position
      setSvgPosition({
        top: Math.min(startY, endY),
        left: Math.min(startX, endX),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY),
      });
    }
  };

  useEffect(() => {
    // Update position on window resize
    window.addEventListener('resize', updateSvgPosition);
    return () => {
      window.removeEventListener('resize', updateSvgPosition);
    };
  }, []);

  useEffect(() => {
    // Initial position update
    updateSvgPosition();
  }, []);

  const handleDrag = (
    event: React.MouseEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLDivElement>
  ) => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const left = moveEvent.clientX - offsetX;
      const top = moveEvent.clientY - offsetY;

      element.style.left = `${left}px`;
      element.style.top = `${top}px`;

      // Update the SVG position dynamically
      updateSvgPosition();
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="relative h-screen w-screen bg-gray-100">
      {/* Div 1 */}
      <div
        ref={div1Ref}
        className="absolute bg-blue-500 text-white flex items-center justify-center w-20 h-20 rounded-lg z-20 cursor-move"
        style={{ top: '20%', left: '30%' }}
        onMouseDown={(e) => handleDrag(e, div1Ref)}
      >
        Div 1
      </div>

      {/* Div 2 */}
      <div
        ref={div2Ref}
        className="absolute bg-green-500 text-white flex items-center justify-center w-20 h-20 rounded-lg z-20 cursor-move"
        style={{ top: '60%', left: '70%' }}
        onMouseDown={(e) => handleDrag(e, div2Ref)}
      >
        Div 2
      </div>

      {/* External SVG */}
      <div
        className="absolute pointer-events-none z-1"
        style={{
          top: svgPosition.top,
          left: svgPosition.left,
          width: svgPosition.width,
          height: svgPosition.height,
        }}
      >
        <img
          src="/assets/workflow/vector-right.svg"
          alt="Connector"
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default HomePage;
