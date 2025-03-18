import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { TrendingTopicsResponse } from '@/types';
import { CacheManager } from '@/lib/utils';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a cache for trending topics with 15-minute TTL
const trendingCache = new CacheManager<TrendingTopicsResponse>(15 * 60 * 1000);

export async function POST(request: Request) {
  try {
    const { category } = await request.json();

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `trending-topics-${category}`;
    const cachedTopics = trendingCache.get(cacheKey);
    
    if (cachedTopics) {
      // Return cached data if it exists
      return NextResponse.json(cachedTopics);
    }

    // Use OpenAI to get trending topics
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a trend analyst specializing in ${category}. 
          Provide the top 10 trending topics in this field right now in JSON format.
          For each topic, include: title, description, viralScore (1-100), 
          dateStarted (YYYY-MM-DD), and estimatedPopularity (low, medium, high, very high).
          The response should be ONLY valid JSON without any markdown formatting or explanations.
          Format the response as: {"trendingTopics": [...array of topic objects...]}`
        },
        {
          role: "user",
          content: `What are the top 10 trending topics in ${category} right now?`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || '{"trendingTopics":[]}';
    
    try {
      const parsedContent = JSON.parse(content) as TrendingTopicsResponse;
      
      // Store in cache
      trendingCache.set(cacheKey, parsedContent);
      
      // Pass through the data structure as is - either topics or trendingTopics
      return NextResponse.json(parsedContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return NextResponse.json({ error: 'Invalid trend data format received' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return NextResponse.json({ error: 'Failed to fetch trending topics' }, { status: 500 });
  }
} 