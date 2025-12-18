// Free image search utilities - Pixabay, Pexels, Unsplash, AI Generation
// This module can be imported directly without HTTP calls

import { prisma } from '@/lib/db';

export interface ImageResult {
  url: string;
  thumbnailUrl: string;
  source: string;
  photographer?: string;
  sourceUrl?: string;
}

interface PixabayHit {
  webformatURL: string;
  largeImageURL: string;
  previewURL: string;
  user: string;
  pageURL: string;
}

interface PexelsPhoto {
  src: {
    large: string;
    medium: string;
    small: string;
  };
  photographer: string;
  url: string;
}

interface UnsplashResult {
  urls: {
    regular: string;
    small: string;
  };
  user: {
    name: string;
  };
  links: {
    html: string;
  };
}

// Mots à ignorer dans la recherche (stop words français)
const STOP_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'au', 'aux',
  'et', 'ou', 'mais', 'donc', 'car', 'ni', 'que', 'qui', 'quoi',
  'ce', 'cette', 'ces', 'son', 'sa', 'ses', 'leur', 'leurs',
  'pour', 'par', 'sur', 'sous', 'dans', 'avec', 'sans', 'entre',
  'est', 'sont', 'être', 'avoir', 'fait', 'faire', 'dit', 'dire',
  'plus', 'moins', 'très', 'bien', 'mal', 'peu', 'trop', 'aussi',
  'comme', 'même', 'autre', 'tous', 'tout', 'toute', 'toutes',
  'après', 'avant', 'depuis', 'pendant', 'encore', 'déjà', 'alors'
]);

// Mapping catégorie -> termes de recherche Pixabay optimisés
const CATEGORY_IMAGE_TERMS: Record<string, string[]> = {
  politique: ['government building', 'politics africa', 'parliament', 'meeting official'],
  economie: ['economy africa', 'business market', 'money currency', 'finance graph'],
  sport: ['football africa', 'soccer stadium', 'sports team', 'athletics'],
  culture: ['african culture', 'traditional dance', 'music festival', 'art africa'],
  societe: ['african community', 'people africa', 'social gathering', 'education africa'],
  international: ['world map', 'global diplomacy', 'international meeting', 'flags nations'],
  environnement: ['madagascar nature', 'tropical forest', 'wildlife lemur', 'baobab tree'],
  technologie: ['technology africa', 'digital innovation', 'smartphone africa', 'internet']
};

// Termes spécifiques Madagascar pour Pixabay
const MADAGASCAR_TERMS = [
  'madagascar', 'antananarivo', 'lemur', 'baobab', 'tropical island',
  'african landscape', 'indian ocean', 'rice field asia'
];

// Get recently used image URLs from database (last 30 days)
export async function getRecentlyUsedImages(): Promise<Set<string>> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const articles = await prisma.article.findMany({
      where: {
        imageUrl: { not: null },
        publishedAt: { gte: thirtyDaysAgo }
      },
      select: { imageUrl: true }
    });

    const usedUrls = new Set<string>();
    for (const article of articles) {
      if (article.imageUrl && !article.imageUrl.includes('placeholder') && !article.imageUrl.startsWith('data:')) {
        usedUrls.add(article.imageUrl);
      }
    }

    console.log(`Found ${usedUrls.size} recently used images to avoid duplicates`);
    return usedUrls;
  } catch (error) {
    console.error('Error fetching recently used images:', error);
    return new Set();
  }
}

// Extract keywords from text for image search - Version améliorée
export function extractKeywords(title: string, summary?: string, category?: string): string {
  const text = `${title} ${summary || ''}`.toLowerCase();

  // 1. Si on a une catégorie, utiliser les termes optimisés pour cette catégorie
  if (category && CATEGORY_IMAGE_TERMS[category]) {
    const categoryTerms = CATEGORY_IMAGE_TERMS[category];
    // Ajouter un terme Madagascar si pertinent
    const randomCategoryTerm = categoryTerms[Math.floor(Math.random() * categoryTerms.length)];
    return `${randomCategoryTerm} madagascar`;
  }

  // 2. Détection de thèmes spécifiques dans le titre
  const themeKeywords: Record<string, string> = {
    // Sport
    'barea': 'football madagascar team',
    'football': 'soccer match stadium',
    'sport': 'sports competition africa',
    'match': 'football stadium game',
    'can': 'african cup nations football',

    // Politique
    'président': 'president government africa',
    'gouvernement': 'government building politics',
    'ministre': 'minister meeting official',
    'élection': 'election voting democracy',
    'assemblée': 'parliament assembly politics',

    // Économie
    'économie': 'economy business africa',
    'ariary': 'currency money finance',
    'banque': 'bank finance building',
    'commerce': 'market trade business',
    'investissement': 'investment business growth',

    // Société
    'santé': 'health hospital medical',
    'éducation': 'education school students',
    'école': 'school classroom education',
    'université': 'university campus students',

    // Environnement
    'cyclone': 'tropical storm weather',
    'environnement': 'nature environment green',
    'climat': 'climate weather nature',
    'forêt': 'forest tropical trees',

    // Transport
    'route': 'road highway infrastructure',
    'avion': 'airplane airport aviation',
    'transport': 'transportation vehicle road',

    // Tourisme
    'tourisme': 'tourism travel madagascar',
    'plage': 'beach tropical paradise',
    'parc': 'national park wildlife',
    'lémuriens': 'lemur madagascar wildlife'
  };

  // Chercher un thème correspondant
  for (const [keyword, searchTerm] of Object.entries(themeKeywords)) {
    if (text.includes(keyword)) {
      return searchTerm;
    }
  }

  // 3. Fallback: extraire les mots significatifs du titre
  const words = title
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëïîôùûüÿçœæ-]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, 2);

  if (words.length > 0) {
    // Ajouter "madagascar" ou "africa" pour contextualiser
    return `${words.join(' ')} madagascar africa`;
  }

  // 4. Dernier fallback: image générique de Madagascar
  const fallbackTerms = MADAGASCAR_TERMS[Math.floor(Math.random() * MADAGASCAR_TERMS.length)];
  return `${fallbackTerms} nature`;
}

// Générer des termes de recherche alternatifs si la première recherche échoue
export function getAlternativeSearchTerms(category?: string): string[] {
  const alternatives = [
    'madagascar landscape nature',
    'african cityscape urban',
    'tropical island paradise',
    'madagascar wildlife lemur',
    'african people community',
    'baobab tree sunset',
    'antananarivo city aerial'
  ];

  if (category && CATEGORY_IMAGE_TERMS[category]) {
    return [...CATEGORY_IMAGE_TERMS[category], ...alternatives.slice(0, 3)];
  }

  return alternatives;
}

// Search Pixabay (Free API - 100 requests/minute) - with duplicate avoidance
export async function searchPixabay(
  query: string,
  category?: string,
  excludeUrls?: Set<string>
): Promise<ImageResult | null> {
  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey) {
    console.log('Pixabay API key not configured');
    return null;
  }

  // Liste des requêtes à essayer
  const queriesToTry = [query];

  // Ajouter des termes alternatifs si la catégorie est fournie
  if (category) {
    const alternatives = getAlternativeSearchTerms(category);
    queriesToTry.push(...alternatives.slice(0, 2));
  }

  for (const searchQuery of queriesToTry) {
    try {
      const encodedQuery = encodeURIComponent(searchQuery);
      // Fetch more results to have options for duplicate avoidance
      const response = await fetch(
        `https://pixabay.com/api/?key=${apiKey}&q=${encodedQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=20`
      );

      if (!response.ok) continue;

      const data = await response.json();

      if (data.hits && data.hits.length > 0) {
        // Filter out already used images
        const availableHits = excludeUrls
          ? data.hits.filter((hit: PixabayHit) => !excludeUrls.has(hit.largeImageURL))
          : data.hits;

        if (availableHits.length > 0) {
          // Prendre une image aléatoire parmi les résultats disponibles
          const maxIndex = Math.min(5, availableHits.length);
          const randomIndex = Math.floor(Math.random() * maxIndex);
          const hit: PixabayHit = availableHits[randomIndex];

          console.log(`Pixabay: Image unique trouvée pour "${searchQuery}" - ${hit.largeImageURL}`);

          return {
            url: hit.largeImageURL,
            thumbnailUrl: hit.previewURL,
            source: 'Pixabay',
            photographer: hit.user,
            sourceUrl: hit.pageURL
          };
        } else {
          console.log(`Pixabay: Tous les résultats pour "${searchQuery}" sont déjà utilisés, essai suivant...`);
        }
      }

      console.log(`Pixabay: Aucun résultat pour "${searchQuery}", essai suivant...`);
    } catch (error) {
      console.error(`Pixabay search error for "${searchQuery}":`, error);
    }
  }

  return null;
}

// Search Pexels (Free API - 200 requests/month) - with duplicate avoidance
export async function searchPexels(query: string, excludeUrls?: Set<string>): Promise<ImageResult | null> {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    console.log('Pexels API key not configured');
    return null;
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    // Fetch more results for duplicate avoidance
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodedQuery}&per_page=15&orientation=landscape`,
      {
        headers: { Authorization: apiKey }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      // Filter out already used images
      const availablePhotos = excludeUrls
        ? data.photos.filter((photo: PexelsPhoto) => !excludeUrls.has(photo.src.large))
        : data.photos;

      if (availablePhotos.length > 0) {
        // Pick a random one from available
        const randomIndex = Math.floor(Math.random() * Math.min(5, availablePhotos.length));
        const photo: PexelsPhoto = availablePhotos[randomIndex];

        console.log(`Pexels: Image unique trouvée - ${photo.src.large}`);

        return {
          url: photo.src.large,
          thumbnailUrl: photo.src.small,
          source: 'Pexels',
          photographer: photo.photographer,
          sourceUrl: photo.url
        };
      }
    }
  } catch (error) {
    console.error('Pexels search error:', error);
  }

  return null;
}

// Search Unsplash (Free API - 50 requests/hour) - with duplicate avoidance
export async function searchUnsplash(query: string, excludeUrls?: Set<string>): Promise<ImageResult | null> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!apiKey) {
    console.log('Unsplash API key not configured');
    return null;
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    // Fetch more results for duplicate avoidance
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodedQuery}&per_page=15&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${apiKey}` }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Filter out already used images
      const availableResults = excludeUrls
        ? data.results.filter((result: UnsplashResult) => !excludeUrls.has(result.urls.regular))
        : data.results;

      if (availableResults.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(5, availableResults.length));
        const result: UnsplashResult = availableResults[randomIndex];

        console.log(`Unsplash: Image unique trouvée - ${result.urls.regular}`);

        return {
          url: result.urls.regular,
          thumbnailUrl: result.urls.small,
          source: 'Unsplash',
          photographer: result.user.name,
          sourceUrl: result.links.html
        };
      }
    }
  } catch (error) {
    console.error('Unsplash search error:', error);
  }

  return null;
}

// Generate image with AI (Gemini) as fallback - always unique
export async function generateAIImage(query: string, title: string): Promise<ImageResult | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.log('Gemini API key not configured');
    return null;
  }

  try {
    // Use Gemini's image generation endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a professional news article illustration image for this headline: "${title}".
                     The image should be appropriate for a news website, photorealistic style,
                     landscape orientation, suitable for Madagascar news context.
                     Keywords: ${query}`
            }]
          }],
          generationConfig: {
            responseModalities: ["image", "text"],
            responseMimeType: "image/jpeg"
          }
        })
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return null;
    }

    const data = await response.json();

    // Check if image was generated
    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          // Return base64 image - always unique since AI generates it
          return {
            url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            thumbnailUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            source: 'AI Generated (Gemini)',
            photographer: 'Intelligence Artificielle'
          };
        }
      }
    }
  } catch (error) {
    console.error('AI image generation error:', error);
  }

  return null;
}

// Main search function - searches all sources in priority order with duplicate avoidance
export async function searchImage(
  title: string,
  summary?: string,
  category?: string,
  forceAI: boolean = false,
  excludeUrls?: Set<string>
): Promise<ImageResult | null> {
  // Extract search keywords
  const searchQuery = extractKeywords(title, summary, category);

  console.log(`Image search: title="${title.substring(0, 50)}...", category="${category}", query="${searchQuery}"`);

  // Get recently used images if not provided
  const usedImages = excludeUrls || await getRecentlyUsedImages();

  let image: ImageResult | null = null;

  // If not forcing AI, try free image sources first
  if (!forceAI) {
    // Try Pixabay first (most generous free tier)
    image = await searchPixabay(searchQuery, category, usedImages);

    // Try Pexels if Pixabay fails
    if (!image) {
      image = await searchPexels(searchQuery, usedImages);
    }

    // Try Unsplash if others fail
    if (!image) {
      image = await searchUnsplash(searchQuery, usedImages);
    }
  }

  // Fall back to AI generation if no free image found (AI always generates unique images)
  if (!image) {
    console.log('No unique free image found, falling back to AI generation...');
    image = await generateAIImage(searchQuery, title);
  }

  return image;
}
