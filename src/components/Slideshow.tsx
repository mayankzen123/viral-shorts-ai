'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SlideshowProps {
  data: {
    images: string[];
    audio: string;
    slideDuration?: number;
  };
  onComplete?: () => void;
  className?: string;
}

export function Slideshow({ data, onComplete, className }: SlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const slideshowRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const slideDuration = data.slideDuration || 5000; // Default to 5 seconds per slide
  
  // Calculate total duration based on number of slides
  const totalDuration = data.images.length * slideDuration;
  
  // Cleanup function to stop all timers and animations
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);
  
  // Start the slideshow
  const startSlideshow = useCallback(() => {
    if (!data.images.length) return;
    
    setIsPlaying(true);
    
    // Play the audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    
    cleanup();
    
    // Set up the interval to change slides
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => {
        const next = prev + 1;
        if (next >= data.images.length) {
          cleanup();
          if (onComplete) onComplete();
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, slideDuration);
    
    // Start progress tracking
    updateProgress();
  }, [data.images, slideDuration, cleanup, onComplete]);
  
  // Stop the slideshow
  const stopSlideshow = useCallback(() => {
    setIsPlaying(false);
    cleanup();
  }, [cleanup]);
  
  // Update progress bar
  const updateProgress = useCallback(() => {
    const startTime = Date.now();
    const elapsed = currentSlide * slideDuration;
    
    const updateProgressBar = () => {
      if (!isPlaying) return;
      
      const now = Date.now();
      const currentElapsed = elapsed + (now - startTime);
      const percent = Math.min((currentElapsed / totalDuration) * 100, 100);
      
      setProgress(percent);
      
      if (percent < 100) {
        animationRef.current = requestAnimationFrame(updateProgressBar);
      }
    };
    
    animationRef.current = requestAnimationFrame(updateProgressBar);
  }, [currentSlide, isPlaying, slideDuration, totalDuration]);
  
  // Navigate to previous slide
  const previousSlide = useCallback(() => {
    stopSlideshow();
    setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
  }, [stopSlideshow]);
  
  // Navigate to next slide
  const nextSlide = useCallback(() => {
    stopSlideshow();
    setCurrentSlide(prev => (prev < data.images.length - 1 ? prev + 1 : prev));
  }, [stopSlideshow, data.images.length]);
  
  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  }, [isPlaying, stopSlideshow, startSlideshow]);
  
  // Reset the slideshow when data changes
  useEffect(() => {
    setCurrentSlide(0);
    setProgress(0);
    stopSlideshow();
  }, [data, stopSlideshow]);
  
  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  if (!data.images.length) {
    return <div className="text-center p-4">No images available for slideshow</div>;
  }
  
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)} ref={slideshowRef}>
      {/* Audio element (hidden) */}
      <audio ref={audioRef} src={data.audio} preload="auto" className="hidden" />
      
      {/* Images container with current slide */}
      <div className="relative aspect-video bg-black">
        {data.images.map((img, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <img
              src={img}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-contain"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        
        {/* Slide count indicator */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
          {currentSlide + 1} / {data.images.length}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-primary transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between p-3 bg-muted/30">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousSlide}
            disabled={currentSlide === 0}
            className="h-8 w-8"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={togglePlayPause}
            className="h-8 w-8"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            disabled={currentSlide === data.images.length - 1}
            className="h-8 w-8"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCurrentSlide(0);
            setProgress(0);
            startSlideshow();
          }}
          className="text-xs"
        >
          Restart
        </Button>
      </div>
    </div>
  );
} 