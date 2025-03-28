'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { TrendingTopicsList } from '@/components/TrendingTopicsList';
import { ScriptDisplay } from '@/components/ScriptDisplay';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { useScriptGeneration } from '@/hooks/useScriptGeneration';
import { Category, TrendingTopic } from '@/types';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function TopicsPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.category as Category;
  
  const [mounted, setMounted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'topics' | 'script'>('topics');
  const [scriptGenerationState, setScriptGenerationState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const { 
    topics,
    isLoading: isLoadingTopics,
    error: topicsError,
    fetchTrendingTopics
  } = useTrendingTopics();
  
  const {
    script,
    isGenerating,
    error: scriptError,
    generateScript
  } = useScriptGeneration();

  useEffect(() => {
    setMounted(true);
    
    // Fetch trending topics for the selected category when component mounts
    if (category && !topics?.topics?.length && !topics?.trendingTopics?.length) {
      fetchTrendingTopics(category).catch(error => {
        console.error("Error fetching trending topics:", error);
        toast.error("Failed to load trending topics. Please try again.");
      });
    }
  }, [category, fetchTrendingTopics, topics]);

  const handleTopicSelect = (topic: TrendingTopic) => {
    setSelectedTopic(topic.title);
    setScriptGenerationState('loading');
    
    generateScript(topic.title, category)
      .then(() => {
        setScriptGenerationState('success');
        setDisplayMode('script');
      })
      .catch(() => {
        setScriptGenerationState('error');
        toast.error("Failed to generate script. Please try again.");
      });
  };

  const handleBackToTopics = () => {
    setDisplayMode('topics');
    setSelectedTopic(null);
    setScriptGenerationState('idle');
  };

  const handleBackToCategories = () => {
    router.push('/categories');
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen ghibli-gradient-bg">
      {/* Ghibli-inspired subtle texture */}
      <div className="ghibli-texture"></div>
      
      <Header />
      
      <main className="container mx-auto px-4 pb-20 pt-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToCategories}
              className="mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Categories
            </Button>
            
            {displayMode === 'script' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToTopics}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Topics
              </Button>
            )}
          </div>
          
          <AnimatePresence mode="wait">
            {displayMode === 'topics' ? (
              <motion.div
                key="topics"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold capitalize mb-2">{category.replace('_', ' ')} Topics</h1>
                  <p className="text-muted-foreground">Trending topics in {category.replace('_', ' ')}</p>
                </div>
                
                {isLoadingTopics ? (
                  <div className="py-12 flex justify-center items-center">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : topicsError ? (
                  <div className="py-12 text-center">
                    <p className="text-red-500 mb-4">Failed to load trending topics</p>
                    <Button onClick={() => fetchTrendingTopics(category)}>Try Again</Button>
                  </div>
                ) : (
                  <TrendingTopicsList 
                    topics={topics?.topics || topics?.trendingTopics || []} 
                    onTopicSelect={handleTopicSelect} 
                    category={category}
                    isGenerating={isGenerating}
                    scriptGenerationState={scriptGenerationState}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="script"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">{selectedTopic}</h1>
                  <p className="text-muted-foreground capitalize">{category.replace('_', ' ')} content</p>
                </div>
                
                <ScriptDisplay 
                  script={script || { hook: '', mainContent: '', callToAction: '', suggestedVisuals: [] }} 
                  isLoading={isGenerating}
                  error={scriptError}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <Toaster position="bottom-right" />
    </div>
  );
} 