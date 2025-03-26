// This file serves as the entry point for Remotion bundling
// It needs to export all compositions that will be rendered

import { registerRoot, Composition } from 'remotion';
import React from 'react';
import { SlideshowVideo } from './compositions/SlideshowVideo';

// Create a root component that renders our compositions
const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="SlideshowVideo"
        component={SlideshowVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          images: [],
          audio: '',
          durationInFrames: 300,
        }}
      />
    </>
  );
};

// Register the root component for the Remotion bundle
registerRoot(Root);

// Re-export compositions to be used in the player
export { SlideshowVideo }; 