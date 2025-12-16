'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Radio, Grid3X3, List, Clock, RefreshCw } from 'lucide-react';
import { NewsArticle } from '@/types';
import NewsCard from './NewsCard';
import { useStore } from '@/store/useStore';

interface Props {
  articles: NewsArticle[];
  onArticleClick?: (article: NewsArticle) => void;
}

export default function LiveNewsFeed({ articles, onArticleClick }: Props) {
  const { viewMode, setViewMode } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <section className="py-8 sm:py-12 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full live-indicator flex items-center justify-center">
                <span className="w-2 h-2 bg-white rounded-full"></span>
              </span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <span>Live News</span>
                <span className="badge-live text-[10px]">
                  <Radio className="w-3 h-3 inline mr-1" />
                  EN DIRECT
                </span>
              </h2>
              <p className="text-sm text-gray-500">
                Actualités en temps réel • Mise à jour toutes les 15 min
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg bg-white border border-gray-200 hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* News Grid/List/Timeline */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {articles.map((article, index) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  index={index}
                  onClick={() => onArticleClick?.(article)}
                />
              ))}
            </motion.div>
          )}

          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {articles.map((article, index) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  variant="compact"
                  index={index}
                  onClick={() => onArticleClick?.(article)}
                />
              ))}
            </motion.div>
          )}

          {viewMode === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <div className="timeline-line"></div>
              <div className="space-y-0">
                {articles.map((article, index) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    variant="timeline"
                    index={index}
                    onClick={() => onArticleClick?.(article)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="btn-primary inline-flex items-center gap-2">
            <span>Charger plus d'actualités</span>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
