'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Script, TrendingTopic } from '@/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { RemotionPlayer } from '@/components/RemotionPlayer';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface ImageState {
  [key: number]: {
    url: string | null;
    isLoading: boolean;
    error: string | null;
  };
}

interface AudioState {
  url: string | null;
  isLoading: boolean;
  error: string | null;
}

interface VideoState {
  url: string | null;
  isLoading: boolean;
  error: string | null;
  isSlideshow?: boolean;
  slideshowData?: {
    images: string[];
    audio: string;
  };
}

export default function MediaPage() {
  const router = useRouter();
  const params = useParams();
  const [script, setScript] = useState<Script | null>(null);
  const [topic, setTopic] = useState<TrendingTopic | null>(null);
  const [imageState, setImageState] = useState<ImageState>({});
  const [audioState, setAudioState] = useState<AudioState>({
    url: null,
    isLoading: false,
    error: null
  });
  const [videoState, setVideoState] = useState<VideoState>({
    url: null,
    isLoading: false,
    error: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("nova");
  
  // Fetch the script and topic from localStorage on mount
  useEffect(() => {
    if (!params || !params.id) {
      router.push('/');
      return;
    }
    
    const projectId = params.id as string;
    
    try {
      // Get script and topic from localStorage based on project ID
      const savedScript = localStorage.getItem(`media_${projectId}_script`);
      const savedTopic = localStorage.getItem(`media_${projectId}_topic`);
      
      if (!savedScript || !savedTopic) {
        router.push('/');
        toast.error('No script or topic data found. Please create a new script.');
        return;
      }
      
      // Create script object from the raw script text
      const scriptText = decodeURIComponent(savedScript);
      const topicText = decodeURIComponent(savedTopic);
      
      // Try to parse script as JSON first
      let scriptObject: Script;
      try {
        // Check if the script is stored as JSON
        const parsedScript = JSON.parse(scriptText);
        
        // If it's a valid JSON with our expected fields, use it directly
        if (
          typeof parsedScript === 'object' && 
          parsedScript !== null &&
          'hook' in parsedScript && 
          'mainContent' in parsedScript && 
          'callToAction' in parsedScript
        ) {
          scriptObject = {
            hook: parsedScript.hook || '',
            mainContent: parsedScript.mainContent || '',
            callToAction: parsedScript.callToAction || '',
            suggestedVisuals: Array.isArray(parsedScript.suggestedVisuals) && parsedScript.suggestedVisuals.length > 0
              ? parsedScript.suggestedVisuals
              : [
                  `Close-up of ${topicText} with dramatic lighting`,
                  `Person reacting to ${topicText} information`,
                  `Data visualization showing ${topicText} trends`,
                  `Comparison between ${topicText} and similar concepts`,
                  `Real-world application of ${topicText}`
                ]
          };
        } else {
          // It's JSON but not our format, fallback to text parsing
          throw new Error('Not in expected format');
        }
      } catch (parseError) {
        // If JSON parsing fails, fall back to the original text parsing approach
        const scriptParts = scriptText.split('\n\n').filter(part => part.trim() !== '');
        
        scriptObject = {
          hook: scriptParts[0] || '',
          mainContent: scriptParts[1] || '',
          callToAction: scriptParts[2] || '',
          suggestedVisuals: [
            `Close-up of ${topicText} with dramatic lighting`,
            `Person reacting to ${topicText} information`,
            `Data visualization showing ${topicText} trends`,
            `Comparison between ${topicText} and similar concepts`,
            `Real-world application of ${topicText}`
          ]
        };
      }
      
      const topicObject: TrendingTopic = {
        id: projectId,
        title: topicText,
        description: `Generated script about ${topicText}`,
        category: 'technology',
        dateStarted: new Date().toISOString(),
        viralScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-99
        estimatedPopularity: 'high',
      };
      
      setScript(scriptObject);
      setTopic(topicObject);
    } catch (error) {
      console.error('Failed to load script data:', error);
      toast.error('Failed to load script data');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [router, params]);
  
  // Generate image for a specific visual suggestion
  const generateImage = async (suggestion: string, index: number) => {
    // Skip if already loading or has image
    if (imageState[index]?.isLoading || imageState[index]?.url) {
      return;
    }
    
    // Set loading state
    setImageState(prev => ({
      ...prev,
      [index]: { url: null, isLoading: true, error: null }
    }));
    
    try {
      // Create a unique ID for this specific visual suggestion to prevent cache collisions
      const uniqueId = topic?.title ? `${topic.title}-visual-${index}` : `visual-${index}`;
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: suggestion,
          uniqueId
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }
      
      const data = await response.json();
      
      // Update state with the generated image URL
      setImageState(prev => ({
        ...prev,
        [index]: { url: data.imageUrl, isLoading: false, error: null }
      }));
    } catch (error: any) {
      toast.error(`Failed to generate image: ${error.message}`);
      
      // Update state with error
      setImageState(prev => ({
        ...prev,
        [index]: { url: null, isLoading: false, error: error.message }
      }));
    }
  };
  
  // Generate all images at once
  const generateAllImages = async () => {
    if (!script || script.suggestedVisuals.length === 0) return;
    
    // Check if we already have all images
    const allImagesGenerated = script.suggestedVisuals.every(
      (_, index) => imageState[index]?.url
    );
    
    if (allImagesGenerated) return;
    
    toast.info("Generating images for all visual suggestions...");
    
    // Generate images in sequence to avoid rate limiting
    for (let i = 0; i < script.suggestedVisuals.length; i++) {
      if (!imageState[i]?.url) {
        await generateImage(script.suggestedVisuals[i], i);
      }
    }
    
    toast.success("All images generated successfully!");
  };
  
  // Generate audio narration for the script
  const generateAudio = async () => {
    if (!script || audioState.isLoading) return;
    
    // Set loading state
    setAudioState({
      url: null,
      isLoading: true,
      error: null
    });
    
    try {
      // Combine all script sections
      const fullScript = `${script.hook} ${script.mainContent} ${script.callToAction}`;
      const uniqueId = topic?.title ? `${topic.title}-audio-${selectedVoice}` : `script-audio-${selectedVoice}`;
      
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: fullScript,
          uniqueId,
          voice: selectedVoice
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate audio');
      }
      
      const data = await response.json();
      
      // Update state with the generated audio URL
      setAudioState({
        url: data.audioUrl,
        isLoading: false,
        error: null
      });
      
      // Auto-play the audio if available
      if (audioRef.current && data.audioUrl) {
        // Set the source first
        audioRef.current.src = data.audioUrl;
        
        // Wait for the audio to be loaded before attempting to play
        const playAudio = () => {
          // Only play if the audio is fully loaded and ready
          if (audioRef.current && audioRef.current.readyState >= 2) {
            audioRef.current.play()
              .catch(() => {
                // Browser autoplay policy may prevent automatic playback
                toast.info("Click play to listen to the audio narration");
              });
          }
        };
        
        // Add event listener for when the audio is loaded enough to play
        audioRef.current.addEventListener('loadeddata', playAudio, { once: true });
        
        // Also set a timeout as a fallback
        setTimeout(() => {
          // Remove the event listener if it hasn't fired yet
          if (audioRef.current) {
            audioRef.current.removeEventListener('loadeddata', playAudio);
            playAudio();
          }
        }, 1000);
      }
      
      toast.success("Audio narration generated successfully!");
    } catch (error: any) {
      toast.error(`Failed to generate audio: ${error.message}`);
      
      // Update state with error
      setAudioState({
        url: null,
        isLoading: false,
        error: error.message
      });
    }
  };
  
  // Generate video from images and audio
  const generateVideo = async () => {
    if (!script || !topic) return;
    
    // Check if both audio and all images have been generated
    const audioGenerated = audioState.url !== null;
    const allImagesGenerated = script.suggestedVisuals.every(
      (_, index) => imageState[index]?.url
    );
    
    if (!audioGenerated || !allImagesGenerated) {
      toast.error("Please generate both audio and all images before creating a video");
      return;
    }
    
    // Set loading state
    setVideoState({
      url: null,
      isLoading: true,
      error: null
    });
    
    try {
      // Collect all image URLs - ensure all URLs are valid
      const imageUrls = script.suggestedVisuals
        .map((_, index) => imageState[index]?.url)
        .filter((url): url is string => Boolean(url)) as string[];
      
      const uniqueId = topic?.title ? `${topic.title}-video` : 'script-video';
      
      // Ensure the audio URL is correctly formatted for the audio element
      let processedAudioUrl = audioState.url;
      
      // Check if it's a base64 data URL and make sure it has the correct MIME type
      if (processedAudioUrl && processedAudioUrl.startsWith('data:')) {
        // Ensure it has the correct audio MIME type
        if (!processedAudioUrl.includes('audio/')) {
          // Fix the MIME type if needed (assuming it's MP3)
          processedAudioUrl = processedAudioUrl.replace(/^data:([^;]+);/, 'data:audio/mpeg;');
        }
      }
      
      // If it's not a data URL, ensure it ends with an appropriate audio extension
      if (processedAudioUrl && !processedAudioUrl.startsWith('data:')) {
        // Check common audio formats
        const hasAudioExtension = /\.(mp3|wav|ogg|m4a|aac)($|\?)/.test(processedAudioUrl);
        if (!hasAudioExtension) {
          // Append a query parameter to hint the content type
          processedAudioUrl = `${processedAudioUrl}${processedAudioUrl.includes('?') ? '&' : '?'}type=audio/mpeg`;
        }
      }
      
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          images: imageUrls,
          audioUrl: processedAudioUrl,
          uniqueId
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate video');
      }
      
      const data = await response.json();
      
      // Check if we received video data or a simple URL
      if (data.videoUrl && typeof data.videoUrl === 'object' && data.videoUrl.type === 'video') {
        // We got video data
        // Make sure the audio format is correct
        let videoAudio = data.videoUrl.audio;
        
        // Check and fix the audio format if needed
        if (videoAudio && videoAudio.startsWith('data:')) {
          if (!videoAudio.includes('audio/')) {
            videoAudio = videoAudio.replace(/^data:([^;]+);/, 'data:audio/mpeg;');
          }
        }
        
        // If it's not a data URL, ensure it ends with an appropriate audio extension
        if (videoAudio && !videoAudio.startsWith('data:')) {
          const hasAudioExtension = /\.(mp3|wav|ogg|m4a|aac)($|\?)/.test(videoAudio);
          if (!hasAudioExtension) {
            videoAudio = `${videoAudio}${videoAudio.includes('?') ? '&' : '?'}type=audio/mpeg`;
          }
        }
        
        // Ensure we have at least one image
        if (!data.videoUrl.images || data.videoUrl.images.length === 0) {
          throw new Error('No images received from the API for the video');
        }
        
        // Create a test Audio element to verify the audio can be loaded
        const testAudio = new Audio();
        testAudio.src = videoAudio;
        // Listen for errors in loading audio
        testAudio.addEventListener('error', () => {
          toast.error("The audio format may not be fully compatible with your browser");
        });
        
        // Set the video state with all the images and the audio
        setVideoState({
          url: null,
          isLoading: false,
          error: null,
          isSlideshow: true,
          slideshowData: {
            images: data.videoUrl.images,
            audio: videoAudio,
          }
        });
      } else {
        // We got a regular video URL
        setVideoState({
          url: data.videoUrl,
          isLoading: false,
          error: null,
          isSlideshow: false
        });
      }
      
      toast.success("Video created successfully!");
    } catch (error: any) {
      toast.error(`Failed to generate video: ${error.message}`);
      
      // Update state with error
      setVideoState({
        url: null,
        isLoading: false,
        error: error.message
      });
    }
  };
  
  // Function to download the video or slideshow
  const downloadVideo = () => {
    if (videoState.url) {
      // Regular video download
      const link = document.createElement('a');
      link.href = videoState.url;
      link.download = `${topic?.title.replace(/\s+/g, '-').toLowerCase() || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
    }
  };
  
  // Function to check if all media is generated
  const checkAllMediaGenerated = (): boolean => {
    if (!script) return false;
    
    const audioGenerated = audioState.url !== null;
    const allImagesGenerated = script.suggestedVisuals.every(
      (_, index) => imageState[index]?.url
    );
    
    return audioGenerated && allImagesGenerated;
  };
  
  // Function to copy to clipboard
  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(`${section} copied to clipboard`);
      },
      () => {
        toast.error("Failed to copy text");
      }
    );
  };
  
  // Function to handle back navigation
  const handleBack = () => {
    router.push('/');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg">
        <header className="w-full relative z-10">
          <div className="container px-4 py-6 md:px-6 lg:py-8 mx-auto">
            <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
              <Link href="/">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center space-x-2"
                >
                  <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-5 h-5"
                    >
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold gradient-text">ShortScript</h1>
                </motion.div>
              </Link>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center"
              >
                <ThemeToggle />
              </motion.div>
            </div>
          </div>
        </header>
        <Toaster />
        <main className="container px-4 mx-auto pt-8">
          <div className="flex justify-center items-center h-[70vh]">
            <div className="text-center">
              <div className="size-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-medium mb-2">Loading...</h2>
              <p className="text-muted-foreground">Preparing your media generation tools</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!script || !topic) {
    return (
      <div className="min-h-screen gradient-bg">
        <header className="w-full relative z-10">
          <div className="container px-4 py-6 md:px-6 lg:py-8 mx-auto">
            <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
              <Link href="/">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center space-x-2"
                >
                  <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-5 h-5"
                    >
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold gradient-text">ShortScript</h1>
                </motion.div>
              </Link>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center"
              >
                <ThemeToggle />
              </motion.div>
            </div>
          </div>
        </header>
        <Toaster />
        <main className="container px-4 mx-auto pt-8">
          <div className="flex justify-center items-center h-[70vh]">
            <div className="text-center max-w-md">
              <div className="size-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </div>
              <h2 className="text-xl font-medium mb-2">No Script Selected</h2>
              <p className="text-muted-foreground mb-6">Please go back and select a script to continue.</p>
              <Button onClick={handleBack}>Back to Script Selection</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen gradient-bg pb-16">
      <header className="w-full relative z-10">
        <div className="container px-4 py-6 md:px-6 lg:py-8 mx-auto">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <Link href="/">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-2"
              >
                <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-5 h-5"
                  >
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold gradient-text">ShortScript</h1>
              </motion.div>
            </Link>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center"
            >
              <ThemeToggle />
            </motion.div>
          </div>
        </div>
      </header>
      <Toaster />
      
      <main className="container px-4 mx-auto">
        <div className="grid gap-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/40 dark:to-purple-950/40 px-4 py-2 rounded-full">
              <span className="font-medium">{topic.title}</span>
            </div>
          </div>
          
          {/* Script Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card/80 backdrop-blur-sm rounded-lg border p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{topic.title}</h1>
                <p className="text-muted-foreground">{topic.description}</p>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium mr-2">Viral Score: </span>
                  <div className="h-2 w-24 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mr-2">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      style={{ width: `${topic.viralScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{topic.viralScore}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={() => copyToClipboard(`${script.hook}\n\n${script.mainContent}\n\n${script.callToAction}`, "Complete script")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <span>Copy Full Script</span>
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Audio Generation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card/80 backdrop-blur-sm rounded-lg border overflow-hidden"
          >
            <div className="border-b p-4 bg-muted/30 flex justify-between items-center">
              <h2 className="text-lg font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4l3 3" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Audio Narration
              </h2>
              
              <Button
                onClick={generateAudio}
                disabled={audioState.isLoading}
                variant={audioState.url ? "outline" : "default"}
                className="flex items-center"
              >
                {audioState.isLoading ? (
                  <>
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Generating...
                  </>
                ) : audioState.url ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Regenerate Audio
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 8v4l3 3" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    Generate Audio Narration
                  </>
                )}
              </Button>
            </div>
            
            <div className="p-6">
              {audioState.url ? (
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex flex-col space-y-4">
                    <div className="p-3 rounded-lg border bg-card/60">
                      <p className="text-sm font-medium mb-3">Voice Selection</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "nova", name: "Nova", gender: "Female", color: "blue" },
                          { id: "onyx", name: "Onyx", gender: "Male", color: "slate" },
                          { id: "shimmer", name: "Shimmer", gender: "Female", color: "purple" },
                          { id: "echo", name: "Echo", gender: "Male", color: "green" },
                        ].map(voice => (
                          <div 
                            key={voice.id}
                            onClick={() => !audioState.isLoading && setSelectedVoice(voice.id)}
                            className={`relative rounded-md p-2 cursor-pointer transition-all ${
                              audioState.isLoading ? "opacity-60 cursor-not-allowed" : ""
                            } ${
                              selectedVoice === voice.id 
                                ? `bg-${voice.color}-100 dark:bg-${voice.color}-900/30 border border-${voice.color}-200 dark:border-${voice.color}-800 shadow-sm` 
                                : "hover:bg-accent/20 border border-transparent"
                            }`}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div className={`size-8 rounded-full flex items-center justify-center mb-1 ${
                                selectedVoice === voice.id ? `bg-${voice.color}-200 dark:bg-${voice.color}-800 text-${voice.color}-600 dark:text-${voice.color}-300` : "bg-muted"
                              }`}>
                                {voice.gender === "Female" ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="6"></circle>
                                    <path d="M12 14v8"></path>
                                    <path d="M9 18h6"></path>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="5" r="4"></circle>
                                    <path d="M15 9l6 6"></path>
                                    <path d="M21 15v6h-6"></path>
                                    <path d="M9 9H3v12h6"></path>
                                    <path d="M6 15h12"></path>
                                  </svg>
                                )}
                              </div>
                              <span className="text-xs font-medium">{voice.name}</span>
                              {selectedVoice === voice.id && (
                                <div className={`absolute -top-1 -right-1 size-4 bg-${voice.color}-500 rounded-full flex items-center justify-center`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="group relative bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-900/50 dark:to-gray-900/30 p-4 rounded-lg border shadow-sm">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <audio ref={audioRef} controls className="w-full relative z-10">
                        <source src={audioState.url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-2">
                        <div className={`size-5 rounded-full flex items-center justify-center ${
                          selectedVoice === "nova" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-500" :
                          selectedVoice === "onyx" ? "bg-slate-100 dark:bg-slate-900/30 text-slate-500" :
                          selectedVoice === "shimmer" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-500" :
                          "bg-green-100 dark:bg-green-900/30 text-green-500"
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 8v4l3 3" />
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>Audio narration using <span className="font-medium">{selectedVoice}</span> voice. Click "Regenerate Audio" to create a new version with your selected voice.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : audioState.error ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    <span>Error: {audioState.error}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="size-16 bg-muted/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 8v4l3 3" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Generate Audio Narration</h3>
                  
                  <div className="mb-6 max-w-md mx-auto">
                    <p className="text-muted-foreground mb-4">Choose a voice for your narration:</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      <div 
                        className={`relative overflow-hidden rounded-lg border p-3 transition-all duration-200 hover:shadow-md ${
                          selectedVoice === "nova" 
                            ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800" 
                            : "bg-card hover:bg-accent/10"
                        }`}
                        onClick={() => setSelectedVoice("nova")}
                      >
                        <div className="flex items-start">
                          <div className={`size-10 rounded-full flex items-center justify-center mr-3 ${
                            selectedVoice === "nova" ? "bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-300" : "bg-muted/40"
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 11c0 1.66-1.34 3-3 3-1.66 0-3-1.34-3-3 0-1.66 1.34-3 3-3 1.66 0 3 1.34 3 3Z"></path>
                              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                              <path d="M15 8.5c.66 0 1.34.14 2 .5"></path>
                              <path d="M15 13c.66 0 1.34-.14 2-.5"></path>
                              <path d="M15 8.5V7l2-1.5"></path>
                              <path d="M15 13v1.5l2 1.5"></path>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">Nova</h4>
                            <p className="text-xs text-muted-foreground">A pleasant, professional female voice with clear articulation</p>
                          </div>
                          {selectedVoice === "nova" && (
                            <div className="absolute top-2 right-2 size-5 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div 
                        className={`relative overflow-hidden rounded-lg border p-3 transition-all duration-200 hover:shadow-md ${
                          selectedVoice === "onyx" 
                            ? "bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-slate-200 dark:border-slate-800" 
                            : "bg-card hover:bg-accent/10"
                        }`}
                        onClick={() => setSelectedVoice("onyx")}
                      >
                        <div className="flex items-start">
                          <div className={`size-10 rounded-full flex items-center justify-center mr-3 ${
                            selectedVoice === "onyx" ? "bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300" : "bg-muted/40"
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                              <path d="M15.5 7.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">Onyx</h4>
                            <p className="text-xs text-muted-foreground">A deep, authoritative male voice with rich tonality</p>
                          </div>
                          {selectedVoice === "onyx" && (
                            <div className="absolute top-2 right-2 size-5 bg-slate-500 dark:bg-slate-600 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div 
                        className={`relative overflow-hidden rounded-lg border p-3 transition-all duration-200 hover:shadow-md ${
                          selectedVoice === "shimmer" 
                            ? "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800" 
                            : "bg-card hover:bg-accent/10"
                        }`}
                        onClick={() => setSelectedVoice("shimmer")}
                      >
                        <div className="flex items-start">
                          <div className={`size-10 rounded-full flex items-center justify-center mr-3 ${
                            selectedVoice === "shimmer" ? "bg-purple-100 dark:bg-purple-800/40 text-purple-600 dark:text-purple-300" : "bg-muted/40"
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="m4.93 4.93 4.24 4.24"></path>
                              <path d="m14.83 9.17 4.24-4.24"></path>
                              <path d="m14.83 14.83 4.24 4.24"></path>
                              <path d="m9.17 14.83-4.24 4.24"></path>
                              <circle cx="12" cy="12" r="4"></circle>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">Shimmer</h4>
                            <p className="text-xs text-muted-foreground">A bright, engaging female voice with a vibrant delivery</p>
                          </div>
                          {selectedVoice === "shimmer" && (
                            <div className="absolute top-2 right-2 size-5 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div 
                        className={`relative overflow-hidden rounded-lg border p-3 transition-all duration-200 hover:shadow-md ${
                          selectedVoice === "echo" 
                            ? "bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-200 dark:border-green-800" 
                            : "bg-card hover:bg-accent/10"
                        }`}
                        onClick={() => setSelectedVoice("echo")}
                      >
                        <div className="flex items-start">
                          <div className={`size-10 rounded-full flex items-center justify-center mr-3 ${
                            selectedVoice === "echo" ? "bg-green-100 dark:bg-green-800/40 text-green-600 dark:text-green-300" : "bg-muted/40"
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 9.5V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4.5"></path>
                              <path d="M2 14.5V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4.5"></path>
                              <path d="M2 12h20"></path>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">Echo</h4>
                            <p className="text-xs text-muted-foreground">A smooth, calming male voice with a measured pace</p>
                          </div>
                          {selectedVoice === "echo" && (
                            <div className="absolute top-2 right-2 size-5 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={generateAudio} className="relative inline-flex group overflow-hidden rounded-md transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-md px-6">
                      <span className="relative z-10">Generate with {selectedVoice}</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Script Text Sections */}
              <div className="mt-6 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30 overflow-hidden">
                  <div className="border-b border-blue-100 dark:border-blue-900/30 bg-blue-100/50 dark:bg-blue-900/30 px-4 py-2">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Opening Hook</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{script?.hook || ''}</p>
                  </div>
                </div>
                
                <div className="rounded-lg border overflow-hidden">
                  <div className="border-b bg-muted/50 px-4 py-2">
                    <h3 className="text-sm font-medium">Main Content</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm">{script?.mainContent || ''}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900/30 overflow-hidden">
                  <div className="border-b border-green-100 dark:border-green-900/30 bg-green-100/50 dark:bg-green-900/30 px-4 py-2">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Call to Action</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{script?.callToAction || ''}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Visual Suggestions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card/80 backdrop-blur-sm rounded-lg border overflow-hidden"
          >
            <div className="border-b p-4 bg-muted/30 flex justify-between items-center">
              <h2 className="text-lg font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Visual Suggestions
              </h2>
              
              <Button
                variant="outline"
                onClick={generateAllImages}
                className="flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" y2="15" />
                </svg>
                <span>Generate All Images</span>
              </Button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {script.suggestedVisuals.map((visual, index) => (
                  <div key={index} className="rounded-lg border overflow-hidden bg-muted/10">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-1/2 aspect-video overflow-hidden">
                        {/* Render AI-generated image or placeholder with loading state */}
                        {imageState[index]?.isLoading ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <div className="flex flex-col items-center">
                              <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-2"></div>
                              <span className="text-xs text-muted-foreground">Generating image...</span>
                            </div>
                          </div>
                        ) : imageState[index]?.url ? (
                          <img 
                            src={imageState[index].url}
                            alt={`Visual for: ${visual}`}
                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                          />
                        ) : imageState[index]?.error ? (
                          <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4">
                            <div className="flex flex-col items-center text-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" x2="12" y1="8" y2="12" />
                                <line x1="12" x2="12.01" y1="16" y2="16" />
                              </svg>
                              <span className="text-sm font-medium">Failed to generate image</span>
                              <span className="text-xs mt-1">Click to try again</span>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => generateImage(visual, index)}
                          >
                            <div className="flex flex-col items-center text-center p-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              <span className="text-sm font-medium">Generate Image</span>
                              <span className="text-xs text-muted-foreground mt-1">Click to create an AI-generated visual</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute top-2 left-2 bg-primary/90 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="p-4 md:w-1/2 flex flex-col justify-between">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Suggested Visual</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{visual}</p>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs flex items-center"
                            onClick={() => copyToClipboard(visual, `Visual ${index + 1}`)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                            <span>Copy Text</span>
                          </Button>
                          
                          {!imageState[index]?.isLoading && !imageState[index]?.url && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs"
                              onClick={() => generateImage(visual, index)}
                            >
                              Generate Image
                            </Button>
                          )}
                          
                          {imageState[index]?.error && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="text-xs"
                              onClick={() => generateImage(visual, index)}
                            >
                              Retry
                            </Button>
                          )}
                          
                          {imageState[index]?.url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => window.open(imageState[index].url!, '_blank')}
                            >
                              View Full Size
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Video Generation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card/80 backdrop-blur-sm rounded-lg border overflow-hidden"
          >
            <div className="border-b p-4 bg-muted/30 flex justify-between items-center">
              <h2 className="text-lg font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                Video Creation
              </h2>
              
              <Button
                onClick={generateVideo}
                disabled={videoState.isLoading || !checkAllMediaGenerated()}
                variant={videoState.isSlideshow || videoState.url ? "outline" : "default"}
                className="flex items-center"
              >
                {videoState.isLoading ? (
                  <>
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Video...
                  </>
                ) : videoState.isSlideshow || videoState.url ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Recreate Video
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    Create Video
                  </>
                )}
              </Button>
            </div>
            
            <div className="p-6">
              {videoState.isSlideshow && videoState.slideshowData ? (
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg overflow-hidden">
                    <RemotionPlayer
                      data={videoState.slideshowData}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="bg-muted/20 rounded-lg p-3 mt-2">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                      </svg>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Your video is ready! You can use the controls to navigate through the images while listening to the narration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : videoState.url ? (
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg overflow-hidden">
                    <div className="aspect-video relative">
                      <video 
                        ref={videoRef}
                        controls 
                        className="w-full h-full"
                        poster={videoState.url}
                      >
                        <source src={videoState.url} type="video/mp4" />
                        Your browser does not support the video tag.
                        {/* Add audio as another source */}
                        {audioState.url && (
                          <audio>
                            <source src={audioState.url} type="audio/mpeg" />
                          </audio>
                        )}
                      </video>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={downloadVideo}
                      className="flex items-center justify-center"
                      variant="default"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" y2="3" />
                      </svg>
                      Download Video
                    </Button>
                  </div>
                  
                  <div className="bg-muted/20 rounded-lg p-3 mt-2">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                      </svg>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Your video is ready! You can use the controls to navigate through the images while listening to the narration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : videoState.error ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    <span>Error: {videoState.error}</span>
                  </div>
                </div>
              ) : !checkAllMediaGenerated() ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 p-4 rounded-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    <div>
                      <span className="font-medium">Required assets missing</span>
                      <p className="mt-1 text-sm">
                        {!audioState.url && "Please generate audio narration. "}
                        {script && !script.suggestedVisuals.every((_, index) => imageState[index]?.url) && "Please generate all images. "}
                        Both are needed to create a video.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="size-16 bg-muted/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Create Video</h3>
                  <p className="text-muted-foreground mb-6">Combine your generated images and audio narration into a shareable video.</p>
                  <Button 
                    onClick={generateVideo}
                    disabled={!checkAllMediaGenerated()}
                  >
                    Create Now
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 