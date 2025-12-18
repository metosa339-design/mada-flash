'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Header,
  Footer,
  BriefMatinal,
  LiveNewsFeed,
  SourcesSection,
  BreakingNewsBanner,
  ArticleModal,
  HoroscopeSection,
  RecipeSection,
  HistoryToday
} from '@/components';
import {
  mockNews,
  getBreakingNews,
  categoryLabels
} from '@/data/news';
import { useStore } from '@/store/useStore';
import { NewsArticle } from '@/types';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { Clock, ChevronRight, Calendar } from 'lucide-react';

export default function Home() {
  const { selectedSource, selectedCategory, searchQuery } = useStore();
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNewNotification, setShowNewNotification] = useState(false);

  // Auto-refresh hook for live news
  const {
    liveArticles,
    isLoading: isLiveLoading,
    isRefreshing,
    lastUpdated,
    error: liveError,
    refresh,
    newArticlesCount
  } = useAutoRefresh({
    interval: 15 * 60 * 1000, // 15 minutes
    enabled: true,
    onNewArticles: (count) => {
      if (count > 0) {
        setShowNewNotification(true);
        setTimeout(() => setShowNewNotification(false), 5000);
      }
    }
  });

  // State to show older articles
  const [showOlderArticles, setShowOlderArticles] = useState(false);

  // Combine live articles with mock data - SORT BY FEATURED FIRST
  const allArticles = useMemo(() => {
    let articles: NewsArticle[] = [];

    if (liveArticles.length > 0) {
      // Use only live articles from database
      articles = [...liveArticles];
    } else {
      // Fallback to mock data if no live articles
      articles = [...mockNews];
    }

    // Sort: Featured first, then by date
    return articles.sort((a, b) => {
      // Featured articles first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      // Then by date (newest first)
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });
  }, [liveArticles]);

  // Filter articles from last 24 hours
  const last24hArticles = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    return allArticles.filter(a => a.publishedAt.getTime() >= oneDayAgo);
  }, [allArticles]);

  // Older articles (more than 24h)
  const olderArticles = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    return allArticles.filter(a => a.publishedAt.getTime() < oneDayAgo);
  }, [allArticles]);

  // Handle article click
  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedArticle(null), 300);
  };

  // Filter news based on selected filters
  const filteredNews = useMemo(() => {
    let news = [...allArticles];

    if (selectedSource) {
      news = news.filter((article) => article.source.id === selectedSource);
    }

    if (selectedCategory) {
      news = news.filter((article) => article.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      news = news.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.summary.toLowerCase().includes(query) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Keep featured first, then sort by date
    return news.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });
  }, [allArticles, selectedSource, selectedCategory, searchQuery]);

  // Get latest articles for live feed - USE 24H FILTERED
  const latestArticles = useMemo(() => {
    return last24hArticles.slice(0, 20);
  }, [last24hArticles]);

  // Breaking news from 24h articles
  const breakingNews = useMemo(() => {
    return last24hArticles.filter(a => a.isBreaking).slice(0, 5);
  }, [last24hArticles]);

  // Brief Matinal - use 24h articles with featured first
  const briefMatinalArticles = useMemo(() => {
    return last24hArticles.slice(0, 7);
  }, [last24hArticles]);

  const hasActiveFilters = selectedSource || selectedCategory || searchQuery;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Breaking News Banner */}
      {breakingNews.length > 0 && !hasActiveFilters && (
        <BreakingNewsBanner articles={breakingNews} />
      )}

      {/* Header */}
      <Header />

      {/* Ce jour dans l'histoire - Banner at top */}
      {!hasActiveFilters && (
        <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <HistoryToday />
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {hasActiveFilters ? (
          // Filtered Results
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {filteredNews.length} résultat{filteredNews.length > 1 ? 's' : ''}
                </h2>
                <p className="text-gray-500">
                  {selectedSource && `Source : ${mockNews.find(a => a.source.id === selectedSource)?.source.name}`}
                  {selectedCategory && ` • Catégorie : ${selectedCategory}`}
                  {searchQuery && ` • Recherche : "${searchQuery}"`}
                </p>
              </div>
              {filteredNews.length > 0 ? (
                <LiveNewsFeed
                  articles={filteredNews}
                  onArticleClick={handleArticleClick}
                />
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-gray-500">
                    Essayez de modifier vos filtres de recherche
                  </p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* Brief Matinal Section */}
            <BriefMatinal
              articles={briefMatinalArticles}
              onArticleClick={handleArticleClick}
            />

            {/* New Articles Notification */}
            {showNewNotification && newArticlesCount > 0 && (
              <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setShowNewNotification(false);
                  }}
                  className="bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-semibold"
                >
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {newArticlesCount} nouvelle{newArticlesCount > 1 ? 's' : ''} actualité{newArticlesCount > 1 ? 's' : ''}
                </button>
              </div>
            )}

            {/* Live News Feed */}
            <LiveNewsFeed
              articles={latestArticles}
              onArticleClick={handleArticleClick}
            />

            {/* Horoscope & Recipe Section */}
            <section className="py-8 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <HoroscopeSection />
                  <RecipeSection />
                </div>
              </div>
            </section>

            {/* Older Articles Section */}
            {olderArticles.length > 0 && (
              <section className="py-8 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Actualités précédentes
                        </h2>
                        <p className="text-sm text-gray-500">
                          {olderArticles.length} article{olderArticles.length > 1 ? 's' : ''} de plus de 24h
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowOlderArticles(!showOlderArticles)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                    >
                      {showOlderArticles ? 'Masquer' : 'Voir tout'}
                      <ChevronRight className={`w-4 h-4 transition-transform ${showOlderArticles ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {showOlderArticles && (
                    <LiveNewsFeed
                      articles={olderArticles.slice(0, 20)}
                      onArticleClick={handleArticleClick}
                    />
                  )}
                </div>
              </section>
            )}

            {/* Sources Section - at the bottom */}
            <SourcesSection />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Article Detail Modal */}
      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
