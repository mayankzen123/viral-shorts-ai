'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Category } from '@/types';
import { motion } from 'framer-motion';
import React from 'react';

const CATEGORIES: { value: Category; label: string; icon: React.ReactNode }[] = [
  { 
    value: 'technology', 
    label: 'Technology',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
  },
  { 
    value: 'science', 
    label: 'Science',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v8.5a2.5 2.5 0 0 1-5 0V8H4c-.5 0-1-.2-1.4-.6A5.5 5.5 0 0 1 9.5 2h.5Z" /><path d="M14 2v8.5a2.5 2.5 0 0 0 5 0V8h1c.5 0 1-.2 1.4-.6A5.5 5.5 0 0 0 14.5 2h-.5Z" /><path d="M5.5 11.5V14l-2 1l2 1v2.5" /><path d="M18.5 11.5V14l2 1l-2 1v2.5" /><path d="M8 22a2 2 0 0 0 2-2v-8.5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v9" /><path d="M16 22a2 2 0 0 1-2-2v-8.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9" /></svg>
  },
  { 
    value: 'news', 
    label: 'News',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
  },
  { 
    value: 'facts', 
    label: 'Facts',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
  },
  { 
    value: 'myths', 
    label: 'Myths vs Reality',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" /></svg>
  },
  { 
    value: 'health', 
    label: 'Health & Wellness',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><path d="M17 14v.01" /></svg>
  },
  { 
    value: 'entertainment', 
    label: 'Entertainment',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M15.6 10a2 2 0 0 0-2.9-1.8L7 12l5.7 3.8a2 2 0 0 0 2.9-1.8Z" /></svg>
  },
  { 
    value: 'sports', 
    label: 'Sports',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 4.24 4.24" /><path d="m14.83 9.17 4.24-4.24" /><path d="m14.83 14.83 4.24 4.24" /><path d="m9.17 14.83-4.24 4.24" /><circle cx="12" cy="12" r="4" /></svg>
  },
  { 
    value: 'finance', 
    label: 'Finance',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17 12 22l10-5" /><path d="m2 12 10 5 10-5" /><path d="M12 2 2 7l10 5 10-5-10-5Z" /></svg>
  },
  { 
    value: 'education', 
    label: 'Education',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
  },
  { 
    value: 'space_exploration', 
    label: 'Space Exploration',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/></svg>
  },
];

interface CategorySelectorProps {
  onCategorySelect: (category: Category) => void;
  isLoading: boolean;
  initialCategory?: Category;
}

export function CategorySelector({ onCategorySelect, isLoading, initialCategory }: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');

  useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleSelect = (value: string) => {
    setSelectedCategory(value as Category);
  };

  const handleSubmit = () => {
    if (selectedCategory) {
      onCategorySelect(selectedCategory);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md frost-glass card-hover mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold">Select a Topic Category</CardTitle>
          <CardDescription>
            Choose a category to discover trending topics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select 
            value={selectedCategory} 
            onValueChange={handleSelect}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              {CATEGORIES.map((category) => (
                <SelectItem 
                  key={category.value} 
                  value={category.value}
                  className="flex items-center cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">{category.icon}</span>
                    <span>{category.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleSubmit} 
            className="w-full btn-hover-effect bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0" 
            disabled={!selectedCategory || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading Trends...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                </svg>
                <span>Discover Trending Topics</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
} 