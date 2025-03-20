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
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const slideshowRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Use audio duration to calculate optimal slide duration if not provided
  const slideDuration = useRef(data.slideDuration || 5000); // Default to 5 seconds per slide
  
  // Calculate total duration based on number of slides and slide duration
  const totalDuration = data.images.length * slideDuration.current;
  
  // Adjust slide duration based on audio length once audio is loaded
  useEffect(() => {
    if (audioLoaded && audioDuration > 0 && data.images.length > 0) {
      // Calculate a better slide duration based on the audio length
      const calculatedDuration = (audioDuration * 1000) / data.images.length;
      
      // Only use calculated duration if it's longer than default or provided duration
      // This ensures slides don't change too quickly
      if (calculatedDuration > slideDuration.current) {
        slideDuration.current = calculatedDuration;
        console.log(`Adjusted slide duration to ${slideDuration.current}ms based on audio length`);
      }
    }
  }, [audioLoaded, audioDuration, data.images.length]);
  
  // Update progress bar
  const updateProgress = useCallback(() => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
    
    const startTime = startTimeRef.current;
    const elapsed = currentSlide * slideDuration.current;
    
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
  }, [currentSlide, isPlaying, totalDuration]);
  
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
    
    // Safely pause audio to prevent interruption errors
    if (audioRef.current && playPromiseRef.current) {
      // Only call pause after play promise has resolved
      playPromiseRef.current
        .then(() => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
        })
        .catch(err => {
          console.log("Play was already interrupted, ignoring:", err);
        });
    } else if (audioRef.current) {
      // No active play promise, safe to pause
      audioRef.current.pause();
    }
    
    startTimeRef.current = null;
  }, []);
  
  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleCanPlayThrough = () => {
      setAudioLoaded(true);
      // Store the audio duration for slide timing calculations
      if (audio.duration && !isNaN(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };
    
    const handleLoadedMetadata = () => {
      // Also check duration here as sometimes it's available earlier
      if (audio.duration && !isNaN(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };
    
    const handleEnded = () => {
      // If the audio ends before all slides are shown, we'll continue showing the slides
      // but we'll mark that the audio has ended
      console.log("Audio playback ended");
      
      // Don't stop the slideshow if there are more slides to show
      if (currentSlide < data.images.length - 1) {
        // Continue with the slideshow even though audio has ended
        if (audioRef.current) {
          // We could loop the audio if desired
          // audioRef.current.currentTime = 0;
          // audioRef.current.play().catch(err => console.error("Error replaying audio:", err));
        }
      } else {
        // We're at the last slide and audio ended, complete the slideshow
        if (onComplete) onComplete();
      }
    };
    
    const handleError = (e: Event) => {
      const audioElement = e.target as HTMLAudioElement;
      console.error('Audio error:', audioElement.error);
      setErrorMessage(audioElement.error?.message || "Failed to play audio");
    };
    
    // Add event listeners
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    // Preload the audio
    audio.load();
    
    // Clean up
    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [data.audio, data.images.length, currentSlide, onComplete]);
  
  // Start the slideshow
  const startSlideshow = useCallback(() => {
    if (!data.images.length) return;
    
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    
    // Play the audio with proper promise handling
    if (audioRef.current) {
      // Reset audio position if needed
      if (currentSlide === 0) {
        audioRef.current.currentTime = 0;
      }
      
      // Wait a small delay to ensure audio element is ready
      setTimeout(() => {
        if (audioRef.current) {
          // Save the play promise to handle it properly
          playPromiseRef.current = audioRef.current.play();
          
          playPromiseRef.current.catch(error => {
            console.error('Error playing audio:', error);
            // User interaction may be required for autoplay
            if (error.name === 'NotAllowedError') {
              setErrorMessage("Please interact with the page first to enable audio playback");
              setIsPlaying(false);
              return;
            }
          });
        }
      }, 100);
    }
    
    // Clear any existing intervals first
    cleanup();
    
    // Calculate how much time should pass before changing to the next slide
    const calculateNextSlideDelay = () => {
      if (audioLoaded && audioDuration > 0) {
        // If audio is loaded, base slide timing on audio duration
        const audioDurationMs = audioDuration * 1000;
        const slideCount = data.images.length;
        
        // If audio is shorter than total slideshow duration at default speed
        if (audioDurationMs < slideCount * slideDuration.current) {
          // Keep default timing - audio will end before all slides shown
          return slideDuration.current;
        } else {
          // Distribute audio evenly across slides
          return audioDurationMs / slideCount;
        }
      }
      // Default fallback
      return slideDuration.current;
    };
    
    const actualSlideDuration = calculateNextSlideDelay();
    
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
    }, actualSlideDuration);
    
    // Start progress tracking
    updateProgress();
  }, [data.images.length, cleanup, onComplete, updateProgress, currentSlide, audioLoaded, audioDuration]);
  
  // Stop the slideshow
  const stopSlideshow = useCallback(() => {
    setIsPlaying(false);
    cleanup();
  }, [cleanup]);
  
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
      if (audioRef.current) {
        // Use the playPromise to safely pause
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              if (audioRef.current) audioRef.current.pause();
            })
            .catch(err => {
              console.error("Error while trying to pause:", err);
            });
        } else {
          audioRef.current.pause();
        }
      }
    } else {
      startSlideshow();
    }
  }, [isPlaying, stopSlideshow, startSlideshow]);
  
  // Reset the slideshow when data changes
  useEffect(() => {
    setCurrentSlide(0);
    setProgress(0);
    setAudioLoaded(false);
    setAudioDuration(0);
    setErrorMessage(null);
    stopSlideshow();
    startTimeRef.current = null;
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
      <audio 
        ref={audioRef} 
        src={data.audio} 
        preload="auto" 
        className="hidden" 
        loop={false}
        controls={false}
        crossOrigin="anonymous"
      />
      
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
      
      {/* Audio status indicators */}
      {!audioLoaded && !errorMessage && (
        <div className="w-full py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs text-center">
          <span className="flex items-center justify-center gap-1">
            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading audio...
          </span>
        </div>
      )}
      
      {errorMessage && (
        <div className="w-full py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs text-center">
          <span className="flex items-center justify-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            {errorMessage}
          </span>
        </div>
      )}
      
      {/* Audio duration info when loaded */}
      {audioLoaded && audioDuration > 0 && (
        <div className="w-full py-1 bg-card/30 text-xs text-center">
          <span className="flex items-center justify-center gap-1 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Audio: {Math.floor(audioDuration / 60)}:{Math.floor(audioDuration % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}
      
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
            disabled={!audioLoaded && !errorMessage}
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
            startTimeRef.current = null;
            startSlideshow();
          }}
          className="text-xs"
          disabled={!audioLoaded && !errorMessage}
        >
          Restart
        </Button>
      </div>
    </div>
  );
} 