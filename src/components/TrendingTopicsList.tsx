'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingTopic, Category, TrendingTopicsResponse } from '@/types';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export interface TrendingTopicsListProps {
  topics: TrendingTopicsResponse | null;
  isLoading: boolean;
  onTopicSelect: (topic: TrendingTopic, index: number) => void;
  selectedCategory: Category | null;
  error: string | null;
  isGenerating?: boolean;
  generatingTopicId?: string | number | null;
}

export function TrendingTopicsList({ 
  topics, 
  isLoading,
  onTopicSelect, 
  selectedCategory,
  error,
  isGenerating = false,
  generatingTopicId = null
}: TrendingTopicsListProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  
  // Extract trending topics from response
  const getTrendingTopics = (): TrendingTopic[] => {
    if (!topics) return [];
    
    // Handle the trendingTopics structure from the OpenAI API
    if (topics.trendingTopics && Array.isArray(topics.trendingTopics)) {
      return topics.trendingTopics;
    }
    
    // Fallback to topics property if it exists
    if (topics.topics && Array.isArray(topics.topics)) {
      return topics.topics;
    }
    
    return [];
  };
  
  const trendingTopics = getTrendingTopics();
  
  // Handle topic selection
  const handleTopicClick = (topic: TrendingTopic, index: number) => {
    setSelectedTopicId(index);
    onTopicSelect(topic, index);
  };

  // Display loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card/50 text-card-foreground rounded-lg overflow-hidden border p-4 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="flex justify-between mt-4">
                <div className="h-3 bg-muted rounded w-20"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Display error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-destructive mb-2" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <h3 className="text-lg font-medium text-destructive mb-1">Error Loading Topics</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Display empty state
  if (!trendingTopics.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="frost-glass border-dashed">
          <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-muted-foreground mb-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 10h.01" />
              <path d="M15 10h.01" />
              <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
            </svg>
            <p className="text-center font-medium mb-1">No trending topics found</p>
            <p className="text-center text-sm text-muted-foreground mt-1">Try selecting a different category</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to get popularity color based on string or PopularityLevel
  const getPopularityColor = (popularity: string) => {
    const popularityLower = typeof popularity === 'string' ? popularity.toLowerCase() : popularity;
    
    switch (popularityLower) {
      case 'very high':
        return 'from-red-500 to-red-600';
      case 'high':
        return 'from-orange-500 to-orange-600';
      case 'medium':
        return 'from-yellow-500 to-yellow-600';
      case 'low':
        return 'from-green-500 to-green-600';
      default:
        return 'from-blue-500 to-blue-600'; // Default fallback color
    }
  };

  const getCategoryName = () => {
    if (!selectedCategory) return 'Selected Category';
    return selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('_', ' ');
  };

  return (
    <div className="space-y-6">
      {/* Helpful tips - moved to the top */}
      <div className="bg-card/30 text-card-foreground rounded-lg overflow-hidden border border-dashed">
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="size-8 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">How it works</h4>
              <ul className="text-xs text-muted-foreground space-y-1.5 pl-5 list-disc">
                <li>Click any trending topic to generate a script</li>
                <li>Each script is professionally crafted for viral potential</li>
                <li>Higher viral scores indicate better performance potential</li>
                <li>You'll be redirected to the media editor after generation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-card/50 text-card-foreground rounded-lg overflow-hidden border">
        <div className="p-4 border-b bg-muted/30">
          <h2 className="text-lg font-medium">Trending Topics in {getCategoryName()}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Click on any topic to instantly generate a professional script
          </p>
        </div>
        
        <div className="divide-y">
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`
                group relative
                ${selectedTopicId === index ? 'bg-primary/5' : 'hover:bg-muted/50'}
                transition-all duration-200
              `}
              onClick={() => handleTopicClick(topic, index)}
              role="button"
              tabIndex={0}
            >
              {/* Active indicator bar */}
              {selectedTopicId === index && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              )}
              
              <div className="p-4 cursor-pointer relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className={`font-medium text-base ${selectedTopicId === index ? 'text-primary' : ''}`}>
                    {topic.title}
                  </h3>
                  
                  {/* Viral score and popularity indicators */}
                  <div className="flex items-center gap-2">
                    <div className="text-xs px-2 py-0.5 rounded-full bg-muted flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2 L18 12 L13 22 L8 12 L13 2 Z" />
                      </svg>
                      <span>{topic.viralScore}</span>
                    </div>
                    
                    <div className={`h-4 px-2 rounded-full text-xs font-medium text-white flex items-center bg-gradient-to-r ${getPopularityColor(topic.estimatedPopularity)}`}>
                      {typeof topic.estimatedPopularity === 'string' ? 
                        topic.estimatedPopularity.charAt(0).toUpperCase() + topic.estimatedPopularity.slice(1) :
                        topic.estimatedPopularity}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {topic.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    {formatDate(topic.dateStarted)}
                  </div>
                  
                  {/* Generation status */}
                  {generatingTopicId === index && isGenerating ? (
                    <div className="text-xs font-medium bg-primary/20 text-primary rounded-full px-2 py-0.5 flex items-center">
                      <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Generating Script...</span>
                    </div>
                  ) : selectedTopicId === index ? (
                    <div className="text-xs font-medium text-primary">Selected</div>
                  ) : (
                    <div className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to generate script
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 