'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  X,
  Clock,
  Eye,
  ExternalLink,
  Share2,
  Bookmark,
  Facebook,
  Twitter,
  Link2,
  Calendar,
  Tag,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { NewsArticle } from '@/types';
import { useTimeAgo, formatDate, formatTime } from '@/hooks/useTimeAgo';
import { categoryLabels } from '@/data/news';

// Cache pour les images AI générées - avec tracking de l'imageUrl DB pour détecter les changements
const aiImageCache = new Map<string, { url: string; dbImageUrl: string | null }>();
const PLACEHOLDER_IMAGE = '/images/placeholder-news.svg';

// Check if image URL is valid (not placeholder)
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  if (url === PLACEHOLDER_IMAGE) return false;
  return true;
};

// Parse markdown-style content to JSX
function parseContent(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    if (line.trim() === '') {
      elements.push(<br key={`br-${lineIndex}`} />);
      return;
    }

    // Check if it's a bullet point
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');

    // Parse bold text within the line
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;
    let partIndex = 0;

    while ((match = regex.exec(line)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      // Add bold text
      parts.push(
        <strong key={`bold-${lineIndex}-${partIndex}`} className="font-bold text-gray-900">
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
      partIndex++;
    }
    // Add remaining text
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    if (isBullet) {
      elements.push(
        <div key={`line-${lineIndex}`} className="flex items-start gap-2 my-1">
          <span className="text-[#ff6b35] mt-1">•</span>
          <span>{parts.length > 0 ? parts : line.replace(/^[•-]\s*/, '')}</span>
        </div>
      );
    } else {
      elements.push(
        <p key={`line-${lineIndex}`} className="mb-3">
          {parts.length > 0 ? parts : line}
        </p>
      );
    }
  });

  return elements;
}

interface Props {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
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

export default function ArticleModal({ article, isOpen, onClose }: Props) {
  const timeAgo = useTimeAgo(article?.publishedAt || new Date());
  const [imageUrl, setImageUrl] = useState(PLACEHOLDER_IMAGE);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const hasFetched = useRef(false);
  const prevArticleIdRef = useRef<string | null>(null);

  // Generate AI image when article changes
  useEffect(() => {
    if (!article || !isOpen) return;

    const cacheKey = `modal-${article.id}`;
    const cachedData = aiImageCache.get(cacheKey);

    // Reset fetch flag when article changes
    if (prevArticleIdRef.current !== article.id) {
      hasFetched.current = false;
      prevArticleIdRef.current = article.id;
    }

    // PRIORITÉ 1: Si l'article a une imageUrl dans la DB, l'utiliser TOUJOURS
    // Cela inclut les images AI générées ET les images personnalisées (upload/URL)
    if (isValidImageUrl(article.imageUrl)) {
      // Vérifier si l'image dans la DB a changé par rapport au cache
      if (cachedData && cachedData.dbImageUrl !== article.imageUrl) {
        // L'image a été modifiée dans le back office, invalider le cache
        aiImageCache.delete(cacheKey);
      }

      // Utiliser l'image de la DB directement
      setImageUrl(article.imageUrl);
      aiImageCache.set(cacheKey, { url: article.imageUrl, dbImageUrl: article.imageUrl });
      setIsLoadingImage(false);
      hasFetched.current = true;
      return;
    }

    // PRIORITÉ 2: Vérifier le cache seulement si pas d'image en DB
    if (cachedData && cachedData.dbImageUrl === null) {
      setImageUrl(cachedData.url);
      setIsLoadingImage(false);
      hasFetched.current = true;
      return;
    }

    // Éviter les doubles requêtes
    if (hasFetched.current) return;

    // PRIORITÉ 3: Generate AI image car pas d'image en DB
    const generateAiImage = async () => {
      hasFetched.current = true;
      setIsLoadingImage(true);

      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: article.title,
            summary: article.summary,
            category: article.category
          })
        });

        const data = await response.json();
        if (data.success && data.imageUrl) {
          setImageUrl(data.imageUrl);
          aiImageCache.set(cacheKey, { url: data.imageUrl, dbImageUrl: null });
        }
      } catch (error) {
        console.error('AI image generation failed:', error);
        setImageUrl(PLACEHOLDER_IMAGE);
      } finally {
        setIsLoadingImage(false);
      }
    };

    generateAiImage();
  }, [article, isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!article) return null;

  const handleShare = async (platform: string) => {
    const url = article.sourceUrl;
    const text = article.title;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        alert('Lien copié !');
        break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6"
          onClick={onClose}
        >
          <motion.article
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl my-8 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hero Image */}
            <div className="relative h-64 sm:h-80">
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                className="object-contain bg-gray-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Loading indicator for AI image */}
              {isLoadingImage && (
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-800 shadow-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération de l'image...
                </div>
              )}

              {/* Category & Live Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className={`${categoryColors[article.category]} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                  {categoryLabels[article.category]}
                </span>
                {article.isLive && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full live-indicator"></span>
                    LIVE
                  </span>
                )}
                {article.isBreaking && (
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    FLASH
                  </span>
                )}
              </div>

              {/* Image Credit - AI Generated Notice */}
              {!isLoadingImage && (
                <div className="absolute bottom-4 right-4 text-white/80 text-xs bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                  Image générée par IA
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(article.publishedAt)} ({timeAgo})
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.views.toLocaleString()} vues
                </span>
                <span className="text-gray-400">
                  {article.readTime} min de lecture
                </span>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <p className="text-lg text-gray-700 font-medium leading-relaxed">
                  {article.summary}
                </p>
              </div>

              {/* Full Content */}
              <div className="prose prose-lg max-w-none mb-8 text-gray-600 leading-relaxed">
                {parseContent(article.content)}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-[#ff6b35]">
                  <p className="text-sm text-gray-500 italic">
                    Cette brève est une synthèse de l'article original publié par {article.source.name}.
                    Pour lire l'article complet et accéder à plus de détails, veuillez consulter la source originale ci-dessous.
                  </p>
                </div>
              </div>

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Share Buttons */}
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <span className="text-sm text-gray-500">Partager :</span>
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              {/* Source Attribution - IMPORTANT */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: article.source.color }}
                  ></div>
                  <span className="text-sm font-semibold text-gray-700">
                    Source Originale
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {article.source.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {article.source.type === 'journal' && 'Journal en ligne'}
                      {article.source.type === 'tv' && 'Chaîne de télévision'}
                      {article.source.type === 'radio' && 'Station de radio'}
                      {article.source.type === 'web' && 'Média en ligne'}
                    </p>
                  </div>
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Lire l'article original
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Transparency Notice */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Transparence :</strong> Mada-Flash.mg est une plateforme d'agrégation.
                  Cette brève est une synthèse de l'article original. Tous les droits appartiennent
                  à {article.source.name}. Consultez la source pour l'article complet.
                </p>
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
