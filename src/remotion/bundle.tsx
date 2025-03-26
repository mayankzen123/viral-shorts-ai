import { registerRoot, Composition } from 'remotion';
import { SlideshowVideo } from './compositions/SlideshowVideo';
import React from 'react';

// Define a wrapper component that handles the props correctly
// This serves as a compatibility layer between Remotion's expected types and our component
const SlideshowWrapper: React.FC<Record<string, unknown>> = (props) => {
  // The props from Remotion will be of type Record<string, unknown>
  // Cast them to the expected SlideshowVideoProps before passing them to SlideshowVideo
  return <SlideshowVideo 
    images={props.images as string[] || []} 
    audio={props.audio as string || ''}
    durationInFrames={props.durationInFrames as number}
    fps={props.fps as number}
  />;
};

// Define the root component with compositions
const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="SlideshowVideo"
        component={SlideshowWrapper}
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