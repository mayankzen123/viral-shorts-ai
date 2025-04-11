'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { RemotionPlayer } from './RemotionPlayer';
import { toast } from 'sonner';

interface VideoRendererProps {
  images: string[];
  audioUrl: string;
  title?: string;
}

/**
 * VideoRenderer component that displays a preview player and allows rendering and downloading videos
 * using Creatomate API for high-quality video generation
 */
export default function VideoRenderer({ images, audioUrl, title = 'My Video' }: VideoRendererProps) {
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  
  // Function to handle rendering the video via Creatomate
  const handleRenderVideo = async () => {
    try {
      setIsRendering(true);
      setRenderProgress(10);
      
      // Start progress animation
      const interval = setInterval(() => {
        setRenderProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 5;
        });
      }, 1000);
      
      // Call the API to render the video
      const response = await fetch('/api/creatomate-render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          images, 
          audioUrl,
          title,
        }),
      });
      
      clearInterval(interval);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to render video');
      }
      
      const data = await response.json();
      setRenderProgress(100);
      
      // Set the rendered video URL for download
      if (data.renderUrl) {
        setRenderedVideoUrl(data.renderUrl);
        toast.success('Video rendered successfully!');
        setActiveTab('download');
      } else {
        throw new Error('No video URL returned from render service');
      }
    } catch (error: any) {
      console.error('Error rendering video:', error);
      toast.error(error.message || 'Failed to render video');
    } finally {
      setIsRendering(false);
    }
  };
  
  // Handle downloading the rendered video
  const handleDownloadVideo = () => {
    if (!renderedVideoUrl) {
      toast.error('No rendered video available to download');
      return;
    }
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = renderedVideoUrl;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Download started!');
  };
  
  return (
    <div className="w-full space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="download" disabled={!renderedVideoUrl}>
            {renderedVideoUrl ? 'Download' : 'Render Required'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="space-y-4">
          <div className="aspect-video overflow-hidden rounded-md bg-muted/20">
            <RemotionPlayer
              data={{ images, audio: audioUrl }}
              className="w-full h-full"
            />
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleRenderVideo} 
              disabled={isRendering} 
              className="w-full"
            >
              {isRendering ? 'Rendering...' : 'Render Video for Download'}
            </Button>
            
            {isRendering && (
              <div className="space-y-2">
                <Progress value={renderProgress} className="w-full h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Rendering video... {renderProgress}%
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="download" className="space-y-4">
          {renderedVideoUrl && (
            <>
              <div className="rounded-md border p-4 space-y-4">
                <div className="aspect-video overflow-hidden rounded-md bg-muted/20 flex items-center justify-center">
                  {/* Video embed that works with direct MP4 URLs */}
                  <video 
                    src={renderedVideoUrl} 
                    controls 
                    className="w-full h-full"
                    poster={images[0]}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                <Button 
                  onClick={handleDownloadVideo} 
                  className="w-full"
                  variant="default"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download MP4 Video
                </Button>
              </div>
              
              <div className="rounded-md bg-muted/20 p-4 text-sm">
                <p className="text-muted-foreground">
                  Your video has been rendered and is ready to download. The video file will be in MP4 format with high quality.
                </p>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 