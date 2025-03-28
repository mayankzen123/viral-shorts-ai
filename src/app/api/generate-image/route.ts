import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CacheManager } from '@/lib/utils';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a cache for image URLs with 24-hour TTL
const imageCache = new CacheManager<string>(24 * 60 * 60 * 1000);

export async function POST(request: Request) {
  try {
    // Get the prompt and uniqueId from the request body
    const { prompt, uniqueId } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate cache key from the prompt and uniqueId (if available)
    // This ensures that identical prompts from different topics get different images
    const cacheKey = uniqueId ? `image-${uniqueId}-${prompt}` : `image-${prompt}`;
    
    // Check cache first
    const cachedImageUrl = imageCache.get(cacheKey);
    
    if (cachedImageUrl) {
      // Return cached image URL if it exists
      return NextResponse.json({ imageUrl: cachedImageUrl });
    }

    // Generate the image using OpenAI DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3", // or "dall-e-2" for faster, lower quality images
      prompt: `Create a Studio Ghibli style image with whimsical, painterly aesthetics. Use soft, vibrant colors, attention to natural elements, and dreamlike lighting characteristic of Hayao Miyazaki films. The image should be suitable for a short social media video about: ${cleanPrompt(prompt)}. Maintain the Ghibli-inspired hand-drawn animation look with detailed backgrounds and charming character design.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    const imageUrl = response.data[0].url;
    
    // Check if imageUrl is defined
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    // Store in cache
    imageCache.set(cacheKey, imageUrl);

    // Return the image URL
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}

// Helper function to clean prompts by removing keywords before colons
function cleanPrompt(prompt: string): string {
  // Check if the prompt contains a colon with optional whitespace
  // Regex explanation:
  // ^[^:]+: - Matches any characters except colon at the start of string followed by a colon
  // \s* - Matches any optional whitespace after the colon
  return prompt.replace(/^[^:]+:\s*/i, '').trim();
} 