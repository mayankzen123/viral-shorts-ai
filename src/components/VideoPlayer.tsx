'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  data: {
    images: string[];
    audio: string;
  };
  onComplete?: () => void;
  className?: string;
}

export function VideoPlayer({ data, onComplete, className }: VideoPlayerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const slidesRef = useRef<{ time: number; image: string }[]>([]);

  // Calculate slide timings based on audio duration when it's loaded
  useEffect(() => {
    if (!audioRef.current || !data.images.length) return;

    const calculateSlideTiming = () => {
      if (!audioRef.current) return;
      const audioDuration = audioRef.current.duration;
      
      if (isNaN(audioDuration)) {
        // Audio duration not available yet
        return;
      }
      
      setDuration(audioDuration);
      
      // Calculate even distribution of slides across audio duration
      const slideIntervalMs = audioDuration / data.images.length;
      
      slidesRef.current = data.images.map((image, index) => ({
        time: index * slideIntervalMs,
        image
      }));
      
      console.log('Slide timing calculated', slidesRef.current);
    };

    // Listen for when audio metadata is loaded to get duration
    const handleLoadedMetadata = () => {
      calculateSlideTiming();
    };

    // Set up listeners
    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // If duration is already available, calculate immediately
    if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      calculateSlideTiming();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    };
  }, [data.images]);
  
  // Handle audio timing updates to sync with slides
  useEffect(() => {
    if (!audioRef.current) return;
    
    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      
      const currentAudioTime = audioRef.current.currentTime;
      setCurrentTime(currentAudioTime);
      
      // Find which slide should be displayed at this time
      if (slidesRef.current.length > 0) {
        for (let i = slidesRef.current.length - 1; i >= 0; i--) {
          if (currentAudioTime >= slidesRef.current[i].time) {
            setCurrentSlide(i);
            break;
          }
        }
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onComplete) onComplete();
    };
    
    const handleCanPlayThrough = () => {
      setLoadingState('loaded');
    };
    
    const handleError = (e: Event) => {
      const audioElement = e.target as HTMLAudioElement;
      console.error('Audio error:', audioElement.error);
      setLoadingState('error');
      setErrorMessage(audioElement.error?.message || "Failed to play audio");
    };
    
    // Add event listeners
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('ended', handleEnded);
    audioRef.current.addEventListener('canplaythrough', handleCanPlayThrough);
    audioRef.current.addEventListener('error', handleError);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('canplaythrough', handleCanPlayThrough);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
  }, [onComplete]);
  
  // Play and pause controls
  const playAudio = useCallback(() => {
    if (!audioRef.current) return;
    
    // Only try to play if it's not already playing
    if (!isPlaying) {
      setIsPlaying(true);
      
      // Use a Promise to handle play
      playPromiseRef.current = audioRef.current.play();
      
      // Handle errors like autoplay restrictions
      playPromiseRef.current.catch((error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
        
        if (error.name === 'NotAllowedError') {
          setErrorMessage('Please interact with the player first to enable audio playback');
        } else {
          setErrorMessage(`Audio playback error: ${error.message}`);
        }
      });
    }
  }, [isPlaying]);
  
  const pauseAudio = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      // Use the promise to safely pause
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
          })
          .catch(err => {
            console.error("Error while trying to pause:", err);
          });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isPlaying]);
  
  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, pauseAudio, playAudio]);
  
  // Seek to a specific time
  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    
    // Find which slide should be displayed at this time
    if (slidesRef.current.length > 0) {
      for (let i = slidesRef.current.length - 1; i >= 0; i--) {
        if (time >= slidesRef.current[i].time) {
          setCurrentSlide(i);
          break;
        }
      }
    }
  }, []);
  
  // Jump to a specific slide
  const jumpToSlide = useCallback((slideIndex: number) => {
    if (!audioRef.current || !slidesRef.current.length) return;
    
    // Ensure slide index is within bounds
    const index = Math.max(0, Math.min(slideIndex, slidesRef.current.length - 1));
    setCurrentSlide(index);
    
    // Jump to the time for this slide
    const slideTime = slidesRef.current[index].time;
    audioRef.current.currentTime = slideTime;
    setCurrentTime(slideTime);
  }, []);
  
  // Format time display (mm:ss)
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Reset when props change
  useEffect(() => {
    setCurrentSlide(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setLoadingState('loading');
    setErrorMessage(null);
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
  }, [data]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  
  if (!data.images.length) {
    return <div className="text-center p-4">No images available for video</div>;
  }
  
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)} ref={containerRef}>
      {/* Audio element (hidden but not completely removed for accessibility) */}
      <audio 
        ref={audioRef} 
        src={data.audio} 
        preload="auto" 
        className="sr-only" 
        crossOrigin="anonymous"
      />
      
      {/* Display current image */}
      <div className="relative aspect-video bg-black">
        {data.images.map((img, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
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
        
        {/* Loading indicator */}
        {loadingState === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center text-white">
              <div className="inline-block size-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
              <p className="text-sm">Loading media...</p>
            </div>
          </div>
        )}
        
        {/* Error overlay */}
        {loadingState === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center text-white max-w-md p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="size-10 mx-auto mb-2 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <p className="text-sm mb-2">{errorMessage || "Failed to load media"}</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.load();
                    setLoadingState('loading');
                    setErrorMessage(null);
                  }
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
        
        {/* Play/Pause button overlay (only visible on hover or when paused) */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity",
          isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
        )}>
          <Button
            size="icon"
            variant="outline"
            className="rounded-full w-16 h-16 bg-black/30 border-white/50 text-white hover:bg-black/50 hover:scale-110 transition-all"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </Button>
        </div>
        
        {/* Slide count indicator */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
          {currentSlide + 1} / {data.images.length}
        </div>
      </div>
      
      {/* Controls and progress bar */}
      <div className="p-3 bg-muted/30 space-y-2">
        {/* Scrubber / progress bar */}
        <div className="flex items-center space-x-2">
          <span className="text-xs min-w-14">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={(value: number[]) => seekTo(value[0])}
            className="flex-1"
          />
          <span className="text-xs min-w-14">{formatTime(duration)}</span>
        </div>
        
        {/* Buttons row */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => jumpToSlide(currentSlide - 1)}
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
              disabled={loadingState === 'loading' || loadingState === 'error'}
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
              onClick={() => jumpToSlide(currentSlide + 1)}
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
              seekTo(0);
              setTimeout(() => {
                playAudio();
              }, 100);
            }}
            className="text-xs"
            disabled={loadingState === 'loading' || loadingState === 'error'}
          >
            Restart
          </Button>
        </div>
      </div>
    </div>
  );
} 