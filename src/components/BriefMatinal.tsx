'use client';

import { motion } from 'framer-motion';
import { Sun, Coffee, ChevronRight, Sparkles } from 'lucide-react';
import { NewsArticle } from '@/types';
import NewsCard from './NewsCard';

interface Props {
  articles: NewsArticle[];
  onArticleClick?: (article: NewsArticle) => void;
}

export default function BriefMatinal({ articles, onArticleClick }: Props) {
  const today = new Date().toLocaleDateString('fr-MG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Sun className="w-8 h-8 text-white" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </motion.div>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  <span className="gradient-text">Brief Matinal</span>
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Coffee className="w-4 h-4" />
                  {today}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {articles.length} actualités essentielles
              </span>
              <button className="flex items-center gap-1 text-sm font-medium text-[#ff6b35] hover:text-[#e55a2b] transition-colors">
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description Card */}
          <div className="gradient-bg-subtle rounded-2xl p-4 sm:p-6 mb-8">
            <p className="text-sm sm:text-base text-gray-700">
              <span className="font-semibold">Votre résumé quotidien</span> - Les informations les plus importantes des dernières 24 heures, synthétisées et sourcées pour vous permettre de rester informé en quelques minutes.
            </p>
          </div>
        </motion.div>

        {/* Featured Article */}
        {articles.length > 0 && (
          <div className="mb-8">
            <NewsCard
              article={articles[0]}
              variant="featured"
              index={0}
              onClick={() => onArticleClick?.(articles[0])}
            />
          </div>
        )}

        {/* Grid of Articles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(1, 7).map((article, index) => (
            <NewsCard
              key={article.id}
              article={article}
              index={index + 1}
              onClick={() => onArticleClick?.(article)}
            />
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="stats-card">
            <div className="stats-number">
              {articles.reduce((acc, a) => acc + a.views, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Vues totales</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">{articles.length}</div>
            <div className="text-sm text-gray-500">Articles</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">
              {new Set(articles.map(a => a.source.id)).size}
            </div>
            <div className="text-sm text-gray-500">Sources</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">
              {articles.reduce((acc, a) => acc + a.readTime, 0)} min
            </div>
            <div className="text-sm text-gray-500">Temps de lecture</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
