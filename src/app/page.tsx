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
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

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
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  // Generate random cloud positions for the Ghibli-style background
  const generateClouds = () => {
    return Array(12).fill(0).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 30,
      size: 30 + Math.random() * 100,
      delay: Math.random() * 20,
      duration: 40 + Math.random() * 40,
    }));
  };

  const [clouds] = useState(generateClouds());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    // Check if user authentication has loaded
    if (!isLoaded) {
      toast.error("Authentication is still loading. Please try again.");
      return;
    }

    // Check if user is signed in
    if (!isSignedIn) {
      // Redirect to sign-in page
      router.push('/sign-in');
      return;
    }

    // User is authenticated, navigate to categories
    router.push('/categories');
  };

  // Features showcasing app capabilities with Ghibli-style design
  const features = [
    {
      id: 1,
      title: "Topic Selection",
      description: "Explore diverse categories to find inspiring content ideas for your videos",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
          <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
        </svg>
      ),
      gradient: "from-blue-300 to-cyan-400",
    },
    {
      id: 2,
      title: "AI Script Generation",
      description: "Create compelling short-form video scripts with just a few clicks",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      gradient: "from-purple-300 to-pink-400",
    },
    {
      id: 3,
      title: "Visual Generation",
      description: "Bring your scripts to life with enchanting Studio Ghibli-inspired visuals",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
      gradient: "from-green-300 to-teal-400",
    },
    {
      id: 4,
      title: "Audio Narration",
      description: "Add professional voiceovers to complement your magical visuals",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      ),
      gradient: "from-amber-300 to-orange-400",
    }
  ];

  return (
    <div className="relative min-h-screen ghibli-gradient-bg overflow-hidden">
      {/* Ghibli-inspired subtle texture */}
      <div className="ghibli-texture"></div>
      
      {/* Floating clouds animation */}
      <div className="ghibli-clouds">
        {mounted && clouds.map((cloud) => (
          <div
            key={cloud.id}
            className="ghibli-cloud"
            style={{
              width: `${cloud.size}px`,
              height: `${cloud.size * 0.6}px`,
              left: `${cloud.x}%`,
              top: `${cloud.y}%`,
              animationDelay: `${cloud.delay}s`,
              animationDuration: `${cloud.duration}s`,
            }}
          />
        ))}
      </div>
      
      <Header />
      
      <main className="container mx-auto px-4 pb-20 relative z-10">
        {/* Hero section */}
        <section className="mt-16 md:mt-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="ghibli-title mb-6">Create Magical Short Videos with Studio Ghibli Style</h1>
            <p className="ghibli-subtitle mb-8 max-w-2xl mx-auto">
              Bring your stories to life with AI-generated scripts and enchanting Studio Ghibli-inspired visuals that captivate your audience.
            </p>
                <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Button 
                onClick={handleGetStarted}
                className="ghibli-button"
              >
                Get Started
                  </Button>
                </motion.div>
                  </motion.div>
        </section>

        {/* Features section */}
        <section className="mt-24 md:mt-32">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Create Videos with the Magic of Ghibli</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines AI-powered content creation with the whimsical style of Studio Ghibli animations.
            </p>
                </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
                <motion.div 
                key={feature.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index + 0.4 }}
                className="ghibli-feature-card"
              >
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </motion.div>
            ))}
                  </div>
        </section>
        
        {/* Call to action */}
        <section className="mt-24 md:mt-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="ghibli-card max-w-3xl mx-auto p-10 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Ready to Create Something Magical?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of creators who are using our platform to craft engaging short-form videos with the enchanting Studio Ghibli aesthetic.
            </p>
            <Button 
              onClick={handleGetStarted}
              className="ghibli-button"
              size="lg"
            >
              Start Creating
            </Button>
          </motion.div>
        </section>
      </main>
      
      <Toaster position="bottom-right" />
    </div>
  );
}
