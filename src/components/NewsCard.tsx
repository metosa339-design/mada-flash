'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Clock,
  Zap,
  ChevronRight,
  Loader2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion
} from 'lucide-react';
import { NewsArticle } from '@/types';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import { categoryLabels } from '@/data/news';

interface Props {
  article: NewsArticle;
  variant?: 'default' | 'featured' | 'compact' | 'timeline';
  index?: number;
  onClick?: () => void;
}

const categoryColors: Record<string, string> = {
  politique: 'bg-red-500',
  economie: 'bg-emerald-500',
  sport: 'bg-blue-500',
  culture: 'bg-purple-500',
  societe: 'bg-amber-500',
  international: 'bg-cyan-500',
  environnement: 'bg-green-500',
  technologie: 'bg-indigo-500'
};

// Cache pour éviter les requêtes multiples - avec tracking de l'imageUrl DB pour détecter les changements
const imageCache = new Map<string, { url: string; dbImageUrl: string | null }>();

// Placeholder par défaut pendant le chargement
const PLACEHOLDER_IMAGE = '/images/placeholder-news.svg';

// Check if image URL is valid (not placeholder)
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  if (url === PLACEHOLDER_IMAGE) return false;
  return true;
};

export default function NewsCard({ article, variant = 'default', index = 0, onClick }: Props) {
  const timeAgo = useTimeAgo(article.publishedAt);
  // Start with placeholder, then load AI-generated image
  const [imageUrl, setImageUrl] = useState(PLACEHOLDER_IMAGE);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  // Utiliser l'image de la DB si elle existe, sinon générer une nouvelle
  useEffect(() => {
    const cacheKey = `ai-${article.category}-${article.id}`;
    const cachedData = imageCache.get(cacheKey);

    // PRIORITÉ 1: Si l'article a une imageUrl dans la DB, l'utiliser TOUJOURS
    // Cela inclut les images AI générées ET les images personnalisées (upload/URL)
    if (isValidImageUrl(article.imageUrl)) {
      // Vérifier si l'image dans la DB a changé par rapport au cache
      if (cachedData && cachedData.dbImageUrl !== article.imageUrl) {
        // L'image a été modifiée dans le back office, invalider le cache
        imageCache.delete(cacheKey);
      }

      // Utiliser l'image de la DB directement
      setImageUrl(article.imageUrl!);
      imageCache.set(cacheKey, { url: article.imageUrl!, dbImageUrl: article.imageUrl! });
      setIsLoading(false);
      hasFetched.current = true;
      return;
    }

    // PRIORITÉ 2: Vérifier le cache seulement si pas d'image en DB
    if (cachedData && cachedData.dbImageUrl === null) {
      setImageUrl(cachedData.url);
      setIsLoading(false);
      hasFetched.current = true;
      return;
    }

    // Éviter les doubles requêtes
    if (hasFetched.current) return;

    // PRIORITÉ 3: Chercher une image gratuite (Pixabay/Pexels/Unsplash) puis AI si nécessaire
    const fetchFreeImage = async () => {
      hasFetched.current = true;
      setIsLoading(true);

      try {
        // Utiliser la nouvelle API qui cherche d'abord les images gratuites
        const response = await fetch('/api/images/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: article.title,
            summary: article.summary,
            category: article.category
          })
        });

        const data = await response.json();
        if (data.success && data.image?.url) {
          setImageUrl(data.image.url);
          // Sauvegarder dans le cache avec dbImageUrl = null (pas en DB)
          imageCache.set(cacheKey, { url: data.image.url, dbImageUrl: null });
        } else {
          // Fallback à l'ancienne API de génération AI si la nouvelle échoue
          const aiResponse = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: article.title,
              summary: article.summary,
              category: article.category
            })
          });

          const aiData = await aiResponse.json();
          if (aiData.success && aiData.imageUrl) {
            setImageUrl(aiData.imageUrl);
            imageCache.set(cacheKey, { url: aiData.imageUrl, dbImageUrl: null });
          }
        }
      } catch (error) {
        console.error('Image fetch failed:', error);
        // Garder le placeholder en cas d'erreur
        setImageUrl(PLACEHOLDER_IMAGE);
      } finally {
        setIsLoading(false);
      }
    };

    // Lancer la recherche d'image avec un petit délai pour éviter trop de requêtes simultanées
    const delay = index * 150; // Échelonner les requêtes (150ms entre chaque)
    const timeoutId = setTimeout(fetchFreeImage, delay);

    return () => clearTimeout(timeoutId);
  }, [article.id, article.title, article.summary, article.category, article.imageUrl, index]);

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger onClick when clicking on external links
    if ((e.target as HTMLElement).closest('a')) return;
    onClick?.();
  };

  if (variant === 'featured') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        onClick={handleClick}
        className="relative group rounded-2xl overflow-hidden bg-white shadow-lg card-hover cursor-pointer"
      >
        <div className="relative h-72 sm:h-96">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-contain bg-gray-100 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-800 shadow-lg">
              <Loader2 className="w-3 h-3 animate-spin" />
              Chargement...
            </div>
          )}

          {/* Live/Breaking Badge */}
          {(article.isLive || article.isBreaking) && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {article.isLive && (
                <span className="badge-live flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full live-indicator"></span>
                  LIVE
                </span>
              )}
              {article.isBreaking && (
                <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  FLASH
                </span>
              )}
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <span className={`${categoryColors[article.category]} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
              {categoryLabels[article.category]}
            </span>
          </div>

          {/* Read More Indicator */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-900">
              Lire la suite
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#ff6b35] transition-colors">
              {article.title}
            </h2>
            <p className="text-gray-200 text-sm mb-4 line-clamp-2">
              {article.summary}
            </p>

            {/* Meta Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {timeAgo}
                </span>
              </div>

              {/* Source */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: article.source.color }}
                ></span>
                {article.source.shortName}
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={handleClick}
        className="group flex gap-4 p-4 rounded-xl bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 cursor-pointer"
      >
        <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-contain bg-gray-100"
          />
          {article.isLive && (
            <div className="absolute top-1 left-1">
              <span className="w-2 h-2 bg-red-500 rounded-full live-indicator inline-block"></span>
            </div>
          )}
          {/* Loading indicator for compact */}
          {isLoading && (
            <div className="absolute bottom-1 right-1 p-1 bg-white/80 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`${categoryColors[article.category]} text-white px-2 py-0.5 rounded text-[10px] font-semibold`}>
              {categoryLabels[article.category]}
            </span>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-[#ff6b35] transition-colors mb-1">
            {article.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: article.source.color }}
            ></span>
            {article.source.shortName}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.article>
    );
  }

  if (variant === 'timeline') {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        onClick={handleClick}
        className="relative pl-12 pb-8 cursor-pointer"
      >
        <div className="timeline-dot top-1"></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{article.publishedAt.toLocaleTimeString('fr-MG', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>•</span>
            <span className={`${categoryColors[article.category]} text-white px-2 py-0.5 rounded text-[10px] font-semibold`}>
              {categoryLabels[article.category]}
            </span>
          </div>
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-[#ff6b35] transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{article.summary}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: article.source.color }}
              ></span>
              {article.source.name}
            </div>
            <span className="text-xs text-[#ff6b35] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              Lire plus <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </motion.article>
    );
  }

  // Default variant
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={handleClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 card-hover cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={imageUrl}
          alt={article.title}
          fill
          className="object-contain bg-gray-100 transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-medium text-gray-800 shadow-md">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Chargement...</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {article.isLive && (
            <span className="badge-live flex items-center gap-1 text-[10px]">
              <span className="w-1.5 h-1.5 bg-white rounded-full live-indicator"></span>
              LIVE
            </span>
          )}
          {article.isBreaking && (
            <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              FLASH
            </span>
          )}
        </div>

        {/* Category */}
        <div className="absolute top-3 right-3">
          <span className={`${categoryColors[article.category]} text-white px-2 py-0.5 rounded-full text-[10px] font-semibold`}>
            {categoryLabels[article.category]}
          </span>
        </div>

        {/* Read More Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-900">
            Lire la suite
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#ff6b35] transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {article.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          </div>

          {/* Source */}
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: article.source.color }}
            ></span>
            <span>{article.source.shortName}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
