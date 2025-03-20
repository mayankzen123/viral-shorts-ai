'use client';

import { Category } from '@/types';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

// Category data with themes
const CATEGORIES: {
  value: Category;
  label: string;
  icon: React.ReactNode;
  theme: {
    gradient: string;
    background: string;
    border?: string;
  };
}[] = [
  { 
    value: 'technology', 
    label: 'Technology',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>,
    theme: {
      gradient: "from-blue-500 to-indigo-600",
      background: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-100 dark:border-blue-900/30"
    }
  },
  { 
    value: 'science', 
    label: 'Science',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v8.5a2.5 2.5 0 0 1-5 0V8H4c-.5 0-1-.2-1.4-.6A5.5 5.5 0 0 1 9.5 2h.5Z" /><path d="M14 2v8.5a2.5 2.5 0 0 0 5 0V8h1c.5 0 1-.2 1.4-.6A5.5 5.5 0 0 0 14.5 2h-.5Z" /><path d="M5.5 11.5V14l-2 1l2 1v2.5" /><path d="M18.5 11.5V14l2 1l-2 1v2.5" /><path d="M8 22a2 2 0 0 0 2-2v-8.5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v9" /><path d="M16 22a2 2 0 0 1-2-2v-8.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9" /></svg>,
    theme: {
      gradient: "from-purple-500 to-fuchsia-600",
      background: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-100 dark:border-purple-900/30"
    }
  },
  { 
    value: 'news', 
    label: 'News',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>,
    theme: {
      gradient: "from-orange-500 to-amber-600",
      background: "bg-orange-50 dark:bg-orange-950/30",
      border: "border-orange-100 dark:border-orange-900/30"
    }
  },
  { 
    value: 'facts', 
    label: 'Facts',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>,
    theme: {
      gradient: "from-sky-500 to-cyan-600",
      background: "bg-sky-50 dark:bg-sky-950/30",
      border: "border-sky-100 dark:border-sky-900/30"
    }
  },
  { 
    value: 'myths', 
    label: 'Myths & Reality',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" /></svg>,
    theme: {
      gradient: "from-violet-500 to-purple-600",
      background: "bg-violet-50 dark:bg-violet-950/30",
      border: "border-violet-100 dark:border-violet-900/30"
    }
  },
  { 
    value: 'health', 
    label: 'Health & Wellness',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><path d="M17 14v.01" /></svg>,
    theme: {
      gradient: "from-green-500 to-emerald-600",
      background: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-100 dark:border-green-900/30"
    }
  },
  { 
    value: 'entertainment', 
    label: 'Entertainment',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M15.6 10a2 2 0 0 0-2.9-1.8L7 12l5.7 3.8a2 2 0 0 0 2.9-1.8Z" /></svg>,
    theme: {
      gradient: "from-red-500 to-rose-600",
      background: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-100 dark:border-red-900/30"
    }
  },
  { 
    value: 'sports', 
    label: 'Sports',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 4.24 4.24" /><path d="m14.83 9.17 4.24-4.24" /><path d="m14.83 14.83 4.24 4.24" /><path d="m9.17 14.83-4.24 4.24" /><circle cx="12" cy="12" r="4" /></svg>,
    theme: {
      gradient: "from-yellow-500 to-amber-600",
      background: "bg-yellow-50 dark:bg-yellow-950/30",
      border: "border-yellow-100 dark:border-yellow-900/30"
    }
  },
  { 
    value: 'finance', 
    label: 'Finance',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17 12 22l10-5" /><path d="m2 12 10 5 10-5" /><path d="M12 2 2 7l10 5 10-5-10-5Z" /></svg>,
    theme: {
      gradient: "from-emerald-500 to-teal-600",
      background: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-100 dark:border-emerald-900/30"
    }
  },
  { 
    value: 'education', 
    label: 'Education',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
    theme: {
      gradient: "from-blue-400 to-blue-600",
      background: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-100 dark:border-blue-900/30"
    }
  },
  { 
    value: 'space_exploration', 
    label: 'Space Exploration',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/></svg>,
    theme: {
      gradient: "from-indigo-500 to-purple-700",
      background: "bg-indigo-50 dark:bg-indigo-950/30",
      border: "border-indigo-100 dark:border-indigo-900/30"
    }
  },
];

interface CategoryGridProps {
  onCategorySelect: (category: Category) => void;
  isLoading: boolean;
  loadingCategory: Category | null;
}

export function CategoryGrid({ onCategorySelect, isLoading, loadingCategory }: CategoryGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose a Category</h2>
        <p className="text-muted-foreground">Select a category to discover trending topics</p>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {CATEGORIES.map((category) => (
          <motion.div key={category.value} variants={item}>
            <Card 
              className={`cursor-pointer hover:scale-105 transition-transform duration-200 border ${category.theme.border} ${category.theme.background} overflow-hidden group ${loadingCategory === category.value ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
              onClick={() => !isLoading && onCategorySelect(category.value)}
            >
              <div className="p-6 flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.theme.gradient} flex items-center justify-center text-white mb-2 relative`}>
                  {loadingCategory === category.value ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin"></div>
                    </div>
                  ) : category.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{category.label}</h3>
                  <div className={`w-12 h-1 rounded-full bg-gradient-to-r mx-auto mt-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${category.theme.gradient}`}></div>
                  {loadingCategory === category.value && (
                    <p className="text-xs text-muted-foreground mt-2 animate-pulse">Loading topics...</p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 