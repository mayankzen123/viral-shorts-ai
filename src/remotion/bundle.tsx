import { registerRoot, Composition } from 'remotion';
import { SlideshowVideo } from './compositions/SlideshowVideo';
import React from 'react';

// Define the root component with compositions
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
        }}
      />
    </>
  );
};

// Register the root component
registerRoot(Root); 