import { registerRoot } from 'remotion';
import React from 'react';
import { SlideshowVideo } from './compositions/SlideshowVideo';

// Create a root component that will render our SlideshowVideo with props from the Remotion CLI
const Root: React.FC = () => {
  return null; // When using Remotion API, this is replaced with the actual component
};

// Register the root component for the Remotion bundle
registerRoot(Root); 