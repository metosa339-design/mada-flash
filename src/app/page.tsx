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
  getBriefMatinal,
  getLatestNews
} from '@/data/news';
import { useStore } from '@/store/useStore';
import { NewsArticle } from '@/types';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

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

  // Combine live articles with mock data
  const allArticles = useMemo(() => {
    if (liveArticles.length > 0) {
      // Merge live articles with mock data, prioritizing live
      const liveIds = new Set(liveArticles.map(a => a.title.toLowerCase()));
      const filteredMock = mockNews.filter(a => !liveIds.has(a.title.toLowerCase()));
      return [...liveArticles, ...filteredMock];
    }
    return mockNews;
  }, [liveArticles]);

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

    return news.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );
  }, [allArticles, selectedSource, selectedCategory, searchQuery]);

  // Get latest articles for live feed
  const latestArticles = useMemo(() => {
    return allArticles
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, 20);
  }, [allArticles]);

  const breakingNews = getBreakingNews();
  const briefMatinalArticles = getBriefMatinal();

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
