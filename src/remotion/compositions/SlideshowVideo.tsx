'use client';

import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import { SlideTransition } from '../components/SlideTransition';

interface SlideshowVideoProps {
  images: string[];
  audio: string;
  durationInFrames?: number;
  fps?: number;
}

export const SlideshowVideo: React.FC<SlideshowVideoProps> = ({
  images,
  audio,
  durationInFrames = 30 * 10, // Default 10 seconds at 30fps
  fps = 30,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // Calculate how many frames each slide should appear for
  const slideDuration = useMemo(() => {
    if (!images.length) return 0;
    return Math.floor(durationInFrames / images.length);
  }, [durationInFrames, images.length]);
  
  // No images, no video
  if (!images.length) {
    return (
      <AbsoluteFill style={{ backgroundColor: 'black', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1>No images provided for slideshow</h1>
      </AbsoluteFill>
    );
  }
  
  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* Audio track */}
      <Audio src={audio} />
      
      {/* Image sequences */}
      {images.map((image, index) => {
        const startFrame = index * slideDuration;
        
        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={slideDuration}
            name={`Slide ${index + 1}`}
          >
            <SlideTransition
              src={image}
              startFrame={startFrame}
              endFrame={startFrame + slideDuration}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}; 