'use client';

import React from 'react';

interface SlideTransitionProps {
  src: string;
  startFrame: number;
  endFrame: number;
}

/**
 * This is a placeholder component to replace the Remotion-dependent SlideTransition
 * We don't need to implement it since we've reimplemented the functionality directly in RemotionPlayer
 */
export const SlideTransition: React.FC<SlideTransitionProps> = ({
  src,
  startFrame,
  endFrame,
}) => {
  return (
    <div className="flex items-center justify-center">
      <p>SlideTransition component (placeholder)</p>
    </div>
  );
}; 