import { NextResponse } from 'next/server';
import { CacheManager } from '@/lib/utils';

// Create a cache for slideshow data with 24-hour TTL
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

    // Generate cache key for this specific slideshow
    const cacheKey = uniqueId ? `slideshow-${uniqueId}` : `slideshow-${Date.now()}`;
    
    // Check cache first
    const cachedData = videoCache.get(cacheKey);
    
    if (cachedData) {
      // Return cached data if it exists
      console.log('Using cached slideshow data');
      return NextResponse.json({ videoUrl: cachedData });
    }

    // Create a slideshow data structure with all images and audio
    const slideshowData = {
      images: images,
      audio: audioUrl,
      type: 'slideshow',
      slideDuration: 5000, // 5 seconds per slide by default
      created: Date.now()
    };
    
    // Store in cache
    videoCache.set(cacheKey, slideshowData);

    // Return the slideshow data
    return NextResponse.json({ 
      videoUrl: slideshowData,
      message: "Slideshow created successfully with all images and audio."
    });
  } catch (error: any) {
    console.error('Error generating slideshow:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate slideshow' },
      { status: 500 }
    );
  }
} 