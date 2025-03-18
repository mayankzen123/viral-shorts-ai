'use client';

import { useState, useCallback } from 'react';
import { Category, Script } from '@/types';

export function useScriptGeneration() {
  const [script, setScript] = useState<Script | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateScript = useCallback(async (topic: string, category: Category): Promise<Script | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // For demo purposes, instead of making an API call, we'll return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          // Generate a realistic mock script based on the topic and category
          const mockScript: Script = {
            hook: generateHook(topic, category),
            mainContent: generateMainContent(topic, category),
            callToAction: generateCallToAction(topic, category),
            suggestedVisuals: generateVisuals(topic, category),
          };
          
          setScript(mockScript);
          setIsGenerating(false);
          resolve(mockScript);
        }, 2000);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script');
      setIsGenerating(false);
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

  const generateMainContent = (topic: string, category: Category): string => {
    return `${topic} has been gaining significant attention in the ${category} world recently. Experts are noticing three major developments:

First, we're seeing unprecedented innovation in how ${topic} is being applied to solve real-world problems. This has led to increased adoption across various sectors.

Second, the data shows that engagement with ${topic} has increased by approximately 47% in the last quarter alone. This indicates a growing interest from both consumers and professionals.

Finally, new research suggests that ${topic} might be even more impactful than initially thought, with potential applications we hadn't considered before.

What makes this trend particularly interesting is how quickly it's evolving and the diverse ways people are engaging with it.`;
  };

  const generateCallToAction = (topic: string, category: Category): string => {
    const ctas = [
      `If you found this information about ${topic} valuable, make sure to follow for more ${category} insights.`,
      `Want to learn more about ${topic}? Drop a comment below and I'll cover more ${category} trends in my next video.`,
      `Stay ahead of the curve by subscribing for more updates on ${topic} and other trending ${category} topics.`,
      `Like and share if you learned something new about ${topic} today! More ${category} content coming soon.`,
      `Don't miss out on future ${category} trends like ${topic} - hit that follow button now!`
    ];
    return ctas[Math.floor(Math.random() * ctas.length)];
  };

  const generateVisuals = (topic: string, category: Category): string[] => {
    return [
      `Opening shot: Modern graphic showing "${topic}" text with animated background`,
      `B-roll: Close-up shots of people engaging with ${category}-related activities`,
      `Data visualization: Animated chart showing the growth trend of ${topic}`,
      `Expert clips: Short interview segments with ${category} professionals`,
      `Screen recording: Demonstration of ${topic} in action`,
      `Closing shot: Call-to-action graphic with social media handles`
    ];
  };

  return { script, isGenerating, error, generateScript };
} 