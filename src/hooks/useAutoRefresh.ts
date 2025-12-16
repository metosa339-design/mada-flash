'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { NewsArticle } from '@/types';
import { newsSources } from '@/data/sources';

interface FetchedArticle {
  id?: string;
  title: string;
  summary: string;
  content?: string;
  sourceUrl: string;
  publishedAt: string;
  imageUrl: string | null;
  sourceId: string;
  sourceName: string;
  category?: { id: string; name: string; color: string };
  isFeatured?: boolean;
  isBreaking?: boolean;
  isFromRSS?: boolean;
  views?: number;
}

interface APIResponse {
  success: boolean;
  count: number;
  articles: FetchedArticle[];
  lastUpdated: string;
}

// Categories to assign based on keywords
const categoryKeywords: Record<string, string[]> = {
  politique: ['président', 'gouvernement', 'ministre', 'élection', 'politique', 'assemblée', 'député', 'sénat', 'loi', 'décret'],
  economie: ['économie', 'ariary', 'banque', 'investissement', 'commerce', 'entreprise', 'exportation', 'inflation', 'croissance', 'pib'],
  sport: ['sport', 'football', 'barea', 'cnaps', 'rugby', 'basket', 'athlétisme', 'jeux', 'champion', 'match'],
  culture: ['culture', 'musique', 'festival', 'art', 'cinéma', 'théâtre', 'danse', 'tradition', 'patrimoine'],
  societe: ['société', 'santé', 'éducation', 'social', 'population', 'famille', 'jeunesse', 'femme'],
  international: ['international', 'monde', 'étranger', 'diplomatie', 'onu', 'afrique', 'france', 'usa'],
  environnement: ['environnement', 'climat', 'cyclone', 'nature', 'forêt', 'biodiversité', 'eau', 'pollution'],
  technologie: ['technologie', 'numérique', 'internet', 'téléphone', 'innovation', 'startup', 'digital']
};

function detectCategory(title: string, summary: string): string {
  const text = (title + ' ' + summary).toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'societe'; // Default category
}

function transformToNewsArticle(article: FetchedArticle, index: number): NewsArticle {
  const source = newsSources.find(s => s.id === article.sourceId) || {
    id: article.sourceId,
    name: article.sourceName,
    shortName: article.sourceName.substring(0, 3).toUpperCase(),
    logo: '/logos/default.png',
    color: '#666666',
    url: article.sourceUrl ? article.sourceUrl.split('/').slice(0, 3).join('/') : '',
    type: 'web' as const
  };

  // Use category from DB if available, otherwise detect
  const category = article.category?.name?.toLowerCase() || detectCategory(article.title, article.summary || '');
  const publishedAt = new Date(article.publishedAt);

  // Use views from DB if available, otherwise generate
  const views = article.views || Math.floor(Math.random() * 5000) + 500;
  const readTime = Math.ceil(((article.summary || '').length / 200) + 2);

  // Use the database imageUrl directly - no fallback to picsum
  // This allows NewsCard to generate contextual images when no image exists
  const imageUrl = article.imageUrl || '/images/placeholder-news.svg';

  return {
    id: article.id || `live-${article.sourceId}-${index}-${Date.now()}`,
    title: article.title,
    summary: article.summary || '',
    content: article.content || `**${article.title}**\n\n${article.summary || ''}\n\nPour plus de détails, consultez l'article original sur ${article.sourceName}.`,
    imageUrl,
    imageCredit: article.sourceName,
    category: category as NewsArticle['category'],
    source,
    sourceUrl: article.sourceUrl || '',
    publishedAt,
    isBreaking: article.isBreaking || (index < 3 && (Date.now() - publishedAt.getTime()) < 3600000),
    isLive: (Date.now() - publishedAt.getTime()) < 1800000,
    readTime,
    views,
    tags: [category, article.sourceName.toLowerCase().replace(/\s+/g, '-')]
  };
}

interface UseAutoRefreshOptions {
  interval?: number; // Refresh interval in milliseconds
  enabled?: boolean;
  onNewArticles?: (count: number) => void;
}

interface UseAutoRefreshReturn {
  liveArticles: NewsArticle[];
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  error: string | null;
  refresh: () => Promise<void>;
  newArticlesCount: number;
}

export function useAutoRefresh(options: UseAutoRefreshOptions = {}): UseAutoRefreshReturn {
  const {
    interval = 15 * 60 * 1000, // 15 minutes default
    enabled = true,
    onNewArticles
  } = options;

  const [liveArticles, setLiveArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newArticlesCount, setNewArticlesCount] = useState(0);

  const previousArticleIds = useRef<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNews = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch('/api/news');

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data: APIResponse = await response.json();

      if (data.success && data.articles.length > 0) {
        const transformed = data.articles.map((article, index) =>
          transformToNewsArticle(article, index)
        );

        // Check for new articles
        const currentIds = new Set(transformed.map(a => a.title));
        let newCount = 0;

        if (previousArticleIds.current.size > 0) {
          transformed.forEach(article => {
            if (!previousArticleIds.current.has(article.title)) {
              newCount++;
            }
          });
        }

        previousArticleIds.current = currentIds;

        if (newCount > 0 && onNewArticles) {
          onNewArticles(newCount);
        }

        setNewArticlesCount(newCount);
        setLiveArticles(transformed);
        setLastUpdated(new Date(data.lastUpdated));
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [onNewArticles]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchNews();
    }
  }, [enabled, fetchNews]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (enabled && interval > 0) {
      intervalRef.current = setInterval(() => {
        fetchNews();
      }, interval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [enabled, interval, fetchNews]);

  const refresh = useCallback(async () => {
    await fetchNews(true);
  }, [fetchNews]);

  return {
    liveArticles,
    isLoading,
    isRefreshing,
    lastUpdated,
    error,
    refresh,
    newArticlesCount
  };
}

export default useAutoRefresh;
