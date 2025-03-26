'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { nanoid } from 'nanoid';

export default function CreateRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Get script and topic from URL parameters
    const script = searchParams.get('script');
    const topic = searchParams.get('topic');
    
    if (!script || !topic) {
      // If parameters are missing, redirect to home
      router.push('/');
      return;
    }
    
    // Generate a unique ID for the media project
    const projectId = nanoid();
    
    // Store script and topic in localStorage for retrieval in the media page
    try {
      localStorage.setItem(`media_${projectId}_script`, script);
      localStorage.setItem(`media_${projectId}_topic`, topic);
      
      // Redirect to the media page with the project ID
      router.push(`/media/${projectId}`);
    } catch (error) {
      console.error('Error storing media data:', error);
      router.push('/');
    }
  }, [router, searchParams]);
  
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="text-lg">Preparing your media project...</p>
      </div>
    </div>
  );
} 