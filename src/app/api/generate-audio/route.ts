import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CacheManager } from '@/lib/utils';
import { put } from '@vercel/blob';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a cache for audio URLs with 24-hour TTL
const audioCache = new CacheManager<string>(24 * 60 * 60 * 1000);

export async function POST(request: Request) {
  try {
    // Get the text and uniqueId from the request body
    const { text, uniqueId, voice = "alloy" } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Generate cache key from the text and uniqueId (if available)
    const cacheKey = uniqueId ? `audio-${uniqueId}-${voice}` : `audio-${text.substring(0, 50)}-${voice}`;
    
    // Check cache first
    const cachedAudioUrl = audioCache.get(cacheKey);
    
    if (cachedAudioUrl) {
      // Return cached audio URL if it exists
      return NextResponse.json({ audioUrl: cachedAudioUrl });
    }

    // Generate the speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice, // "alloy", "echo", "fable", "onyx", "nova", "shimmer"
      input: text,
    });
    
    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // Generate a unique numerical filename
    // Combine timestamp with random number for uniqueness
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const filename = `${timestamp}${randomSuffix}-${voice}.mp3`;
    
    // Upload file to Vercel Blob Storage
    const blob = await put(filename, buffer, {
      contentType: 'audio/mpeg',
      access: 'public', // Make the file publicly accessible
    });
    
    // Get the URL of the uploaded file
    const audioUrl = blob.url;

    // Store in cache
    audioCache.set(cacheKey, audioUrl);

    // Return the audio URL
    return NextResponse.json({ audioUrl });
  } catch (error: any) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate audio' },
      { status: 500 }
    );
  }
} 