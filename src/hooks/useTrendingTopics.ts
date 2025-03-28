'use client';

import { useState, useCallback, useRef } from 'react';
import { Category, TrendingTopicsResponse } from '@/types';

export function useTrendingTopics() {
  const [topics, setTopics] = useState<TrendingTopicsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  // Use useCallback to memoize the function and prevent unnecessary re-renders
  const fetchTrendingTopics = useCallback(async (category: Category) => {
    // Use ref to check loading state to avoid dependency issues
    if (isLoadingRef.current) return null;
    
    try {
      setIsLoading(true);
      isLoadingRef.current = true;
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
      
      setTopics(data);
      setIsLoading(false);
      isLoadingRef.current = false;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
      isLoadingRef.current = false;
      return null;
    }
  }, []); // No dependencies to prevent function recreation and unnecessary API calls

  return {
    topics,
    isLoading,
    error,
    fetchTrendingTopics,
  };
} 