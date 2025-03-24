const { bundle } = require('@remotion/bundler');
const { getCompositions, renderStill } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Path to the Remotion project
const projectPath = path.join(process.cwd(), 'src', 'remotion');
const bundlePath = path.join(projectPath, 'bundle.tsx');
const outputDir = path.join(process.cwd(), '.remotion-build');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function buildRemotionBundle() {
  console.log('Building Remotion bundle...');
  
  try {
    // Bundle the Remotion project
    const bundleResult = await bundle(bundlePath);
    
    // Save the bundle location
    fs.writeFileSync(
      path.join(outputDir, 'bundle-info.json'),
      JSON.stringify({
        bundleUrl: bundleResult,
        timestamp: Date.now(),
      })
    );
    
    // Get the compositions from the bundle
    const compositions = await getCompositions(bundleResult);
    
    // Generate a thumbnail for each composition
    for (const composition of compositions) {
      console.log(`Found composition: ${composition.id}`);
      
      // Save composition details
      fs.writeFileSync(
        path.join(outputDir, `composition-${composition.id}.json`),
        JSON.stringify({
          id: composition.id,
          width: composition.width,
          height: composition.height,
          fps: composition.fps,
          durationInFrames: composition.durationInFrames,
        })
      );
    }
    
    console.log('Remotion bundle built successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error building Remotion bundle:', error);
    process.exit(1);
  }
}

buildRemotionBundle(); 