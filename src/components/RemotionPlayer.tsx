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
  
  // Validate that we have images
  useEffect(() => {
    // Validate images silently
  }, [data.images]);
  
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
        className="aspect-video bg-black cursor-pointer" 
        onClick={togglePlayback}
      >
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
        <div className="flex justify-end">
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