'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseGeneratedImageOptions {
  title: string;
  summary?: string;
  category?: string;
  articleId?: string;
  fallbackUrl?: string;
  enabled?: boolean;
}

interface UseGeneratedImageReturn {
  imageUrl: string;
  isLoading: boolean;
  isGenerated: boolean;
  error: string | null;
  regenerate: () => Promise<void>;
}

// Local storage cache for generated images
const IMAGE_CACHE_KEY = 'mada-flash-generated-images';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(title: string, category: string): string {
  return `${category}-${title.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '-')}`;
}

function getFromLocalCache(key: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const cache = JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');
    const entry = cache[key];

    if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
      return entry.imageUrl;
    }

    // Clean up expired entry
    if (entry) {
      delete cache[key];
      localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
    }
  } catch (e) {
    console.error('Cache read error:', e);
  }

  return null;
}

function saveToLocalCache(key: string, imageUrl: string): void {
  if (typeof window === 'undefined') return;

  try {
    const cache = JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');

    // Limit cache size to 100 entries
    const keys = Object.keys(cache);
    if (keys.length > 100) {
      // Remove oldest entries
      const sortedKeys = keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp);
      sortedKeys.slice(0, 20).forEach(k => delete cache[k]);
    }

    cache[key] = {
      imageUrl,
      timestamp: Date.now()
    };

    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Cache write error:', e);
  }
}

export function useGeneratedImage(options: UseGeneratedImageOptions): UseGeneratedImageReturn {
  const {
    title,
    summary = '',
    category = 'societe',
    articleId,
    fallbackUrl,
    enabled = true
  } = options;

  const defaultFallback = fallbackUrl || `https://picsum.photos/seed/${encodeURIComponent(title.substring(0, 20))}/800/450`;

  const [imageUrl, setImageUrl] = useState<string>(defaultFallback);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = getCacheKey(title, category);

  const generateImage = useCallback(async () => {
    if (!enabled || !title) return;

    // Check local cache first
    const cached = getFromLocalCache(cacheKey);
    if (cached) {
      setImageUrl(cached);
      setIsGenerated(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          summary,
          category,
          articleId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setImageUrl(data.imageUrl);
        setIsGenerated(!data.fallback);

        // Save to local cache if it's a generated image
        if (!data.fallback) {
          saveToLocalCache(cacheKey, data.imageUrl);
        }
      } else {
        setImageUrl(defaultFallback);
        setIsGenerated(false);
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setImageUrl(defaultFallback);
      setIsGenerated(false);
    } finally {
      setIsLoading(false);
    }
  }, [title, summary, category, articleId, enabled, cacheKey, defaultFallback]);

  // Generate image on mount or when dependencies change
  useEffect(() => {
    // Only auto-generate for articles without existing images
    if (enabled && !fallbackUrl?.includes('picsum')) {
      // If there's a real image URL, use it
      if (fallbackUrl && !fallbackUrl.includes('picsum.photos')) {
        setImageUrl(fallbackUrl);
        setIsGenerated(false);
        return;
      }
    }

    // Check cache first, then optionally generate
    const cached = getFromLocalCache(cacheKey);
    if (cached) {
      setImageUrl(cached);
      setIsGenerated(true);
    } else if (fallbackUrl) {
      setImageUrl(fallbackUrl);
    }
  }, [cacheKey, enabled, fallbackUrl]);

  const regenerate = useCallback(async () => {
    await generateImage();
  }, [generateImage]);

  return {
    imageUrl,
    isLoading,
    isGenerated,
    error,
    regenerate
  };
}

export default useGeneratedImage;
