import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import * as Creatomate from 'creatomate';

const creatomateClient = new Creatomate.Client(process.env.CREATOMATE_API_KEY || '');

export async function POST(req: Request) {
  try {
    // Verify user authentication
    const authResult = await auth();
    if (!authResult?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request data
    const { images, audioUrl, title = 'My Video' } = await req.json();

    // Validate required inputs
    if (!images || !images.length) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }
    
    if (!audioUrl) {
      return NextResponse.json({ error: 'Audio URL is required' }, { status: 400 });
    }

    // Create a slideshow with images and audio using Creatomate classes
    const imageElements = images.map((imageUrl: string, index: number) => {
      // Each image gets a base duration - we'll let the audio determine the video length
      // but we want to ensure each image has an appropriate portion of the timeline
      const baseDuration = 10;
      
      // Create image element with animations
      return new Creatomate.Image({
        track: 1,
        source: imageUrl,
        duration: baseDuration,
        animations: [
          // Alternate between different pan animations for visual variety
          index % 3 === 0 
            ? new Creatomate.PanCenter({
                startScale: '100%',
                endScale: '120%',
                easing: 'ease-in-out',
              })
            : index % 3 === 1
            ? new Creatomate.PanLeftWithZoom({
                startScale: '100%',
                endScale: '120%',
                easing: 'ease-in-out',
              })
            : new Creatomate.PanRightWithZoom({
                startScale: '100%',
                endScale: '120%',
                easing: 'ease-in-out',
              }),
          // Add fade animation for all images
          new Creatomate.Fade({
            duration: 0.5,
          }),
        ],
        // Add transitions between images (except for the first image)
        ...(index > 0 ? { transition: new Creatomate.Fade() } : {}),
      });
    });

    // Create source with configuration
    const source = new Creatomate.Source({
      outputFormat: 'mp4',
      frameRate: 30,
      width: 1024,
      height: 1024,
      elements: [
        // Add all image elements
        ...imageElements,
        
        // Add audio track - the audio will play at its natural length
        // The video will adapt to match the audio duration
        new Creatomate.Audio({
          source: audioUrl,
          // Use natural audio duration - don't trim
          duration: undefined
        }),
      ],
      // Set a background color for the entire video
      fillColor: '#000000',
    });

    // Create a render job using Creatomate
    const renderResult = await creatomateClient.render({ source });

    // The render method returns an array of renders, take the first one
    const firstRender = Array.isArray(renderResult) ? renderResult[0] : renderResult;

    // Return the render result, which includes the URL to the rendered video
    return NextResponse.json({
      success: true,
      renderUrl: firstRender.url,
      renderStatus: firstRender.status,
      renderId: firstRender.id,
    });
  } catch (error: any) {
    console.error('Creatomate render error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to render video' },
      { status: 500 }
    );
  }
} 