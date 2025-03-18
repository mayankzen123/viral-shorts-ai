import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { Script } from '@/types';
import { CacheManager } from '@/lib/utils';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a cache for scripts with 1-hour TTL
const scriptCache = new CacheManager<Script>(60 * 60 * 1000);

export async function POST(request: Request) {
  try {
    const { topic, category } = await request.json();

    if (!topic || !category) {
      return NextResponse.json({ error: "Topic and category are required" }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `script-${category}-${topic}`;
    const cachedScript = scriptCache.get(cacheKey);
    
    if (cachedScript) {
      // Return cached data if it exists
      return NextResponse.json(cachedScript);
    }

    // Use OpenAI to generate a script
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert scriptwriter for short-form videos. 
          Create a 60-90 second script for a video on ${topic} in the ${category} category.
          The script should be engaging, informative, and optimized for social media.
          The format should include a hook (5-7 seconds), main content (40-60 seconds), 
          a call to action (5-7 seconds), and 5 suggested visuals.
          The response should be ONLY valid JSON without any markdown formatting or explanations.`
        },
        {
          role: "user",
          content: `Write a script for a short video about "${topic}" in the ${category} category.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || '{}';
    
    try {
      const scriptData = JSON.parse(content);
      
      // Ensure the script has the required structure
      const script: Script = {
        hook: scriptData.hook || "",
        mainContent: scriptData.mainContent || "",
        callToAction: scriptData.callToAction || "",
        suggestedVisuals: Array.isArray(scriptData.suggestedVisuals) 
          ? scriptData.suggestedVisuals 
          : []
      };
      
      // Store in cache
      scriptCache.set(cacheKey, script);
      
      return NextResponse.json(script);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return NextResponse.json({ error: 'Invalid script format received' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
  }
} 