'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Video,
  Settings,
  LogOut,
  Users,
  BarChart3,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Calendar,
  Filter,
} from 'lucide-react';
import ArticleEditor from '@/components/admin/ArticleEditor';
import MediaLibrary from '@/components/admin/MediaLibrary';

interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'editor';
}

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  sourceUrl?: string;
  sourceName?: string;
  categoryId?: string;
  category?: { id: string; name: string; color: string };
  status: string;
  publishedAt?: string;
  scheduledAt?: string;
  views: number;
  isFeatured: boolean;
  isBreaking: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  _count?: { articles: number; vlogs: number };
}

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  scheduledArticles: number;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { id: 'articles', icon: FileText, label: 'Articles' },
  { id: 'media', icon: ImageIcon, label: 'Médias' },
  { id: 'videos', icon: Video, label: 'Vidéos' },
  { id: 'categories', icon: Filter, label: 'Catégories' },
  { id: 'settings', icon: Settings, label: 'Paramètres' },
];

// Cache pour les images AI générées - avec tracking de l'imageUrl pour détecter les changements
const aiImageCache = new Map<string, { url: string; dbImageUrl: string | null }>();

// Composant pour afficher l'image AI de l'article
function ArticleImage({ article }: { article: Article }) {
  const [imageUrl, setImageUrl] = useState<string>('/images/placeholder-news.svg');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cacheKey = `admin-${article.id}`;
    const cachedData = aiImageCache.get(cacheKey);

    // PRIORITÉ 1: Si l'article a une imageUrl dans la DB, l'utiliser TOUJOURS
    // Cela inclut les images AI générées ET les images personnalisées
    if (article.imageUrl) {
      // Vérifier si l'image dans la DB a changé par rapport au cache
      if (cachedData && cachedData.dbImageUrl !== article.imageUrl) {
        // L'image a été modifiée, invalider le cache
        aiImageCache.delete(cacheKey);
      }

      // Utiliser l'image de la DB directement
      setImageUrl(article.imageUrl);
      aiImageCache.set(cacheKey, { url: article.imageUrl, dbImageUrl: article.imageUrl });
      setIsLoading(false);
      return;
    }

    // PRIORITÉ 2: Vérifier le cache seulement si pas d'image en DB
    if (cachedData && cachedData.dbImageUrl === null) {
      setImageUrl(cachedData.url);
      setIsLoading(false);
      return;
    }

    // PRIORITÉ 3: Générer l'image AI car pas d'image en DB
    const generateImage = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: article.title,
            summary: article.summary || '',
            category: article.category?.name?.toLowerCase() || 'societe'
          })
        });
        const data = await res.json();
        if (data.success && data.imageUrl) {
          setImageUrl(data.imageUrl);
          aiImageCache.set(cacheKey, { url: data.imageUrl, dbImageUrl: null });
        }
      } catch (error) {
        console.error('Error generating AI image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateImage();
  }, [article.id, article.title, article.summary, article.category, article.imageUrl]);

  return (
    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full object-cover"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Articles state
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articleSearch, setArticleSearch] = useState('');
  const [articleStatus, setArticleStatus] = useState('');
  const [articleCategoryId, setArticleCategoryId] = useState('');

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);

  // Stats state
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    scheduledArticles: 0,
  });

  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Media library state
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  // New category state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#ff6b35');

  // Scheduled articles state
  const [scheduledArticles, setScheduledArticles] = useState<Article[]>([]);
  const [isPublishingScheduled, setIsPublishingScheduled] = useState(false);

  // RSS sync state
  const [isSyncingRSS, setIsSyncingRSS] = useState(false);

  // Image update state
  const [isUpdatingImages, setIsUpdatingImages] = useState(false);


  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeMenu === 'articles') {
      fetchArticles();
    }
  }, [user, activeMenu, articleStatus, articleCategoryId]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/session', { credentials: 'include' });
      const data = await response.json();

      if (data.success && data.authenticated) {
        setUser(data.user);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/articles?limit=1000', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        const allArticles = data.articles;
        setStats({
          totalArticles: allArticles.length,
          publishedArticles: allArticles.filter((a: Article) => a.status === 'published').length,
          draftArticles: allArticles.filter((a: Article) => a.status === 'draft').length,
          scheduledArticles: allArticles.filter((a: Article) => a.status === 'scheduled').length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchArticles = async () => {
    setArticlesLoading(true);
    try {
      const params = new URLSearchParams();
      if (articleStatus) params.set('status', articleStatus);
      if (articleCategoryId) params.set('categoryId', articleCategoryId);
      if (articleSearch) params.set('search', articleSearch);

      const res = await fetch(`/api/admin/articles?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setArticlesLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSaveArticle = async (articleData: any) => {
    const url = editingArticle?.id
      ? `/api/admin/articles/${editingArticle.id}`
      : '/api/admin/articles';
    const method = editingArticle?.id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(articleData),
    });

    const data = await res.json();
    if (data.success) {
      setShowEditor(false);
      setEditingArticle(null);
      fetchArticles();
      fetchStats();
    } else {
      throw new Error(data.error);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;

    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        fetchArticles();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  // Toggle featured status directly from the list
  const handleToggleFeatured = async (article: Article) => {
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          summary: article.summary,
          categoryId: article.categoryId,
          imageUrl: article.imageUrl,
          sourceUrl: article.sourceUrl,
          sourceName: article.sourceName,
          status: article.status,
          isFeatured: !article.isFeatured,
          isBreaking: article.isBreaking,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchArticles();
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newCategoryName, color: newCategoryColor }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCategoryName('');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const fetchScheduledArticles = async () => {
    try {
      const res = await fetch('/api/admin/articles?status=scheduled', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setScheduledArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching scheduled articles:', error);
    }
  };

  const triggerScheduledPublish = async () => {
    setIsPublishingScheduled(true);
    try {
      const res = await fetch('/api/cron/publish');
      const data = await res.json();
      if (data.success && data.published > 0) {
        alert(`${data.published} article(s) publié(s) avec succès!`);
        fetchArticles();
        fetchStats();
        fetchScheduledArticles();
      } else {
        alert('Aucun article à publier pour le moment.');
      }
    } catch (error) {
      console.error('Error triggering scheduled publish:', error);
      alert('Erreur lors de la publication');
    } finally {
      setIsPublishingScheduled(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchScheduledArticles();
    }
  }, [user]);

  const syncRSSFeeds = async () => {
    setIsSyncingRSS(true);
    try {
      // Utiliser l'endpoint sync-rss qui inclut l'enrichissement IA automatique
      const res = await fetch('/api/cron/sync-rss');
      const data = await res.json();
      if (data.success) {
        alert(`Synchronisation réussie!\n• ${data.savedCount} nouveaux articles ajoutés\n• ${data.enhancedCount} enrichis avec l'IA`);
        fetchArticles();
        fetchStats();
      } else {
        alert('Erreur lors de la synchronisation');
      }
    } catch (error) {
      console.error('Error syncing RSS:', error);
      alert('Erreur lors de la synchronisation RSS');
    } finally {
      setIsSyncingRSS(false);
    }
  };

  // Mettre à jour les images des articles (Pixabay/Pexels)
  const updateArticleImages = async () => {
    setIsUpdatingImages(true);
    try {
      const res = await fetch('/api/admin/articles/update-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ updateAll: true }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`${data.results.updated} images mises à jour sur ${data.results.total} articles!`);
        fetchArticles();
        // Vider le cache des images pour forcer le rechargement
        aiImageCache.clear();
      } else {
        alert(data.error || 'Erreur lors de la mise à jour des images');
      }
    } catch (error) {
      console.error('Error updating images:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur réseau'}`);
    } finally {
      setIsUpdatingImages(false);
    }
  };


  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-MG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#ff6b35] mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#1a1a2e] text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
            {isSidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">Mada-Flash</h1>
                <p className="text-xs text-white/60">Administration</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isSidebarOpen && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] flex items-center justify-center font-bold">
              {user.username[0].toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-xs text-white/60 capitalize">{user.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {menuItems.find((m) => m.id === activeMenu)?.label}
            </h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('fr-MG', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={syncRSSFeeds}
              disabled={isSyncingRSS}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSyncingRSS ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Sync RSS
            </button>
            <button
              onClick={updateArticleImages}
              disabled={isUpdatingImages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
              title="Mettre à jour les images des articles sans image (Pixabay/Pexels)"
            >
              {isUpdatingImages ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              Images
            </button>
            <button
              onClick={() => {
                fetchArticles();
                fetchStats();
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => {
                setEditingArticle(null);
                setShowEditor(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Nouvel article
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Dashboard */}
          {activeMenu === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.totalArticles}</h3>
                  <p className="text-gray-500 text-sm">Articles totaux</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.publishedArticles}</h3>
                  <p className="text-gray-500 text-sm">Publiés</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <Edit className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.draftArticles}</h3>
                  <p className="text-gray-500 text-sm">Brouillons</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.scheduledArticles}</h3>
                  <p className="text-gray-500 text-sm">Programmés</p>
                </div>
              </div>

              {/* Scheduled Articles Section */}
              {scheduledArticles.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm mb-8">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-bold text-gray-900">Articles programmés</h2>
                    </div>
                    <button
                      onClick={triggerScheduledPublish}
                      disabled={isPublishingScheduled}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isPublishingScheduled ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      Publier maintenant
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {scheduledArticles.map((article) => (
                      <div key={article.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{article.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1 text-blue-600">
                              <Calendar className="w-3 h-3" />
                              {article.scheduledAt ? formatDate(article.scheduledAt) : 'Non programmé'}
                            </span>
                            {article.category && (
                              <span
                                className="px-2 py-0.5 rounded-full text-xs"
                                style={{ backgroundColor: article.category.color + '20', color: article.category.color }}
                              >
                                {article.category.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setEditingArticle(article);
                            setShowEditor(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Articles récents</h2>
                  <button
                    onClick={() => setActiveMenu('articles')}
                    className="text-[#ff6b35] text-sm font-medium flex items-center gap-1 hover:underline"
                  >
                    Voir tout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {articles.slice(0, 5).map((article) => (
                    <div key={article.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 truncate">{article.title}</h3>
                          {article.isFeatured && <Star className="w-4 h-4 text-amber-500" />}
                          {article.isBreaking && <Zap className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          {article.category && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs"
                              style={{ backgroundColor: article.category.color + '20', color: article.category.color }}
                            >
                              {article.category.name}
                            </span>
                          )}
                          <span>{formatDate(article.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            article.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : article.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {article.status === 'published' ? 'Publié' : article.status === 'scheduled' ? 'Programmé' : 'Brouillon'}
                        </span>
                        {/* Featured Toggle Button */}
                        <button
                          onClick={() => handleToggleFeatured(article)}
                          className={`p-2 rounded-lg transition-colors ${
                            article.isFeatured
                              ? 'bg-amber-100 hover:bg-amber-200'
                              : 'hover:bg-gray-100'
                          }`}
                          title={article.isFeatured ? 'Retirer de la une' : 'Mettre à la une'}
                        >
                          <Star className={`w-4 h-4 ${article.isFeatured ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingArticle(article);
                            setShowEditor(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {articles.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      Aucun article. Cliquez sur "Nouvel article" pour commencer.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Articles */}
          {activeMenu === 'articles' && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchArticles()}
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none"
                  />
                </div>
                <select
                  value={articleStatus}
                  onChange={(e) => setArticleStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none"
                >
                  <option value="">Tous les statuts</option>
                  <option value="draft">Brouillons</option>
                  <option value="published">Publiés</option>
                  <option value="scheduled">Programmés</option>
                </select>
                <select
                  value={articleCategoryId}
                  onChange={(e) => setArticleCategoryId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {articlesLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35] mx-auto" />
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {articles.map((article) => (
                    <div key={article.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <ArticleImage article={article} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 truncate">{article.title}</h3>
                            {article.isFeatured && <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                            {article.isBreaking && <Zap className="w-4 h-4 text-red-500 flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                            {article.category && (
                              <span
                                className="px-2 py-0.5 rounded-full text-xs"
                                style={{ backgroundColor: article.category.color + '20', color: article.category.color }}
                              >
                                {article.category.name}
                              </span>
                            )}
                            {article.sourceName && <span>{article.sourceName}</span>}
                            <span>{formatDate(article.createdAt)}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {article.views}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            article.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : article.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {article.status === 'published' ? 'Publié' : article.status === 'scheduled' ? 'Programmé' : 'Brouillon'}
                        </span>
                        {/* Featured Toggle Button */}
                        <button
                          onClick={() => handleToggleFeatured(article)}
                          className={`p-2 rounded-lg transition-colors ${
                            article.isFeatured
                              ? 'bg-amber-100 hover:bg-amber-200'
                              : 'hover:bg-gray-100'
                          }`}
                          title={article.isFeatured ? 'Retirer de la une' : 'Mettre à la une'}
                        >
                          <Star className={`w-4 h-4 ${article.isFeatured ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingArticle(article);
                            setShowEditor(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {articles.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucun article trouvé</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Media */}
          {activeMenu === 'media' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center py-8">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Bibliothèque de médias</h3>
                <p className="text-gray-500 mb-4">Gérez vos images et fichiers</p>
                <button
                  onClick={() => setShowMediaLibrary(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Ouvrir la bibliothèque
                </button>
              </div>
            </div>
          )}

          {/* Videos */}
          {activeMenu === 'videos' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion des vidéos</h3>
                <p className="text-gray-500 mb-4">Ajoutez et gérez les vlogs</p>
                <button className="px-4 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Ajouter une vidéo
                </button>
              </div>
            </div>
          )}

          {/* Categories */}
          {activeMenu === 'categories' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Nouvelle catégorie</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nom de la catégorie"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none"
                  />
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer"
                  />
                  <button
                    onClick={handleCreateCategory}
                    className="px-4 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Catégories existantes</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-sm text-gray-500">
                          ({cat._count?.articles || 0} articles)
                        </span>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      Aucune catégorie
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeMenu === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Paramètres du site</h2>
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom du site</label>
                  <input
                    type="text"
                    defaultValue="Mada-Flash.mg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slogan</label>
                  <input
                    type="text"
                    defaultValue="L'Info en Bref. Toujours la Source."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none"
                  />
                </div>
                <button className="px-6 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Sauvegarder
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Article Editor Modal */}
      {showEditor && (
        <ArticleEditor
          article={editingArticle}
          onSave={handleSaveArticle}
          onClose={() => {
            setShowEditor(false);
            setEditingArticle(null);
          }}
        />
      )}

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
      />
    </div>
  );
}
