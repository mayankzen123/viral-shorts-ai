'use client';

import React from 'react';

interface SlideshowVideoProps {
  images: string[];
  audio: string;
  durationInFrames?: number;
  fps?: number;
}

/**
 * This is a placeholder component to replace the Remotion-dependent SlideshowVideo
 * We don't need to implement it since we've reimplemented the functionality directly in RemotionPlayer
 */
export const SlideshowVideo: React.FC<SlideshowVideoProps> = ({
  images,
  audio,
  durationInFrames = 30 * 10, // Default 10 seconds at 30fps
  fps = 30,
}) => {
  return (
    <div className="flex items-center justify-center">
      <p>SlideshowVideo component (placeholder)</p>
    </div>
  );
}; 