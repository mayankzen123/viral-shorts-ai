'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RemotionPlayerProps {
  data: {
    images: string[];
    audio: string;
  };
  onComplete?: () => void;
  className?: string;
}

/**
 * Simplified RemotionPlayer component that doesn't require @remotion/player 
 * This is a temporary solution until Node.js can be upgraded to install Remotion
 */
export function RemotionPlayer({ data, onComplete, className }: RemotionPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate audio duration to determine slideshow pacing
  useEffect(() => {
    if (!data.audio) return;
    
    const audio = new Audio(data.audio);
    
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // If duration is already available, calculate immediately
    if (audio.duration && !isNaN(audio.duration)) {
      setAudioDuration(audio.duration);
    }
    
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [data.audio]);
  
  // Handle image transitions
  useEffect(() => {
    if (!isPlaying || !data.images.length) return;
    
    const slideDuration = audioDuration / data.images.length;
    const intervalTime = slideDuration * 1000;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= data.images.length) {
          // End of slideshow
          clearInterval(interval);
          setIsPlaying(false);
          if (onComplete) onComplete();
          return prevIndex;
        }
        return nextIndex;
      });
    }, intervalTime);
    
    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, data.images, audioDuration, onComplete]);
  
  // Handle audio controls
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.play().catch(error => {
        console.error("Audio play error:", error);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentImageIndex(0);
      if (onComplete) onComplete();
    };
    
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isPlaying, onComplete]);
  
  // Only render if we have at least one image
  if (!data.images.length) {
    return <div className="text-center p-4">No images available for video</div>;
  }
  
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  const restartVideo = () => {
    setCurrentImageIndex(0);
    
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
    }
    
    setIsPlaying(true);
  };
  
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Slide show display */}
      <div 
        ref={containerRef}
        className="aspect-video bg-black cursor-pointer relative" 
        onClick={togglePlayback}
      >
        {/* Audio element */}
        <audio 
          ref={audioRef} 
          src={data.audio}
          style={{ display: 'none' }}
        />
        
        {/* Images */}
        <div className="absolute inset-0 flex items-center justify-center">
          {data.images.map((image, index) => (
            <div
              key={index}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000",
                currentImageIndex === index ? "opacity-100" : "opacity-0"
              )}
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
        
        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white">
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="p-3 bg-muted/30 space-y-2">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlayback}
            className="text-xs flex items-center gap-1"
          >
            {isPlaying ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Play
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={restartVideo}
            className="text-xs"
          >
            Restart
          </Button>
        </div>
      </div>
    </div>
  );
} 