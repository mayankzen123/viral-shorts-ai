export type Category = 
  | 'technology' 
  | 'science' 
  | 'news' 
  | 'facts' 
  | 'myths' 
  | 'health' 
  | 'entertainment'
  | 'sports'
  | 'finance'
  | 'education';

export type PopularityLevel = 'low' | 'medium' | 'high' | 'very high';

export interface TrendingTopic {
  title: string;
  description: string;
  viralScore: number;
  dateStarted: string;
  estimatedPopularity: PopularityLevel | string;
}

export interface TrendingTopicsResponse {
  topics?: TrendingTopic[];
  trendingTopics?: TrendingTopic[];
}

export interface Script {
  hook: string;
  mainContent: string;
  callToAction: string;
  suggestedVisuals: string[];
}

export interface ScriptGenerationParams {
  topic: string;
  category: Category;
} 