'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TrendingTopic } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ScriptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TrendingTopic | null;
  script: string | null;
  isLoading: boolean;
  onRegenerateScript: () => void;
}

export function ScriptPreviewModal({
  isOpen,
  onClose,
  topic,
  script,
  isLoading,
  onRegenerateScript
}: ScriptPreviewModalProps) {
  const router = useRouter();
  
  // Function to determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e"; // Green for high scores
    if (score >= 50) return "#f59e0b"; // Amber for medium scores
    return "#ef4444"; // Red for low scores
  };

  // Parse script content if it exists - moved before conditional return
  const scriptParts = React.useMemo(() => {
    if (!script) return { hook: "", mainContent: "", callToAction: "", visualSuggestions: [], isComplete: false };
    
    // Handle cases where the script might be in different formats
    let hook = "", mainContent = "", callToAction = "";
    let visualSuggestions: string[] = [];
    
    try {
      // Try to parse as JSON first to handle structured API responses
      const scriptObj = JSON.parse(script);
      
      if (scriptObj.hook) hook = scriptObj.hook;
      if (scriptObj.mainContent) mainContent = scriptObj.mainContent;
      if (scriptObj.callToAction) callToAction = scriptObj.callToAction;
      
      // Use suggestedVisuals from API response if available
      if (Array.isArray(scriptObj.suggestedVisuals) && scriptObj.suggestedVisuals.length > 0) {
        visualSuggestions = scriptObj.suggestedVisuals;
      }
    } catch (e) {
      // If it's not JSON, continue with the text parsing approach
      // Try to split by double newlines first
      const parts = script.split('\n\n').filter(part => part.trim() !== '');
      
      if (parts.length >= 1) hook = parts[0] || "";
      if (parts.length >= 2) mainContent = parts[1] || "";
      if (parts.length >= 3) callToAction = parts[2] || "";
    }
    
    // If any part has "undefined" as a string, replace it with empty string
    if (hook === "undefined") hook = "";
    if (mainContent === "undefined") mainContent = "";
    if (callToAction === "undefined") callToAction = "";
    
    // If hook is empty but script has content, use the first part of the script
    if (!hook && script.trim()) {
      const lines = script.split('\n').filter(line => line.trim() !== '');
      if (lines.length > 0) hook = lines[0];
    }
    
    // Check if the script has all required parts
    const isComplete = Boolean(hook.trim() && mainContent.trim());
    
    // Generate fallback visuals only if none were provided by the API
    if (visualSuggestions.length === 0) {
      visualSuggestions = [
        `Close-up of ${topic?.title} with dramatic lighting`,
        `Person reacting to ${topic?.title} information`,
        `Data visualization showing ${topic?.title} trends`,
        `Comparison between ${topic?.title} and similar concepts`,
        `Real-world application of ${topic?.title}`
      ];
    }
    
    return { hook, mainContent, callToAction, visualSuggestions, isComplete };
  }, [script, topic]);
  
  // Early return after the hooks
  if (!isOpen) return null;
  
  const handleProceedToMedia = () => {
    if (!topic || !script) return;
    
    // Encode the script and topic for the URL
    const encodedScript = encodeURIComponent(script);
    const encodedTopic = encodeURIComponent(topic.title);
    
    // Navigate to the media creation page with the script and topic
    router.push(`/create?script=${encodedScript}&topic=${encodedTopic}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border bg-card p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Script Preview</h2>
            <p className="text-sm text-muted-foreground">
              Review your AI-generated script before creating your viral short
            </p>
          </div>
          {topic && (
            <div className="flex flex-col items-center justify-center min-w-20">
              <div className="relative w-14 h-14 mb-1">
                {/* Circular background */}
                <div className="absolute inset-0 rounded-full bg-muted"></div>
                
                {/* Colored progress circle */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.91549430918954" 
                    fill="transparent" 
                    stroke="#e6e6e6" 
                    strokeWidth="2" 
                  />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.91549430918954" 
                    fill="transparent" 
                    stroke={getScoreColor(topic.viralScore || 0)} 
                    strokeWidth="2" 
                    strokeDasharray={`${(topic.viralScore || 0) * 0.01 * 100}, 100`}
                    strokeDashoffset="25"
                    className="transition-all duration-1000"
                  />
                </svg>
                
                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{topic.viralScore || 0}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-medium">Viral Score</span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <Tabs defaultValue="script" className="mb-6 max-h-[60vh]">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="script">Script</TabsTrigger>
            <TabsTrigger value="visuals">Visual Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="script" className="rounded-lg border bg-card p-6 overflow-y-auto max-h-[50vh]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center py-12">
                <div className="flex flex-col items-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  <p className="mt-4 text-muted-foreground">Generating your script...</p>
                </div>
              </div>
            ) : !script ? (
              <div className="h-full flex items-center justify-center py-12">
                <p className="text-muted-foreground">No script has been generated yet.</p>
              </div>
            ) : !scriptParts.isComplete ? (
              <div className="h-full flex items-center justify-center py-12 flex-col">
                <div className="flex items-center justify-center text-destructive mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mr-2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <h3 className="text-lg font-medium text-destructive">Script Generation Error</h3>
                </div>
                <p className="text-muted-foreground text-center max-w-md">
                  The script wasn't generated correctly or is missing important sections. 
                  Please try regenerating the script.
                </p>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={onRegenerateScript}
                  className="mt-4"
                >
                  Regenerate Script
                </Button>
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold mb-4">{topic?.title}</h1>
                <div className="my-4 text-sm text-muted-foreground">{topic?.description}</div>
                
                {/* Hook Section */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30 p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">1</div>
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Hook (5-7 seconds)</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{scriptParts.hook}</p>
                </div>
                
                {/* Main Content Section */}
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-100 dark:border-purple-900/30 p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs mr-2">2</div>
                    <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300">Main Content (40-60 seconds)</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{scriptParts.mainContent}</p>
                </div>
                
                {/* Call to Action Section */}
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900/30 p-4">
                  <div className="flex items-center mb-2">
                    <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mr-2">3</div>
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Call to Action (5-7 seconds)</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{scriptParts.callToAction}</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="visuals" className="rounded-lg border bg-card p-6 overflow-y-auto max-h-[50vh]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center py-12">
                <div className="flex flex-col items-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  <p className="mt-4 text-muted-foreground">Generating visual suggestions...</p>
                </div>
              </div>
            ) : !script ? (
              <div className="h-full flex items-center justify-center py-12">
                <p className="text-muted-foreground">Generate a script first to see visual suggestions.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium mb-4">Recommended Visuals</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These suggestions can guide your media creation in the next step.
                </p>
                
                <div className="grid gap-3">
                  {scriptParts.visualSuggestions.map((visual, index) => (
                    <div key={index} className="flex items-start p-3 rounded-lg border bg-muted/30">
                      <div className="mr-3 mt-0.5 h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{visual}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              onClick={onRegenerateScript}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Regenerate Script'}
            </Button>
          </div>
          <Button 
            onClick={handleProceedToMedia} 
            disabled={isLoading || !script || !scriptParts.isComplete}
            className="flex items-center gap-1"
          >
            Continue to Media
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
} 