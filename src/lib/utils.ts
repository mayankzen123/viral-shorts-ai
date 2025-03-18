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
