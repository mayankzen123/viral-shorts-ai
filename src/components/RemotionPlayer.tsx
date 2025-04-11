'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { SlideshowVideo } from '@/remotion/compositions/SlideshowVideo';
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

export function RemotionPlayer({ data, onComplete, className }: RemotionPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const playerRef = useRef<PlayerRef>(null);
  
  // Calculate audio duration to determine video length
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
  
  // Set up event listeners for player state changes
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onComplete) onComplete();
    };
    
    player.addEventListener('play', handlePlay);
    player.addEventListener('pause', handlePause);
    player.addEventListener('ended', handleEnded);
    
    return () => {
      player.removeEventListener('play', handlePlay);
      player.removeEventListener('pause', handlePause);
      player.removeEventListener('ended', handleEnded);
    };
  }, [onComplete]);
  
  // Only render if we have at least one image
  if (!data.images.length) {
    return <div className="text-center p-4">No images available for video</div>;
  }
  
  // Calculate video duration in frames (30fps) - ensure a minimum duration
  // Make sure it's at least 2 seconds per image (60 frames at 30fps)
  const minFramesPerImage = 60; // 2 seconds per image at 30fps
  const framesFromAudio = Math.ceil(audioDuration * 30);
  const framesFromImages = data.images.length * minFramesPerImage;
  const durationInFrames = Math.max(300, framesFromAudio, framesFromImages);
  
  const togglePlayback = () => {
    const player = playerRef.current;
    if (!player) return;
    
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };
  
  const restartVideo = () => {
    const player = playerRef.current;
    if (!player) return;
    
    player.seekTo(0);
    setTimeout(() => {
      player.play();
    }, 100);
  };
  
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Remotion Player */}
      <div 
        className="aspect-video bg-black cursor-pointer relative" 
      >
        {/* Click capture layer that doesn't cover controls */}
        <div 
          className="absolute inset-0 z-10 flex items-center justify-center group pointer-events-none"
        >
          {/* Center play area - allow clicks only in the center area */}
          <div 
            className="w-3/4 h-3/4 flex items-center justify-center pointer-events-auto"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {/* Play/Pause Icon Overlay - visible on hover */}
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
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
        
        <Player
          ref={playerRef}
          component={SlideshowVideo}
          durationInFrames={durationInFrames}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={30}
          controls
          autoPlay={false}
          loop={false}
          clickToPlay={false}
          style={{
            width: '100%',
            height: '100%',
          }}
          inputProps={{
            images: data.images,
            audio: data.audio,
            durationInFrames,
          }}
          showVolumeControls
        />
      </div>
      
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