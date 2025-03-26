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
  | 'education'
  | 'space_exploration';

export type PopularityLevel = 'low' | 'medium' | 'high' | 'very high';

export interface TrendingTopic {
  id?: string;
  title: string;
  description: string;
  viralScore: number;
  dateStarted: string;
  estimatedPopularity: PopularityLevel | string;
  category?: Category;
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