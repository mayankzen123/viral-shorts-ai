'use client';

import { useState, useCallback, useRef } from 'react';
import { Category, Script } from '@/types';

export function useScriptGeneration() {
  const [script, setScript] = useState<Script | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isGeneratingRef = useRef(false);

  const generateScript = useCallback(async (topic: string, category: Category, description?: string): Promise<Script | null> => {
    // Prevent duplicate script generation calls
    if (isGeneratingRef.current) return null;
    
    setIsGenerating(true);
    isGeneratingRef.current = true;
    setError(null);
    
    try {
      // Make a real API call to the generate-script endpoint
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, category, description }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate script');
      }
      
      const data = await response.json();
      setScript(data);
      setIsGenerating(false);
      isGeneratingRef.current = false;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script');
      setIsGenerating(false);
      isGeneratingRef.current = false;
      return null;
    }
  }, []);

  // Helper functions to generate realistic content
  const generateHook = (topic: string, category: Category): string => {
    const hooks = [
      `Did you know that ${topic} is changing the way we think about ${category}?`,
      `What if I told you that ${topic} could revolutionize ${category} as we know it?`,
      `${topic} has become one of the most talked-about trends in ${category} - here's why.`,
      `The truth about ${topic} might surprise you. Let's dive into this ${category} phenomenon.`,
      `${topic} is trending for a reason. Here's what you need to know about this ${category} breakthrough.`
    ];
    return hooks[Math.floor(Math.random() * hooks.length)];
  };

  return { script, isGenerating, error, generateScript };
} 