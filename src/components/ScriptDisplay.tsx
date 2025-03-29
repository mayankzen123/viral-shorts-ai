'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Script, TrendingTopic } from '@/types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

interface ScriptDisplayProps {
  script: Script;
  topic?: TrendingTopic | null;
  isLoading?: boolean;
  error?: string | null;
  onRegenerate?: () => void;
}

export function ScriptDisplay({ script, topic, isLoading = false, error = null, onRegenerate }: ScriptDisplayProps) {
  const MotionCard = motion(Card);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  
  // Function to copy script to clipboard
  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(`${section} copied to clipboard`);
      },
      () => {
        toast.error("Failed to copy text");
      }
    );
  };
  
  // Function to proceed to media generation page
  const proceedToMediaGeneration = () => {
    // Check if user authentication has loaded
    if (!isLoaded) {
      toast.error("Authentication is still loading. Please try again.");
      return;
    }

    // Check if user is signed in
    if (!isSignedIn) {
      toast.error("Please sign in to access media creation.");
      // Redirect to sign-in page
      router.push('/sign-in');
      return;
    }
    
    // Save the script and topic to localStorage for the media page to access
    localStorage.setItem('selectedScript', JSON.stringify(script));
    if (topic) {
      localStorage.setItem('selectedTopic', JSON.stringify(topic));
    }
    
    // Navigate to the media generation page
    router.push('/media/script');
  };
  
  if (isLoading) {
    return (
      <MotionCard 
        className="w-full frost-glass p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="py-8 flex flex-col items-center">
          <div className="mb-4">
            <div className="size-16 rounded-full mx-auto flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Generating Script</h3>
          <p className="text-muted-foreground">Please wait while we craft your content...</p>
        </div>
      </MotionCard>
    );
  }
  
  if (error) {
    return (
      <MotionCard 
        className="w-full frost-glass p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="py-8 flex flex-col items-center">
          <div className="mb-4">
            <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Error Generating Script</h3>
          <p className="text-muted-foreground mb-4">{error || "An error occurred while generating your script. Please try again."}</p>
        </div>
      </MotionCard>
    );
  }
  
  return (
    <MotionCard 
      className="w-full frost-glass overflow-hidden max-h-[70vh] lg:max-h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="sticky top-0 z-10 bg-card border-b px-6 py-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-start justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              {topic?.title || "Generated Script"}
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-1 text-xs"
                onClick={() => copyToClipboard(`${script.hook}\n\n${script.mainContent}\n\n${script.callToAction}`, "Complete script")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                <span>Copy All</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">A professional short video script optimized for engagement</p>
            {topic && (
              <div className="flex items-center">
                <span className="text-xs font-medium mr-2">Viral Score: </span>
                <div className="h-2 w-16 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mr-1">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    style={{ width: `${topic.viralScore}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{topic.viralScore}</span>
              </div>
            )}
          </div>
          
          {/* Added Proceed to Media Creation Button at the top */}
          <div className="pt-2">
            <Button 
              onClick={proceedToMediaGeneration}
              size="sm"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <div>
                  <span className="font-medium">Proceed to Media Creation</span>
                  <span className="hidden sm:inline ml-1 text-xs opacity-90">- Generate Images & Audio</span>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 80px)' }}>
        <CardContent className="px-6 py-4">
          <div className="space-y-6">
            {/* Script Hook Section */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30 overflow-hidden">
              <div className="border-b border-blue-100 dark:border-blue-900/30 bg-blue-100/50 dark:bg-blue-900/30 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">1</div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Opening Hook</h3>
                </div>
                <div className="flex items-center text-xs text-blue-800/70 dark:text-blue-300/70">
                  <span>5-7 seconds</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={() => copyToClipboard(script.hook, "Hook")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">{script.hook}</p>
              </div>
            </div>
            
            {/* Main Content Section */}
            <div className="rounded-lg border overflow-hidden">
              <div className="border-b bg-muted/50 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs mr-2">2</div>
                  <h3 className="text-sm font-medium">Main Content</h3>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>40-60 seconds</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={() => copyToClipboard(script.mainContent, "Main content")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm">{script.mainContent}</p>
              </div>
            </div>
            
            {/* Call to Action Section */}
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900/30 overflow-hidden">
              <div className="border-b border-green-100 dark:border-green-900/30 bg-green-100/50 dark:bg-green-900/30 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mr-2">3</div>
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Call to Action</h3>
                </div>
                <div className="flex items-center text-xs text-green-800/70 dark:text-green-300/70">
                  <span>5-7 seconds</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={() => copyToClipboard(script.callToAction, "Call to action")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">{script.callToAction}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 mb-2">
            <p className="text-xs text-muted-foreground mb-2">Estimated Duration: 60-90 seconds</p>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="flex h-full">
                <div className="h-full bg-blue-500 w-[10%]" title="Hook: 5-7 seconds"></div>
                <div className="h-full bg-indigo-500 w-[75%]" title="Main Content: 40-60 seconds"></div>
                <div className="h-full bg-green-500 w-[15%]" title="Call to Action: 5-7 seconds"></div>
              </div>
            </div>
          </div>
          
          {/* Visual Suggestions Preview */}
          <div className="mt-8 mb-2">
            <h3 className="text-base font-medium text-primary mb-3">
              Visual Suggestions
            </h3>
            <div className="bg-muted/10 rounded-lg border p-4">
              <ul className="space-y-2">
                {script.suggestedVisuals.map((visual, index) => (
                  <li key={index} className="flex items-baseline">
                    <span className="inline-flex items-center justify-center size-5 bg-primary/10 text-primary rounded-full text-xs font-medium mr-2 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm">{visual}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </div>
    </MotionCard>
  );
} 