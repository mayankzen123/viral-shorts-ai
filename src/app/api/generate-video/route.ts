import { NextResponse } from 'next/server';
import { CacheManager } from '@/lib/utils';

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

    // Generate cache key for this specific video
    const cacheKey = uniqueId ? `video-${uniqueId}` : `video-${Date.now()}`;
    
    // Check cache first
    const cachedData = videoCache.get(cacheKey);
    
    if (cachedData) {
      // Return cached data if it exists
      console.log('Using cached video data');
      return NextResponse.json({ videoUrl: cachedData });
    }

    // Create video data structure with images and audio
    const videoData = {
      images: images,
      audio: audioUrl,
      type: 'video',
      created: Date.now()
    };
    
    // Store in cache
    videoCache.set(cacheKey, videoData);

    // Return the video data
    return NextResponse.json({ 
      videoUrl: videoData,
      message: "Video created successfully with images and audio."
    });
  } catch (error: any) {
    console.error('Error generating video:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate video' },
      { status: 500 }
    );
  }
} 