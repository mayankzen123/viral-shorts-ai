import { NextResponse } from 'next/server';
import { CacheManager } from '@/lib/utils';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { renderMediaOnLambda } from '@remotion/lambda';

// Define AWS regions supported by Remotion Lambda
type RemotionRegion = 
  | 'us-east-1' | 'us-east-2' | 'us-west-1' | 'us-west-2'
  | 'eu-central-1' | 'eu-central-2' | 'eu-west-1' | 'eu-west-2' | 'eu-west-3' | 'eu-south-1' | 'eu-north-1'
  | 'ap-south-1' | 'ap-east-1' | 'ap-southeast-1' | 'ap-southeast-2' | 'ap-northeast-1' | 'ap-northeast-2' | 'ap-northeast-3'
  | 'ca-central-1' | 'me-south-1' | 'sa-east-1' | 'af-south-1';

// Define the structure of the Lambda config file
interface LambdaConfig {
  region: RemotionRegion;
  bucketName: string;
  functionName: string;
  serveUrl: string;
  timestamp: string;
}

// Create a cache for video URLs with 12-hour TTL
const videoCache = new CacheManager<string>(12 * 60 * 60 * 1000);

// Create a temporary directory for storing rendered videos
const tempDir = path.join(os.tmpdir(), 'remotion-renders');
fs.ensureDirSync(tempDir);

// Try to load Lambda config file
let lambdaConfig: LambdaConfig | null = null;
try {
  const configPath = path.join(process.cwd(), 'remotion-lambda-config.json');
  if (fs.existsSync(configPath)) {
    lambdaConfig = JSON.parse(fs.readFileSync(configPath, 'utf8')) as LambdaConfig;
  }
} catch (error) {
  console.warn('Failed to load Remotion Lambda config, using default values.');
}

export async function POST(request: Request) {
  try {
    // Get the data from the request body
    const { images, audio, durationInFrames } = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0 || !audio) {
      return NextResponse.json(
        { error: 'Images and audio are required' },
        { status: 400 }
      );
    }

    // Create a unique key for this video
    const cacheKey = `video-${JSON.stringify(images)}-${audio}-${durationInFrames}`;
    
    // Check cache first
    const cachedVideoUrl = videoCache.get(cacheKey);
    if (cachedVideoUrl) {
      return NextResponse.json({ videoUrl: cachedVideoUrl });
    }

    // If we have Lambda config, use it to render the video
    if (lambdaConfig) {
      try {
        // Render using Lambda
        console.log('Rendering video using Remotion Lambda...');
        const { renderId, bucketName } = await renderMediaOnLambda({
          region: lambdaConfig.region,
          functionName: lambdaConfig.functionName,
          serveUrl: lambdaConfig.serveUrl,
          composition: 'SlideshowVideo',
          inputProps: {
            images,
            audio,
            durationInFrames: durationInFrames || 300,
          },
          codec: 'h264',
          imageFormat: 'jpeg',
          maxRetries: 1,
          privacy: 'public',
        });
        
        // Generate the URL to the rendered video
        const videoUrl = `https://${bucketName}.s3.amazonaws.com/renders/${renderId}/out.mp4`;
        
        // Cache the URL
        videoCache.set(cacheKey, videoUrl);
        
        console.log(`Video rendered successfully: ${videoUrl}`);
        return NextResponse.json({ videoUrl });
      } catch (lambdaError: unknown) {
        console.error('Lambda rendering failed:', lambdaError);
        const errorMessage = lambdaError instanceof Error 
          ? lambdaError.message 
          : 'Unknown Lambda rendering error';
        throw new Error(`Lambda rendering failed: ${errorMessage}`);
      }
    }
    
    // If no Lambda config is available, return instructions
    return NextResponse.json({
      videoUrl: null,
      error: "Cloud rendering not configured",
      clientSideRender: true,
      setupInstructions: {
        title: "Setup Remotion Lambda for cloud rendering",
        steps: [
          "1. Install AWS CLI (if not already installed): sudo apt install awscli",
          "2. Configure AWS credentials: aws configure",
          "3. Install Remotion Lambda: npm install @remotion/lambda",
          "4. Run the setup script: node scripts/remotion-lambda-setup.mjs",
          "5. Try downloading again after setup is complete"
        ],
        documentation: "https://www.remotion.dev/docs/lambda"
      },
      data: {
        images,
        audio,
        durationInFrames
      }
    });
  } catch (error: any) {
    console.error('Error rendering video:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate video' },
      { status: 500 }
    );
  }
} 