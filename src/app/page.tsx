'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CategoryGrid } from '@/components/CategoryGrid';
import { TrendingTopicsList } from '@/components/TrendingTopicsList';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { Category, TrendingTopic, Script } from '@/types';
import { useScriptGeneration } from '@/hooks/useScriptGeneration';
import { toast } from 'sonner';
import { ScriptPreviewModal } from '@/components/ScriptPreviewModal';
import { Player } from '@remotion/player';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Category data with themes
  const CATEGORIES = [
    { 
      value: 'technology' as Category, 
      label: 'Technology',
      theme: {
        gradient: "from-blue-500 to-indigo-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
      </svg>
    )
      }
    },
    { 
      value: 'science' as Category, 
      label: 'Science', 
      theme: {
        gradient: "from-purple-500 to-fuchsia-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M10 2v8L4.72 18.47a1 1 0 0 0 .9 1.53h12.76a1 1 0 0 0 .9-1.53L14 10V2"/><path d="M8.24 17c-.4-.6-.24-1.67.4-2.5.63-.83 1.43-1 1.83-.4"/><path d="M15.75 17c.4-.6.25-1.67-.4-2.5-.63-.83-1.42-1-1.82-.4"/>
      </svg>
    )
      }
    },
    { 
      value: 'news' as Category, 
      label: 'News',
      theme: {
        gradient: "from-orange-500 to-amber-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
      </svg>
    )
      }
    },
    { 
      value: 'facts' as Category, 
      label: 'Facts',
      theme: {
        gradient: "from-sky-500 to-cyan-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
      </svg>
    )
  }
},
// Additional categories with themes and icons are defined here
// (Keeping just 4 for brevity in this edit)
];

// Create a component for the animated gradient background
const GradientBackground = () => (
  <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black">
    <div className="absolute inset-0 opacity-20 dark:opacity-30">
      <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-purple-500 to-indigo-500 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
          style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
        <div 
          className="relative left-[calc(50%+11rem)] aspect-[1155/678] w-[36.125rem] translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-500 to-indigo-600 opacity-30 sm:left-[calc(50%+15rem)] sm:w-[72.1875rem]" 
          style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}
        />
      </div>
    </div>
  </div>
);

// Feature item component for the features section
const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="flex flex-col items-center text-center md:items-start md:text-left"
  >
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-semibold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

// Statistic component for the stats section
const Statistic = ({ value, label }: { value: string, label: string }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="flex flex-col items-center justify-center p-4"
  >
    <div className="text-3xl font-bold md:text-4xl lg:text-5xl gradient-text">{value}</div>
    <div className="mt-2 text-sm text-muted-foreground text-center">{label}</div>
  </motion.div>
);

// Update the StepIndicator component to a more modern card-based design
const StepIndicator = ({ 
  currentStep, 
  totalSteps 
}: { 
  currentStep: number;
  totalSteps: number;
}) => {
  // Steps data with icons
  const steps = [
    { 
      label: 'Category',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      )
    },
    { 
      label: 'Topic',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
          <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
          <path d="M12 7c1.5 0 2.5-1.5 2.5-1.5" />
        </svg>
      )
    },
    { 
      label: 'Preview',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
          <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" />
          <path d="M9 17v4" />
          <path d="M15 17v4" />
          <path d="M9 21h6" />
        </svg>
      )
    },
    { 
      label: 'Media',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
          <path d="m22 8-6 4 6 4V8Z" />
          <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
        </svg>
      )
    }
  ];

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="my-8">
        <div className="relative max-w-3xl mx-auto px-4">
          <div className="h-16"></div>
        </div>
      </div>
    );
  }

  const isLight = theme === 'light';

  return (
    <div className="my-8">
      <div className="relative max-w-3xl mx-auto px-4">
        {/* Grid of step cards */}
        <div className="grid grid-cols-4 gap-4 relative z-10">
          {steps.map((step, index) => {
            // Determine step status
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isFuture = index > currentStep;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`
                  relative flex flex-col items-center p-4 rounded-lg border
                  ${isCompleted 
                    ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' 
                    : isCurrent 
                      ? 'border-indigo-400 dark:border-indigo-400 bg-indigo-100/50 dark:bg-indigo-800/20' 
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30'}
                  ${isCurrent ? 'shadow-lg' : ''}
                `}
              >
                {/* Pulsing animation for current step */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-indigo-500 dark:border-indigo-400"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ 
                      opacity: [0.7, 0, 0.7], 
                      scale: [0.85, 1.05, 0.85],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  />
                )}
                
                {/* Status indicator */}
                {isCompleted ? (
                  <div className="mb-2 size-8 rounded-full bg-indigo-500 dark:bg-indigo-400 flex items-center justify-center text-white dark:text-black shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                ) : (
                  <div className={`
                    mb-2 size-8 rounded-full flex items-center justify-center shadow-sm
                    ${isCurrent 
                      ? 'bg-indigo-500 dark:bg-indigo-400 text-white dark:text-black border-2 border-white dark:border-black' 
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'}
                  `}>
                    <span className="text-xs font-semibold">{index + 1}</span>
                  </div>
                )}
                
                {/* Step label */}
                <span className={`
                  text-sm font-medium text-center
                  ${isCompleted 
                    ? 'text-indigo-600 dark:text-indigo-300' 
                    : isCurrent 
                      ? 'text-indigo-600 dark:text-indigo-300' 
                      : 'text-neutral-500 dark:text-neutral-400'}
                `}>
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Theme switcher component
const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show the theme switcher after component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme('light')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Main Home component
export default function Home() {
  const [activeView, setActiveView] = useState<'landing' | 'categories' | 'topics'>('landing');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null);
  const [scriptPreviewOpen, setScriptPreviewOpen] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [generatingTopicId, setGeneratingTopicId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Add ref for the video element and demo section
  const videoRef = useRef<HTMLVideoElement>(null);
  const demoSectionRef = useRef<HTMLElement>(null);
  
  // Custom hooks for trending topics and script generation
  const { topics, isLoading, error: topicsError, fetchTrendingTopics } = useTrendingTopics();
  const { script, isGenerating: scriptIsGenerating, error: scriptError, generateScript: generateScriptHook } = useScriptGeneration();

  // Handle play demo video
  const handlePlayDemo = () => {
    // Scroll to the demo section
    demoSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Play the video after a short delay to ensure scroll completes
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
          // Handle autoplay restrictions if needed
          toast.error('Could not autoplay video. Please click the play button.');
        });
      }
    }, 500);
  };

  // Handle category selection
  const handleCategorySelect = async (category: Category) => {
    setSelectedCategory(category);
    setIsGenerating(true);
    
    try {
      await fetchTrendingTopics(category);
      setActiveView('topics');
    } catch (error) {
      toast.error('Failed to fetch trending topics');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle back to categories
  const handleBackToCategories = () => {
    setActiveView('categories');
    setSelectedCategory(null);
  };

  // Handle back to landing
  const handleBackToLanding = () => {
    setActiveView('landing');
  };

  // Helper function to calculate current step
  const getCurrentStep = () => {
    if (activeView === 'landing') return 0;
    if (activeView === 'categories') return 1;
    if (activeView === 'topics' && !scriptPreviewOpen) return 2;
    return 3;
  };

  // Custom function to generate a script (different from the hook)
  const generateScriptForTopic = async (topic: TrendingTopic) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setGeneratingTopicId(topic.title);
    setSelectedTopic(topic);
    setScriptPreviewOpen(true);
    
    try {
      // If there's a selectedCategory, use the hook
      if (selectedCategory) {
        await generateScriptHook(topic.title, selectedCategory, topic.description);
        // Add null checks and default values to prevent 'undefined' text
        const hookText = script?.hook || ""; 
        const mainContentText = script?.mainContent || "";
        const callToActionText = script?.callToAction || "";
        
        // Only add separators if content exists
        let scriptText = hookText;
        if (mainContentText) {
          scriptText += (scriptText ? "\n\n" : "") + mainContentText;
        }
        if (callToActionText) {
          scriptText += (scriptText ? "\n\n" : "") + callToActionText;
        }
        
        setGeneratedScript(scriptText);
      } else {
        // Simulate API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fallback script generation if no category
        const demoScript = `# ${topic.title}\n\nHey there! Did you know that ${topic.title} is trending right now?\n\nHere are some facts about ${topic.title}:\n- It started trending on ${topic.dateStarted}\n- It has a viral score of ${topic.viralScore}\n- ${topic.description}\n\nMake sure to like and follow for more trending content!`;
        
        setGeneratedScript(demoScript);
      }
    } catch (error) {
      toast.error('Failed to generate script');
      console.error('Failed to generate script:', error);
      setGeneratedScript(null);
    } finally {
      setIsGenerating(false);
      setGeneratingTopicId(null);
    }
  };

  // Update the handleTopicSelect function to generate a script
  const handleTopicSelect = (topic: TrendingTopic, index: number) => {
    // If already generating, don't allow another selection
    if (isGenerating) return;
    
    generateScriptForTopic(topic);
  };

  // Add the function for regenerating scripts
  const handleRegenerateScript = () => {
    if (selectedTopic) {
      generateScriptForTopic(selectedTopic);
    }
  };

  // Add the function for closing the preview modal
  const handleCloseScriptPreview = () => {
    setScriptPreviewOpen(false);
    setGeneratedScript(null);
  };

  // Helper to get category label
  const getCategoryLabel = (category: Category | null) => {
    if (!category) return '';
    return CATEGORIES.find(c => c.value === category)?.label || '';
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <GradientBackground />
      <ThemeSwitcher />

      <AnimatePresence mode="wait">
        {activeView === 'landing' && (
          <motion.main 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            {/* Hero Section */}
            <section className="relative py-12 lg:py-24">
              <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center text-center">
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl gradient-text mb-6"
                  >
                    Create Viral Short Videos with AI
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8"
                  >
                    Transform trending topics into engaging short-form videos in minutes. 
                    Generate scripts, images, and audio narration all powered by AI.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md"
                      onClick={() => setActiveView('categories')}
                    >
                      Get Started
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={handlePlayDemo}
                    >
                      Watch Demo
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4">
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="10 8 16 12 10 16 10 8" />
                      </svg>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* App Preview/Demo Section */}
            <section ref={demoSectionRef} className="py-12 lg:py-24">
              <div className="container px-4 md:px-6 mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  viewport={{ once: true }}
                  className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl shadow-xl"
                >
                  {/* Enhanced video container with better contrast for dark theme */}
                  <div className="relative aspect-video w-full h-full bg-neutral-900 border border-neutral-700 rounded-2xl overflow-hidden">
                    {/* Subtle gradient overlay for visual interest */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 pointer-events-none z-0"></div>
                    
                    <video 
                      ref={videoRef}
                      src="/demo.mp4"
                      className="w-full h-full relative z-10"
                      controls
                      loop
                      playsInline
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain' 
                      }}
                    />
                    
                    {/* Top and bottom gradients for better framing */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-neutral-900/60 to-transparent pointer-events-none z-20"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-neutral-900/60 to-transparent pointer-events-none z-20"></div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-12 lg:py-24">
              <div className="container px-4 md:px-6 mx-auto">
                <div className="mb-12 text-center">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
                  >
                    Powerful Features
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
                  >
                    Everything you need to create engaging short-form videos in minutes
                  </motion.p>
                  </div>
                  
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <FeatureItem 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <line x1="10" y1="9" x2="8" y2="9"/>
                      </svg>
                    }
                    title="AI Script Generation"
                    description="Generate engaging scripts optimized for short-form content with customizable hooks, main content, and calls to action."
                  />
                  <FeatureItem 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polygon points="21 15 16 10 5 21"/>
                      </svg>
                    }
                    title="Visual Generation"
                    description="Create AI-generated images based on script suggestions to visually enhance your content and boost engagement."
                  />
                  <FeatureItem 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M12 2c-1.7 0-3 1.2-3 2.6v6.8c0 1.4 1.3 2.6 3 2.6s3-1.2 3-2.6V4.6C15 3.2 13.7 2 12 2z"/>
                        <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18.5V22"/>
                      </svg>
                    }
                    title="AI Voice Narration"
                    description="Choose from multiple AI voices to narrate your content with natural-sounding speech and expressive delivery."
                  />
                  <FeatureItem 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <line x1="8" y1="6" x2="21" y2="6"/>
                        <line x1="8" y1="12" x2="21" y2="12"/>
                        <line x1="8" y1="18" x2="21" y2="18"/>
                        <line x1="3" y1="6" x2="3.01" y2="6"/>
                        <line x1="3" y1="12" x2="3.01" y2="12"/>
                        <line x1="3" y1="18" x2="3.01" y2="18"/>
                      </svg>
                    }
                    title="Trending Topics"
                    description="Discover the hottest topics across various categories with popularity metrics to create timely, relevant content."
                  />
                  <FeatureItem 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="m22 8-6 4 6 4V8Z"/>
                        <rect x="2" y="6" width="14" height="12" rx="2" ry="2"/>
                                  </svg>
                    }
                    title="Slideshow Creation"
                    description="Combine images and audio into professional slideshows that are ready to share on social media platforms."
                  />
                  <FeatureItem 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M8 17a5 5 0 0 1 0-10h8a5 5 0 0 1 0 10h-8"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                                  </svg>
                    }
                    title="One-Click Download"
                    description="Export and download your finished videos with a single click for immediate sharing across platforms."
                  />
                                </div>
                          </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 lg:py-24 bg-muted/50">
              <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <Statistic value="10+" label="Categories" />
                  <Statistic value="500+" label="Trending Topics" />
                  <Statistic value="4" label="AI Voice Options" />
                  <Statistic value="60s" label="Average Creation Time" />
                </div>
              </div>
            </section>

            {/* Trending Topics Preview */}
            <section className="py-12 lg:py-24">
              <div className="container px-4 md:px-6 mx-auto">
                <div className="mb-12 text-center">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
                  >
                    Trending Right Now
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
                  >
                    Create content around the topics people are talking about today
                  </motion.p>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="group relative overflow-hidden rounded-xl border bg-background shadow-md transition-all hover:shadow-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="p-6">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            {['Technology', 'Science', 'Health', 'Finance', 'Entertainment', 'Education'][i % 6]}
                          </span>
                          <span className="flex items-center text-xs font-medium text-orange-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-3 w-3">
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                              </svg>
                            Trending
                          </span>
                        </div>
                        <h3 className="mb-2 text-xl font-semibold transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {[
                            "AI's Impact on Healthcare Innovation",
                            "Sustainable Energy Breakthroughs",
                            "Mental Health in the Digital Age",
                            "Microinvesting Platforms Comparison",
                            "The Science of Viral Content",
                            "Learning in the Metaverse"
                          ][i % 6]}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {[
                            "How artificial intelligence is transforming patient care and medical research.",
                            "Latest developments in renewable energy technologies and their global impact.",
                            "Strategies for maintaining mental wellbeing in an always-connected world.",
                            "Analysis of popular microinvesting apps and their benefits for new investors.",
                            "The psychological factors that make content go viral across platforms.",
                            "Exploring new educational opportunities in virtual reality environments."
                          ][i % 6]}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-12 text-center">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setActiveView('categories')}
                    className="group"
                  >
                    Explore All Trending Topics
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Button>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 lg:py-24">
              <div className="container px-4 md:px-6 mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  viewport={{ once: true }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-12 shadow-xl sm:px-12 sm:py-16 md:px-16 md:py-20"
                >
                  <div className="relative z-10 mx-auto max-w-3xl text-center text-white">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                      Ready to Create Your First Viral Video?
                    </h2>
                    <p className="mt-6 text-lg">
                      Start generating engaging content in minutes with our AI-powered platform. 
                      No design or video editing skills required.
                    </p>
                    <div className="mt-8">
                      <Button 
                        size="lg" 
                        className="bg-white text-indigo-600 hover:bg-white/90"
                        onClick={() => setActiveView('categories')}
                      >
                        Get Started Now
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4">
                          <polyline points="9 18 15 12 9 6" />
                    </svg>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                  <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                </motion.div>
              </div>
            </section>
          </motion.main>
        )}

        {activeView === 'categories' && (
          <motion.main 
            key="categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <div className="container px-4 py-8 md:px-6 mx-auto">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToLanding}
                  className="mr-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back
                </Button>
                <h2 className="text-3xl font-bold">Choose a Category</h2>
              </div>
              
              <StepIndicator currentStep={1} totalSteps={4} />
              
              <div className="mt-8 text-center mb-10">
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Select a category to discover trending topics
                </p>
        </div>
              
              <CategoryGrid 
                onCategorySelect={handleCategorySelect} 
                loadingCategory={isGenerating ? selectedCategory : null}
                isLoading={isLoading}
              />
            </div>
          </motion.main>
        )}

        {activeView === 'topics' && selectedCategory && (
          <motion.main 
            key="topics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <div className="container px-4 py-8 md:px-6 mx-auto">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToCategories}
                  className="mr-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back
                </Button>
                <h2 className="text-3xl font-bold">
                  <span className="gradient-text">{getCategoryLabel(selectedCategory)}</span> Trending Topics
                </h2>
              </div>
              
              <StepIndicator currentStep={scriptPreviewOpen ? 3 : 2} totalSteps={4} />
              
              <TrendingTopicsList
                topics={topics}
                isLoading={isLoading}
                onTopicSelect={(topic, index) => handleTopicSelect(topic, index)}
                selectedCategory={selectedCategory}
                error={topicsError}
                isGenerating={isGenerating}
                generatingTopicId={generatingTopicId}
              />
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Script Preview Modal */}
      <ScriptPreviewModal 
        isOpen={scriptPreviewOpen}
        onClose={handleCloseScriptPreview}
        topic={selectedTopic}
        script={generatedScript}
        isLoading={isGenerating}
        onRegenerateScript={handleRegenerateScript}
      />

      <footer className="border-t py-8 md:py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center space-x-2">
              <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-4 h-4"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
              <span className="text-xl font-bold">ShortScript</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ShortScript. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
