'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CategoryGrid } from '@/components/CategoryGrid';
import { TrendingTopicsList } from '@/components/TrendingTopicsList';
import { ScriptDisplay } from '@/components/ScriptDisplay';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { useScriptGeneration } from '@/hooks/useScriptGeneration';
import { Category, TrendingTopic } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

/**
 * Custom hook to enforce a minimum duration for a loading state
 * This ensures the UI shows a loading indicator for at least the specified time
 */
function useMinimumLoadingTime(
  state: 'idle' | 'loading' | 'success' | 'error',
  setState: React.Dispatch<React.SetStateAction<'idle' | 'loading' | 'success' | 'error'>>,
  minimumTime: number = 2000
) {
  const loadingStartTimeRef = useRef<number | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);
  
  // Force loading state to persist for minimum time
  useEffect(() => {
    if (state === 'loading') {
      // Set loading start time if not already set
      if (!loadingStartTimeRef.current) {
        loadingStartTimeRef.current = Date.now();
      }
    } else if ((state === 'success' || state === 'error') && loadingStartTimeRef.current) {
      // Calculate how long we've been in loading state
      const loadingDuration = Date.now() - loadingStartTimeRef.current;
      
      if (loadingDuration < minimumTime) {
        // If we haven't shown loading state for minimum time, revert back to loading
        const remainingTime = minimumTime - loadingDuration;
        
        // Save the intended final state
        const finalState = state;
        
        // Go back to loading state
        setState('loading');
        
        // Schedule the real completion after remaining time
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        
        loadingTimeoutRef.current = setTimeout(() => {
          loadingStartTimeRef.current = null;
          setState(finalState); // Set to the saved final state
        }, remainingTime);
      } else {
        // Reset loading start time
        loadingStartTimeRef.current = null;
      }
    }
  }, [state, setState, minimumTime]);
  
  // Reset function to clear any pending timeouts and loading time tracking
  const resetLoadingTimer = useCallback(() => {
    loadingStartTimeRef.current = null;
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, []);
  
  return {
    isEnforcingMinimumTime: loadingStartTimeRef.current !== null,
    resetLoadingTimer
  };
}

export default function Home() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null);
  const [showCategoryGrid, setShowCategoryGrid] = useState<boolean>(true);
  const [loadingCategory, setLoadingCategory] = useState<Category | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [scriptGenerationState, setScriptGenerationState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Use the custom hook for minimum loading time
  const { isEnforcingMinimumTime, resetLoadingTimer } = useMinimumLoadingTime(
    scriptGenerationState,
    setScriptGenerationState,
    3000 // 3 seconds minimum loading time
  );
  
  // Custom hooks
  const { topics, isLoading, error: topicsError, fetchTrendingTopics } = useTrendingTopics();
  const { script, isGenerating, error: scriptError, generateScript } = useScriptGeneration();

  // Effect to handle script generation completion
  useEffect(() => {
    // Only update loading -> success if there's no active loading timer
    if (script && scriptGenerationState === 'loading' && !isEnforcingMinimumTime) {
      setScriptGenerationState('success');
    }
  }, [script, scriptGenerationState, isEnforcingMinimumTime]);

  // Add a debug effect to track state changes (keeping just the essential debugging)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__scriptState = scriptGenerationState;
    }
  }, [scriptGenerationState]);

  // Get category theme information
  const getCategoryTheme = (category: Category | null) => {
    if (!category) return { gradient: "from-indigo-500 to-purple-600" };
    
    const categoryData = CATEGORIES.find(c => c.value === category);
    return categoryData?.theme || { gradient: "from-indigo-500 to-purple-600" };
  };

  // Category data
  const CATEGORIES = [
    { 
      value: 'technology' as Category, 
      label: 'Technology',
      theme: {
        gradient: "from-blue-500 to-indigo-600",
      }
    },
    { 
      value: 'science' as Category, 
      label: 'Science', 
      theme: {
        gradient: "from-purple-500 to-fuchsia-600",
      }
    },
    { 
      value: 'news' as Category, 
      label: 'News',
      theme: {
        gradient: "from-orange-500 to-amber-600",
      }
    },
    { 
      value: 'facts' as Category, 
      label: 'Facts',
      theme: {
        gradient: "from-sky-500 to-cyan-600",
      }
    },
    { 
      value: 'myths' as Category, 
      label: 'Myths & Reality',
      theme: {
        gradient: "from-violet-500 to-purple-600",
      }
    },
    { 
      value: 'health' as Category, 
      label: 'Health & Wellness',
      theme: {
        gradient: "from-green-500 to-emerald-600",
      }
    },
    { 
      value: 'entertainment' as Category, 
      label: 'Entertainment',
      theme: {
        gradient: "from-red-500 to-rose-600",
      }
    },
    { 
      value: 'sports' as Category, 
      label: 'Sports',
      theme: {
        gradient: "from-yellow-500 to-amber-600",
      }
    },
    { 
      value: 'finance' as Category, 
      label: 'Finance',
      theme: {
        gradient: "from-emerald-500 to-teal-600",
      }
    },
    { 
      value: 'education' as Category, 
      label: 'Education',
      theme: {
        gradient: "from-blue-400 to-blue-600",
      }
    },
    { 
      value: 'space_exploration' as Category, 
      label: 'Space Exploration',
      theme: {
        gradient: "from-indigo-500 to-purple-700",
      }
    },
  ];

  // Handle category selection - only fetch here, not in the useEffect
  const handleCategorySelect = async (category: Category) => {
    setSelectedCategory(category);
    setLoadingCategory(category);
    setIsTransitioning(true);
    
    try {
      await fetchTrendingTopics(category);
      
      // Short delay for animation
      setTimeout(() => {
        setShowCategoryGrid(false);
        setIsTransitioning(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to fetch trending topics');
      setIsTransitioning(false);
    } finally {
      setLoadingCategory(null);
    }
  };

  // Handle topic selection and script generation
  const handleTopicSelect = useCallback(async (topic: TrendingTopic) => {
    // Now set the new topic
    setSelectedTopic(topic);
    
    if (!selectedCategory) return;
    
    // Start loading
    setScriptGenerationState('loading');

    try {
      // Make the API call
      const scriptData = await generateScript(topic.title, selectedCategory, topic.description);
      
      if (scriptData) {
        setScriptGenerationState('success');
      } else {
        setScriptGenerationState('error');
        toast.error('Failed to generate script');
      }
    } catch (error) {
      setScriptGenerationState('error');
      toast.error('Failed to generate script');
    }
  }, [selectedCategory, generateScript, resetLoadingTimer]);

  // Helper function to get trending topics array safely
  const getTrendingTopics = () => {
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

  // Check if we have topics to display
  const hasTopics = getTrendingTopics().length > 0;

  // Handler to go back to category selection
  const handleBackToCategories = () => {
    setShowCategoryGrid(true);
    setSelectedTopic(null);
    setScriptGenerationState('idle');
  };
  
  const getCategoryLabel = (category: Category | null) => {
    if (!category) return '';
    const found = CATEGORIES.find(c => c.value === category);
    return found?.label || category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="min-h-screen gradient-bg pb-16">
      <Header />
      <Toaster />

      <main className="container px-4 mx-auto">
        <div className="grid gap-8">
          {showCategoryGrid ? (
            <CategoryGrid 
              onCategorySelect={handleCategorySelect}
              isLoading={isLoading}
              loadingCategory={loadingCategory}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mt-4 mb-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button 
                    variant="ghost" 
                    onClick={handleBackToCategories}
                    className="flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 19-7-7 7-7"/>
                      <path d="M19 12H5"/>
                    </svg>
                    <span>Back to Categories</span>
                  </Button>
                </motion.div>
                {selectedCategory && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/40 dark:to-purple-950/40 px-4 py-2 rounded-full"
                  >
                    <span className="font-medium">{getCategoryLabel(selectedCategory)}</span>
                  </motion.div>
                )}
              </div>

              {topicsError && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 p-4 rounded-md frost-glass border border-red-200 dark:border-red-900/30"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    <span>Error: {topicsError}</span>
                  </div>
                </motion.div>
              )}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-8 frost-glass rounded-xl animate-pulse"
                >
                  <div className="inline-flex items-center justify-center size-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <div className="size-8 rounded-full border-2 border-white dark:border-gray-900 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="mt-4 font-medium">Loading trending topics...</p>
                  <p className="text-sm text-muted-foreground mt-1">This may take a few moments</p>
                </motion.div>
              )}

              {hasTopics && selectedCategory && !isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left side - Topic List */}
                  <div className="flex flex-col space-y-1">
                    <TrendingTopicsList 
                      topics={getTrendingTopics()} 
                      category={selectedCategory} 
                      onTopicSelect={handleTopicSelect}
                      isGenerating={scriptGenerationState === 'loading'}
                      scriptGenerationState={scriptGenerationState}
                    />
                  </div>
                  
                  {/* Right side - Script Display */}
                  <div className="flex flex-col">
                    {scriptGenerationState === 'success' && script && selectedTopic ? (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="h-full"
                        >
                          <ScriptDisplay 
                            script={script} 
                            topic={selectedTopic} 
                          />
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-full flex items-center justify-center"
                        >
                          <div className="text-center p-8 frost-glass rounded-xl w-full">
                            {scriptGenerationState === 'idle' ? (
                              <>
                                <div className="inline-flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-500 dark:text-gray-400 mb-4">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                    <polyline points="14 2 14 8 20 8" />
                                  </svg>
                                </div>
                                <h3 className="text-xl font-medium mb-2">Your Script Will Appear Here</h3>
                                <p className="text-muted-foreground">
                                  Select a trending topic from the list to automatically generate a professional script.
                                </p>
                              </>
                            ) : scriptGenerationState === 'error' ? (
                              <>
                                <div className="inline-flex items-center justify-center size-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 mb-4">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" x2="12" y1="8" y2="12" />
                                    <line x1="12" x2="12.01" y1="16" y2="16" />
                                  </svg>
                                </div>
                                <h3 className="text-xl font-medium mb-2">Script Generation Failed</h3>
                                <p className="text-muted-foreground">
                                  There was an error generating your script. Please try again or select a different topic.
                                </p>
                              </>
                            ) : null}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              )}

              {/* Script generation loading state */}
              <AnimatePresence mode="wait">
                {scriptGenerationState === 'loading' && (
                  <motion.div 
                    key="script-loading-overlay"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
                    <motion.div 
                      className="relative bg-card text-card-foreground p-10 rounded-lg shadow-lg frost-glass max-w-md mx-auto text-center"
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      transition={{ type: "spring", damping: 20 }}
                    >
                      <div className="p-4">
                        <div className="relative size-20 mx-auto">
                          <div className="absolute inset-0 size-20 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 opacity-20 animate-pulse"></div>
                          <div className="absolute inset-0 size-20 border-4 border-indigo-500/30 rounded-full"></div>
                          <div className="absolute inset-2 size-16 border-4 border-t-indigo-600 border-indigo-600/20 rounded-full animate-spin"></div>
                          <div className="absolute inset-6 size-8 border-4 border-t-purple-600 border-purple-600/20 rounded-full animate-spin-reverse"></div>
                        </div>
                        
                        <div className="mt-6">
                          <h3 className="text-xl font-semibold mb-2">Crafting Your Script</h3>
                          <p className="text-muted-foreground mb-2">Creating a professional script for:</p>
                          <p className="font-medium text-lg gradient-text mb-4">{selectedTopic?.title}</p>
                          <div className="space-y-2 text-sm text-left">
                            <div className="flex items-center space-x-2">
                              <svg className="text-indigo-500" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.75 12L10.25 14.5L16.25 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                              </svg>
                              <span>Analyzing trending topic</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <svg className="text-indigo-500" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.75 12L10.25 14.5L16.25 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                              </svg>
                              <span>Creating attention-grabbing hook</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="animate-pulse">
                                <div className="h-5 w-5 bg-indigo-500/20 rounded-full"></div>
                              </div>
                              <span>Developing engaging main content<span className="loading-dots"></span></span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                              <span className="text-muted-foreground">Crafting call to action</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                              <span className="text-muted-foreground">Suggesting visual elements</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {scriptError && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 p-4 rounded-md frost-glass border border-red-200 dark:border-red-900/30"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    <span>Error: {scriptError}</span>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Full page transition overlay */}
      <AnimatePresence>
        {isTransitioning && selectedCategory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-center p-10"
            >
              <div className={`inline-flex items-center justify-center size-20 rounded-full bg-gradient-to-br ${getCategoryTheme(selectedCategory).gradient}`}>
                <div className="size-12 rounded-full border-3 border-white/30 border-t-white animate-spin"></div>
              </div>
              <p className="mt-6 text-xl font-medium">Loading {getCategoryLabel(selectedCategory)}</p>
              <p className="text-muted-foreground mt-2">Finding the hottest trending topics...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
