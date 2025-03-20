import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { TrendingTopicsResponse } from '@/types';
// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Get category from request
    const { category } = await request.json();
    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    // Fetch trending topics using OpenAI
    const response = await openai.responses.create({
      model: "gpt-4o",
      tools: [{ type: "web_search_preview" }],
      input: `You are a viral trend analyst specializing in ${category}. 
        Search for and identify ONLY the most 10 recent trending topics in ${category} from the LAST 5-6 DAYS that have HIGH VIRAL POTENTIAL.

        For each trending topic, provide:
        - title: A concise, catchy title for the trend
        - description: A clear explanation of what the trend is about (1-2 sentences)
        - viralScore: A number between 70-100 representing viral potential (higher = more viral)
        - dateStarted: The date when this topic started trending (within the last 5-6 days)
        - estimatedPopularity: Choose from: "medium", "high", or "very high"
        
        Format your response as VALID JSON ONLY: {"trendingTopics": [...array of topic objects...]}
        Do NOT include any markdown formatting, explanations, or text outside the JSON structure.`
    });

    // Parse the response
    const outputText = response.output_text || '{"trendingTopics":[]}';
    const cleanedOutput = outputText.trim().replace(/```json\n?|\n?```/g, '');
    
    // Try to parse response as JSON
    try {
      const parsedContent = JSON.parse(cleanedOutput) as TrendingTopicsResponse;
      
      // Ensure we have a valid trending topics array
      if (parsedContent.trendingTopics && Array.isArray(parsedContent.trendingTopics)) {
        return NextResponse.json(parsedContent);
      }
      
      throw new Error('Invalid response structure');
    } catch (error) {
      // Try regex extraction as fallback
      const jsonMatch = outputText.match(/\{[\s\S]*"trendingTopics"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedContent = JSON.parse(jsonMatch[0]) as TrendingTopicsResponse;
          if (extractedContent.trendingTopics && Array.isArray(extractedContent.trendingTopics)) {
            return NextResponse.json(extractedContent);
          }
        } catch (e) {
          // Fallback extraction failed
        }
      }
      
      return NextResponse.json({ error: 'Failed to parse trending topics' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trending topics' }, { status: 500 });
  }
} 