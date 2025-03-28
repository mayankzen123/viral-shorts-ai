'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { CategoryGrid } from '@/components/CategoryGrid';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { Category } from '@/types';

export default function CategoriesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState<Category | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategorySelect = (category: Category) => {
    setIsLoading(true);
    setLoadingCategory(category);
    
    // Simulate a brief loading state before navigation
    setTimeout(() => {
      router.push(`/topics/${category}`);
    }, 500);
  };

  return (
    <div className="relative min-h-screen ghibli-gradient-bg">
      {/* Ghibli-inspired subtle texture */}
      <div className="ghibli-texture"></div>
      
      <Header />
      
      <main className="container mx-auto px-4 pb-20 pt-8">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {mounted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <CategoryGrid 
                  onCategorySelect={handleCategorySelect} 
                  isLoading={isLoading}
                  loadingCategory={loadingCategory}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <Toaster position="bottom-right" />
    </div>
  );
} 