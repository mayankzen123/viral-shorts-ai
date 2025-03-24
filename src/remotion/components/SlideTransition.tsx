'use client';

import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface SlideTransitionProps {
  src: string;
  startFrame: number;
  endFrame: number;
}

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  src,
  startFrame,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const duration = endFrame - startFrame;
  
  // Fade-in during the first 25% of the duration
  const fadeInDuration = Math.floor(duration * 0.25);
  const fadeInProgress = interpolate(
    frame,
    [0, fadeInDuration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Fade-out during the last 25% of the duration
  const fadeOutStart = duration - fadeInDuration;
  const fadeOutProgress = interpolate(
    frame,
    [fadeOutStart, duration],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Scale slightly during the sequence
  const scale = interpolate(
    frame,
    [0, duration / 2, duration],
    [1, 1.05, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Combine fade in and fade out for overall opacity
  const opacity = Math.min(fadeInProgress, fadeOutProgress);
  
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <img
        src={src}
        alt={`Slide ${frame}`}
        style={{
          objectFit: 'contain',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}; 