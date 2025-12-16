'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { NewsArticle } from '@/types';

interface Props {
  articles: NewsArticle[];
}

export default function BreakingNewsBanner({ articles }: Props) {
  if (articles.length === 0) return null;

  const breakingText = articles
    .map((a) => `${a.title} (${a.source.shortName})`)
    .join(' • ');

  return (
    <div className="breaking-news-banner text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            FLASH
          </span>
        </div>
        <div className="overflow-hidden relative flex-1">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '-100%' }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="whitespace-nowrap text-sm font-medium"
          >
            {breakingText} • {breakingText}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
