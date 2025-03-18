'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingTopic, Category } from '@/types';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface TrendingTopicsListProps {
  topics: TrendingTopic[];
  category: Category | null;
  onTopicSelect: (topic: TrendingTopic) => void;
  isGenerating: boolean;
  scriptGenerationState: 'idle' | 'loading' | 'success' | 'error';
}

export function TrendingTopicsList({ 
  topics, 
  category, 
  onTopicSelect, 
  isGenerating, 
  scriptGenerationState 
}: TrendingTopicsListProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  // Handle topic selection and immediately generate script
  const handleTopicClick = (topic: TrendingTopic, index: number) => {
    if (isGenerating) return; // Prevent selecting another topic while generating
    setSelectedTopicId(index);
    onTopicSelect(topic); // Immediately generate script when topic is clicked
  };
  
  // Reset selectedTopicId when generation completes
  useEffect(() => {
    if (scriptGenerationState === 'success' || scriptGenerationState === 'error') {
      // Reset selection after a short delay to show completion
      const timer = setTimeout(() => {
        setSelectedTopicId(null);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [scriptGenerationState]);

  if (!topics || !topics.length) {
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
    if (!category) return 'Selected Category';
    return category.charAt(0).toUpperCase() + category.slice(1);
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
                <li>Copy any section or the entire script for your use</li>
                <li>Higher viral scores indicate better performance potential</li>
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
          {topics.map((topic, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`
                group relative
                ${selectedTopicId === index ? 'bg-primary/5' : 'hover:bg-muted/50'}
                ${isGenerating && selectedTopicId !== index ? 'opacity-60' : ''}
                transition-all duration-200
              `}
              onClick={() => handleTopicClick(topic, index)}
              role="button"
              tabIndex={0}
            >
              <div className="p-4 cursor-pointer">
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
                      {topic.estimatedPopularity.charAt(0).toUpperCase() + topic.estimatedPopularity.slice(1)}
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
                  {selectedTopicId === index && (
                    <div className={`
                      text-xs font-medium rounded-full px-2 py-0.5 flex items-center
                      ${scriptGenerationState === 'loading' ? 'bg-primary/20 text-primary' : 
                        scriptGenerationState === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        scriptGenerationState === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-muted text-muted-foreground'}
                    `}>
                      {scriptGenerationState === 'loading' && (
                        <>
                          <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Generating...</span>
                        </>
                      )}
                      {scriptGenerationState === 'success' && (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          <span>Generated</span>
                        </>
                      )}
                      {scriptGenerationState === 'error' && (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" x2="12" y1="8" y2="12" />
                            <line x1="12" x2="12.01" y1="16" y2="16" />
                          </svg>
                          <span>Failed</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Action indicator for unselected items */}
                  {selectedTopicId !== index && !isGenerating && (
                    <div className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to generate script
                    </div>
                  )}
                </div>
              </div>
              
              {/* Active indicator bar */}
              {selectedTopicId === index && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 