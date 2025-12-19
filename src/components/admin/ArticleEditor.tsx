'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  X,
  Calendar,
  Clock,
  Image as ImageIcon,
  Link,
  Star,
  Zap,
  Eye,
  Upload,
  Loader2,
  Sparkles,
  RefreshCw,
  Trash2,
  ImagePlus,
  Wand2,
  FileEdit,
  Brain,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Article {
  id?: string;
  title: string;
  content: string;
  summary?: string;
  categoryId?: string;
  imageUrl?: string;
  sourceUrl?: string;
  sourceName?: string;
  status: string;
  scheduledAt?: string;
  isFeatured: boolean;
  isBreaking: boolean;
}

interface ArticleEditorProps {
  article?: Article | null;
  onSave: (article: Article) => Promise<void>;
  onClose: () => void;
}

export default function ArticleEditor({ article, onSave, onClose }: ArticleEditorProps) {
  const [formData, setFormData] = useState<Article>({
    title: '',
    content: '',
    summary: '',
    categoryId: '',
    imageUrl: '',
    sourceUrl: '',
    sourceName: '',
    status: 'draft',
    scheduledAt: '',
    isFeatured: false,
    isBreaking: false,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);
  const [aiImageGenerated, setAiImageGenerated] = useState(false);
  // 'ai' = use AI generated image, 'custom' = use manual upload/URL
  const [imageMode, setImageMode] = useState<'ai' | 'custom'>('ai');
  // AI content enhancement
  const [isEnhancingContent, setIsEnhancingContent] = useState(false);
  const [contentEnhanced, setContentEnhanced] = useState(false);

  useEffect(() => {
    if (article) {
      setFormData({
        ...article,
        scheduledAt: article.scheduledAt ? new Date(article.scheduledAt).toISOString().slice(0, 16) : '',
      });
      if (article.imageUrl) {
        setImagePreview(article.imageUrl);
        // Detect if existing image is AI-generated
        const isAiImage = article.imageUrl.startsWith('/images/generated/');
        setImageMode(isAiImage ? 'ai' : 'custom');
        setAiImageGenerated(isAiImage);
      }
    }
    fetchCategories();
  }, [article]);

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

  // Get category slug from category ID
  const getCategorySlug = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return 'societe';
    // Map category name to slug
    const nameToSlug: Record<string, string> = {
      'Politique': 'politique',
      'Économie': 'economie',
      'Sport': 'sport',
      'Culture': 'culture',
      'Société': 'societe',
      'International': 'international',
      'Environnement': 'environnement',
      'Technologie': 'technologie'
    };
    return nameToSlug[category.name] || 'societe';
  };

  // Enhance content with AI - creates original analytical article
  const enhanceContentWithAI = async () => {
    if (!formData.title) {
      setError('Veuillez entrer un titre avant d\'enrichir le contenu');
      return;
    }

    setIsEnhancingContent(true);
    setError('');

    try {
      const categorySlug = formData.categoryId ? getCategorySlug(formData.categoryId) : 'societe';

      const response = await fetch('/api/enhance-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalTitle: formData.title,
          originalSummary: formData.summary || formData.content?.substring(0, 300) || '',
          category: categorySlug,
          sourceName: formData.sourceName || 'Source',
          sourceUrl: formData.sourceUrl || ''
        })
      });

      const data = await response.json();

      if (data.success && data.enhanced) {
        // Update form with enhanced content
        setFormData({
          ...formData,
          title: data.enhanced.title,
          summary: data.enhanced.summary,
          content: data.enhanced.content
        });
        setContentEnhanced(true);
      } else {
        setError('Échec de l\'enrichissement du contenu');
      }
    } catch (error) {
      console.error('Content enhancement error:', error);
      setError('Erreur lors de l\'enrichissement du contenu');
    } finally {
      setIsEnhancingContent(false);
    }
  };

  // Generate AI image based on article content
  const generateAiImage = async () => {
    if (!formData.title) {
      setError('Veuillez entrer un titre avant de générer une image');
      return;
    }

    setIsGeneratingAiImage(true);
    setError('');

    try {
      const categorySlug = formData.categoryId ? getCategorySlug(formData.categoryId) : 'societe';

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          summary: formData.summary || formData.content?.substring(0, 200) || '',
          category: categorySlug,
          forceGenerate: true  // Force new generation
        })
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setImagePreview(data.imageUrl);
        setFormData({ ...formData, imageUrl: data.imageUrl });
        setImageFile(null);  // Clear any uploaded file
        setAiImageGenerated(true);
      } else {
        setError('Échec de la génération de l\'image AI');
      }
    } catch (error) {
      console.error('AI image generation error:', error);
      setError('Erreur lors de la génération de l\'image AI');
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.imageUrl || null;

    const formDataUpload = new FormData();
    formDataUpload.append('file', imageFile);
    formDataUpload.append('folder', 'articles');

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        credentials: 'include',
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.success) {
        return data.media.url;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Upload image first if there's a new one
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      await onSave({
        ...formData,
        imageUrl,
      });
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setFormData({ ...formData, status: 'published' });
    // Small delay to ensure state is updated before submit
    setTimeout(() => {
      const form = document.getElementById('article-form') as HTMLFormElement;
      form?.requestSubmit();
    }, 100);
  };

  const handleSchedule = async () => {
    if (!formData.scheduledAt) {
      setError('Veuillez sélectionner une date de publication');
      return;
    }
    setFormData({ ...formData, status: 'scheduled' });
    setTimeout(() => {
      const form = document.getElementById('article-form') as HTMLFormElement;
      form?.requestSubmit();
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {article?.id ? 'Modifier l\'article' : 'Nouvel article'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          id="article-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none"
              placeholder="Titre de l'article"
              required
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Résumé
            </label>
            <textarea
              value={formData.summary || ''}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none resize-none"
              rows={2}
              placeholder="Bref résumé de l'article"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none resize-none"
              rows={10}
              placeholder="Contenu de l'article..."
              required
            />
          </div>

          {/* AI Content Enhancement Section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b border-emerald-200">
              <h3 className="font-semibold text-emerald-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-600" />
                Enrichissement IA du contenu
              </h3>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
              <div className="mb-4">
                <p className="text-sm text-emerald-800 leading-relaxed">
                  L'IA va réécrire entièrement l'article avec:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-emerald-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Un titre captivant et accrocheur
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Une analyse approfondie avec contexte
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Des **passages en gras** pour les points importants
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Des chiffres et statistiques pertinents
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Citation de la source originale
                  </li>
                </ul>
              </div>

              {contentEnhanced && (
                <div className="mb-4 p-3 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-emerald-800">
                    Contenu enrichi avec succès!
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={enhanceContentWithAI}
                disabled={isEnhancingContent || !formData.title}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-emerald-200"
              >
                {isEnhancingContent ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enrichissement en cours...
                  </>
                ) : contentEnhanced ? (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Ré-enrichir le contenu
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Enrichir avec l'IA
                  </>
                )}
              </button>

              {!formData.title && (
                <p className="text-xs text-emerald-600 mt-2 text-center">
                  Veuillez d'abord entrer un titre pour l'article
                </p>
              )}
            </div>
          </div>

          {/* Image Section - STRICT OPTIONS */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Image de l'article
              </h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Current Image Preview */}
              {imagePreview && (
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-52 object-contain"
                  />
                  {/* Badge showing image type */}
                  <div className={`absolute bottom-3 left-3 px-3 py-1.5 text-white text-xs font-medium rounded-full flex items-center gap-1.5 ${
                    imageMode === 'ai' ? 'bg-purple-600' : 'bg-blue-600'
                  }`}>
                    {imageMode === 'ai' ? (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Image IA
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-3 h-3" />
                        Image personnalisée
                      </>
                    )}
                  </div>

                  {/* DELETE BUTTON - PROMINENT */}
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                      setFormData({ ...formData, imageUrl: '' });
                      setAiImageGenerated(false);
                    }}
                    className="absolute top-3 right-3 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg flex items-center gap-2 font-medium text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              )}

              {/* Mode Selection - Only show when NO image */}
              {!imagePreview && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: AI Image */}
                  <button
                    type="button"
                    onClick={() => setImageMode('ai')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      imageMode === 'ai'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        imageMode === 'ai' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                      }`}>
                        {imageMode === 'ai' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <Wand2 className={`w-5 h-5 ${imageMode === 'ai' ? 'text-purple-600' : 'text-gray-400'}`} />
                    </div>
                    <span className={`font-semibold block ${imageMode === 'ai' ? 'text-purple-700' : 'text-gray-700'}`}>
                      Image IA automatique
                    </span>
                    <span className="text-xs text-gray-500 mt-1 block">
                      Générée par Gemini
                    </span>
                  </button>

                  {/* Option 2: Custom Image */}
                  <button
                    type="button"
                    onClick={() => setImageMode('custom')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      imageMode === 'custom'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        imageMode === 'custom' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {imageMode === 'custom' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <ImagePlus className={`w-5 h-5 ${imageMode === 'custom' ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <span className={`font-semibold block ${imageMode === 'custom' ? 'text-blue-700' : 'text-gray-700'}`}>
                      Image personnalisée
                    </span>
                    <span className="text-xs text-gray-500 mt-1 block">
                      Upload ou URL
                    </span>
                  </button>
                </div>
              )}

              {/* AI Image Generation Panel */}
              {imageMode === 'ai' && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">Génération IA Gemini</span>
                  </div>
                  <p className="text-sm text-purple-700 mb-4">
                    L'image sera générée automatiquement en fonction du titre, résumé et catégorie de l'article.
                  </p>
                  <button
                    type="button"
                    onClick={generateAiImage}
                    disabled={isGeneratingAiImage || !formData.title}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isGeneratingAiImage ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Génération en cours...
                      </>
                    ) : imagePreview && imageMode === 'ai' ? (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Régénérer une nouvelle image
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Générer l'image IA
                      </>
                    )}
                  </button>
                  {!formData.title && (
                    <p className="text-xs text-purple-600 mt-2 text-center">
                      Veuillez d'abord entrer un titre pour l'article
                    </p>
                  )}
                </div>
              )}

              {/* Custom Image Upload Panel */}
              {imageMode === 'custom' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ImagePlus className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Image personnalisée</span>
                  </div>

                  {/* Upload from computer */}
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Depuis votre ordinateur
                    </label>
                    <label className="flex items-center justify-center w-full h-28 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-100/50 transition-colors bg-white">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          handleImageChange(e);
                          setAiImageGenerated(false);
                        }}
                        className="hidden"
                      />
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <span className="text-sm text-blue-600 font-medium">
                          Cliquez pour uploader
                        </span>
                        <span className="text-xs text-blue-500 block mt-1">
                          PNG, JPG, GIF jusqu'à 10MB
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Separator */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-blue-200"></div>
                    <span className="text-xs text-blue-500 font-medium">OU</span>
                    <div className="flex-1 h-px bg-blue-200"></div>
                  </div>

                  {/* URL input */}
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Depuis une URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl && !formData.imageUrl.startsWith('/images/generated/') ? formData.imageUrl : ''}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        setImagePreview(e.target.value);
                        setAiImageGenerated(false);
                        setImageFile(null);
                      }}
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                      placeholder="https://exemple.com/image.jpg"
                    />
                  </div>
                </div>
              )}

              {/* Switch mode button when image exists */}
              {imagePreview && (
                <div className="pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      // Clear current image and switch mode
                      setImageFile(null);
                      setImagePreview('');
                      setFormData({ ...formData, imageUrl: '' });
                      setAiImageGenerated(false);
                      setImageMode(imageMode === 'ai' ? 'custom' : 'ai');
                    }}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
                  >
                    {imageMode === 'ai'
                      ? "Utiliser une image personnalisée"
                      : "Utiliser la génération IA"
                    }
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={formData.categoryId || ''}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none"
              >
                <option value="">Aucune catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <input
                type="text"
                value={formData.sourceName || ''}
                onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none"
                placeholder="Nom de la source"
              />
            </div>
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Link className="w-4 h-4 inline-block mr-1" />
              Lien source original
            </label>
            <input
              type="url"
              value={formData.sourceUrl || ''}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none"
              placeholder="https://..."
            />
          </div>

          {/* Scheduling */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline-block mr-1" />
              Publication programmée
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt || ''}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] outline-none"
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-[#ff6b35] border-gray-300 rounded focus:ring-[#ff6b35]"
              />
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-gray-700">Article à la une</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isBreaking}
                onChange={(e) => setFormData({ ...formData, isBreaking: e.target.checked })}
                className="w-4 h-4 text-[#ff6b35] border-gray-300 rounded focus:ring-[#ff6b35]"
              />
              <Zap className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-700">Breaking news</span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          {/* Action buttons - reorganized for better visibility */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Statut:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  formData.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : formData.status === 'scheduled'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {formData.status === 'published'
                  ? 'Publié'
                  : formData.status === 'scheduled'
                  ? 'Programmé'
                  : 'Brouillon'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="article-form"
                disabled={isSaving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Brouillon
              </button>
              {formData.scheduledAt && (
                <button
                  type="button"
                  onClick={handleSchedule}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Programmer
                </button>
              )}
              {/* PUBLISH BUTTON - More prominent */}
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2 font-semibold shadow-lg shadow-green-200"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Publier maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
