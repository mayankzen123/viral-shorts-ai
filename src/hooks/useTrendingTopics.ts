'use client';

import { useState, useCallback } from 'react';
import { Category, TrendingTopicsResponse } from '@/types';

export function useTrendingTopics() {
  const [topics, setTopics] = useState<TrendingTopicsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize the function and prevent unnecessary re-renders
  const fetchTrendingTopics = useCallback(async (category: Category) => {
    // Check if we're already loading to prevent duplicate requests
    if (isLoading) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Make an API call to our backend endpoint
      const response = await fetch('/api/trending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch trending topics');
      }
      
      const data = await response.json();
      
      // Validate data structure but only use real data
      if (!data.trendingTopics || !Array.isArray(data.trendingTopics)) {
        console.warn("API returned invalid trending topics structure");
        // Return empty structure but maintain expected format
        const emptyResponse = { trendingTopics: [] };
        setTopics(emptyResponse);
        setIsLoading(false);
        return emptyResponse;
      }
      
      setTopics(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching trending topics:", err);
      // Return empty structure instead of mock data
      const emptyResponse = { trendingTopics: [] };
      setTopics(emptyResponse);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
      return emptyResponse;
    }
  }, [isLoading]); // Only re-create the function when isLoading changes

  return {
    topics,
    isLoading,
    error,
    fetchTrendingTopics,
  };
} 