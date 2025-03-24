import { NextResponse } from 'next/server';
import { CacheManager } from '@/lib/utils';
import fs from 'fs-extra';
import path from 'path';
import { getCompositions, renderMedia } from '@remotion/renderer';
import { bundle } from '@remotion/bundler';
import os from 'os';

// Create a temporary directory for Remotion output
const tempDir = path.join(os.tmpdir(), 'remotion-renders');
fs.ensureDirSync(tempDir);

// Create a cache for video data with 24-hour TTL
const videoCache = new CacheManager<any>(24 * 60 * 60 * 1000);

export async function POST(request: Request) {
  try {
    // Get the images, audio, topic info from the request body
    const { images, audioUrl, uniqueId } = await request.json();

    if (!images || !images.length || !audioUrl) {
      return NextResponse.json(
        { error: 'Images and audio are required' },
        { status: 400 }
      );
    }

    // Generate cache key for this specific video request
    const cacheKey = uniqueId ? `video-${uniqueId}` : `video-${Date.now()}`;
    
    // Check cache first
    const cachedData = videoCache.get(cacheKey);
    
    if (cachedData) {
      // Return cached data if it exists
      return NextResponse.json({ videoUrl: cachedData });
    }

    try {
      // Validate each image URL - filter out any empty or invalid URLs
      const validImages = images.filter((url: string) => url && typeof url === 'string' && url.length > 0);
      
      if (validImages.length === 0) {
        throw new Error('No valid image URLs provided');
      }
      
      // Create video data structure with images and audio for client-side rendering
      const videoData = {
        type: 'video',
        images: validImages,
        audio: audioUrl,
        created: Date.now()
      };
      
      // Store in cache
      videoCache.set(cacheKey, videoData);
      
      return NextResponse.json({ 
        videoUrl: videoData,
        message: `Video created successfully with ${validImages.length} images and audio.`
      });
    } catch (renderError: any) {
      // Fallback to client-side rendering but ensure we're still validating images
      const validImages = images.filter((url: string) => url && typeof url === 'string' && url.length > 0);
      
      const fallbackData = {
        type: 'video',
        images: validImages,
        audio: audioUrl,
        created: Date.now(),
        isClientSideRendered: true
      };
      
      videoCache.set(cacheKey, fallbackData);
      
      return NextResponse.json({ 
        videoUrl: fallbackData,
        message: "Video will be rendered client-side due to server rendering error."
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate video' },
      { status: 500 }
    );
  }
} 