import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple in-memory cache implementation
type CacheItem<T> = {
  data: T;
  timestamp: number;
}

export class CacheManager<T> {
  private cache = new Map<string, CacheItem<T>>();
  private ttl: number;

  constructor(ttlMs: number = 24 * 60 * 60 * 1000) { // Default 24 hours
    this.ttl = ttlMs;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if the item is expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key); // Remove expired item
      return null;
    }
    
    return item.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear expired items
  cleanUp(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Sample trending topics data for testing
export const sampleTrendingTopics = {
  "trendingTopics": [
    {
      "title": "Nvidia Unveils Blackwell Ultra AI Chips at GTC 2025",
      "description": "At the GTC 2025 event, Nvidia introduced the Blackwell Ultra AI chips, promising significant advancements in AI processing capabilities.",
      "viralScore": 95,
      "dateStarted": "2025-03-20",
      "estimatedPopularity": "very high"
    },
    {
      "title": "NAB Show 2025 Highlights AI's Impact on Broadcasting",
      "description": "The NAB Show 2025 showcased how AI is transforming broadcasting, with companies like Black Box presenting AI-driven solutions for content delivery.",
      "viralScore": 90,
      "dateStarted": "2025-03-22",
      "estimatedPopularity": "high"
    },
    {
      "title": "Net Insight Introduces Nimbra Edge for Enhanced Live Event Streaming",
      "description": "Net Insight unveiled Nimbra Edge, a solution aimed at improving live event streaming through advanced video network management.",
      "viralScore": 88,
      "dateStarted": "2025-03-22",
      "estimatedPopularity": "high"
    },
    {
      "title": "Wall Street Surges as Tech Stocks Rally Amid Tariff Optimism",
      "description": "Optimism over potential tariff reductions led to a significant rally in tech stocks, with major indices reaching two-week highs.",
      "viralScore": 85,
      "dateStarted": "2025-03-24",
      "estimatedPopularity": "high"
    },
    {
      "title": "Nvidia's Groot N1 AI Model Aims to Revolutionize Robotics",
      "description": "Nvidia introduced the Groot N1 AI model, designed to enhance robotics capabilities through advanced AI integration.",
      "viralScore": 92,
      "dateStarted": "2025-03-20",
      "estimatedPopularity": "very high"
    },
    {
      "title": "Apple TV+ Faces $1 Billion Annual Loss Amid Streaming Wars",
      "description": "Reports indicate that Apple TV+ is incurring annual losses of $1 billion, highlighting challenges in the competitive streaming market.",
      "viralScore": 80,
      "dateStarted": "2025-03-25",
      "estimatedPopularity": "medium"
    },
    {
      "title": "Nvidia's Project DIGITS Super Chip Targets AI Developers",
      "description": "Nvidia announced Project DIGITS, a super chip aimed at providing AI developers with enhanced computing power for complex tasks.",
      "viralScore": 89,
      "dateStarted": "2025-03-20",
      "estimatedPopularity": "high"
    },
    {
      "title": "NAB Show 2025: AI Dominates Creator Platforms and Streaming Solutions",
      "description": "The NAB Show 2025 emphasized AI's growing role in creator platforms and streaming solutions, with companies showcasing AI-driven innovations.",
      "viralScore": 87,
      "dateStarted": "2025-03-22",
      "estimatedPopularity": "high"
    },
    {
      "title": "Nvidia's Blue Robot Powered by Newton Debuts at GTC 2025",
      "description": "Nvidia, in collaboration with Google DeepMind and Disney, introduced Blue, a robot powered by the Newton platform, showcasing advancements in robotics.",
      "viralScore": 93,
      "dateStarted": "2025-03-20",
      "estimatedPopularity": "very high"
    },
    {
      "title": "Nvidia Halos Initiative Aims to Enhance Self-Driving Car Safety",
      "description": "Nvidia announced the Halos initiative, focusing on improving safety and transparency in self-driving cars through AI and partnerships with automakers.",
      "viralScore": 91,
      "dateStarted": "2025-03-20",
      "estimatedPopularity": "very high"
    }
  ]
};
