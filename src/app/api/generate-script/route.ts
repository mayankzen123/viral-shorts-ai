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
    // Extract request data
    const { topic, category, description } = await request.json();

    // Validate required fields
    if (!topic || !category) {
      return NextResponse.json(
        { error: "Topic and category are required" }, 
        { status: 400 }
      );
    }
    
    // Generate cache key with description if available
    const cacheKey = description 
      ? `script-${category}-${topic}-${description.substring(0, 20)}` 
      : `script-${category}-${topic}`;
    
    // Check cache first
    const cachedScript = scriptCache.get(cacheKey);
    if (cachedScript) {
      return NextResponse.json(cachedScript);
    }

    // Generate script using OpenAI
    const script = await generateScriptWithAI(topic, category, description);
    
    // Store in cache
    scriptCache.set(cacheKey, script);
    
    return NextResponse.json(script);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate script' }, 
      { status: 500 }
    );
  }
}

/**
 * Generates a script using OpenAI
 */
async function generateScriptWithAI(topic: string, category: string, description?: string): Promise<Script> {
  // Call OpenAI API
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert scriptwriter for viral short-form videos. 
        Create a 60-90 second script for a video on ${topic} in the ${category} category.
        ${description ? `Additional context about the topic: ${description}` : ''}
        
        The script should be extremely engaging, catchy, and optimized for social media to maximize shares and subscribers.
        Use techniques that grab attention in the first 3 seconds, create emotional connection, and include a strong call to action.
        
        Return your response in the EXACT following JSON format:
        {
          "hook": "A 5-7 second attention-grabbing opening that immediately hooks the viewer",
          "mainContent": "40-60 seconds of informative, entertaining content about the topic",
          "callToAction": "A 5-7 second compelling call to action that encourages subscriptions",
          "suggestedVisuals": ["Visual 1", "Visual 2", "Visual 3", "Visual 4", "Visual 5"]
        }
        
        IMPORTANT: For the suggestedVisuals field, provide Studio Ghibli inspired visual descriptions. These should incorporate:
        - Whimsical, dreamlike elements with soft, vibrant colors
        - Nature elements like clouds, trees, water, or wind
        - Charming characters with Miyazaki-inspired features
        - Attention to atmospheric details and lighting
        - Magical or fantastical elements blended with the main topic
        
        Make sure each visual suggestion would look beautiful in the distinct Studio Ghibli art style while still being relevant to the script content.
        
        The response should be ONLY valid JSON without any markdown formatting or explanations.
        Use the EXACT field names as shown above.`
      },
      {
        role: "user",
        content: `Write a highly engaging script for a viral short video about "${topic}" in the ${category} category.${description ? ` The topic is about: ${description}` : ''} Make it catchy enough to attract subscribers.`
      }
    ],
    response_format: { type: "json_object" }
  });

  // Parse the response
  const content = response.choices[0].message.content || '{}';
  
  try {
    const scriptData = JSON.parse(content);
    
    // Primary field names based on our prompt
    let script: Script = {
      hook: scriptData.hook || "",
      mainContent: scriptData.mainContent || "",
      callToAction: scriptData.callToAction || "",
      suggestedVisuals: Array.isArray(scriptData.suggestedVisuals) ? scriptData.suggestedVisuals : []
    };
    
    // Check if we got an empty response but have alternative field names
    if (!script.hook && !script.mainContent && !script.callToAction) {
      // Try alternative field names as a fallback
      script = {
        hook: findValue(scriptData, ['Hook', 'opening', 'Opening', 'introduction', 'Introduction']),
        mainContent: findValue(scriptData, ['MainContent', 'content', 'Content', 'body', 'Body']),
        callToAction: findValue(scriptData, ['CallToAction', 'cta', 'CTA', 'conclusion', 'Conclusion']),
        suggestedVisuals: findVisuals(scriptData)
      };
    }
    
    return script;
  } catch (parseError) {
    throw new Error('Invalid script format received');
  }
}

/**
 * Helper to find a value from multiple possible keys
 */
function findValue(obj: Record<string, any>, possibleKeys: string[]): string {
  for (const key of possibleKeys) {
    if (obj[key] && typeof obj[key] === 'string') {
      return obj[key];
    }
  }
  return "";
}

/**
 * Helper to find visuals from multiple possible keys
 */
function findVisuals(obj: Record<string, any>): string[] {
  const visualKeys = ['suggestedVisuals', 'SuggestedVisuals', 'visuals', 'Visuals'];
  
  for (const key of visualKeys) {
    if (Array.isArray(obj[key])) {
      return obj[key];
    }
  }
  
  return [];
} 