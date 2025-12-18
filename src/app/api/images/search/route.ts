import { NextRequest, NextResponse } from 'next/server';

// Free image search API - Pixabay and Pexels
// Priority: Pixabay -> Pexels -> Unsplash -> AI Generation

interface ImageResult {
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

// Extract keywords from text for image search
function extractKeywords(title: string, summary?: string): string {
  const text = `${title} ${summary || ''}`.toLowerCase();

  // Madagascar-specific keywords mapping
  const keywordMappings: Record<string, string[]> = {
    'madagascar': ['politique', 'président', 'gouvernement', 'ministre', 'assemblée', 'élection'],
    'antananarivo': ['tana', 'capitale', 'tananarive'],
    'football': ['barea', 'foot', 'match', 'cnaps', 'fmf'],
    'économie': ['ariary', 'inflation', 'commerce', 'investissement', 'banque'],
    'environnement': ['cyclone', 'climat', 'forêt', 'nature', 'biodiversité'],
    'santé': ['hôpital', 'médecin', 'maladie', 'vaccination'],
    'éducation': ['école', 'université', 'étudiant', 'bepc', 'bacc'],
    'agriculture': ['riz', 'vanille', 'culture', 'récolte', 'paysan'],
    'transport': ['route', 'avion', 'bateau', 'taxi-brousse'],
    'tourisme': ['plage', 'parc', 'lémuriens', 'baobab'],
  };

  // Find relevant category
  let searchTerms: string[] = [];

  for (const [category, keywords] of Object.entries(keywordMappings)) {
    if (keywords.some(kw => text.includes(kw))) {
      searchTerms.push(category);
      searchTerms.push('madagascar');
      break;
    }
  }

  // If no specific category found, use generic Madagascar search
  if (searchTerms.length === 0) {
    // Extract first few meaningful words from title
    const words = title
      .toLowerCase()
      .replace(/[^\w\sàâäéèêëïîôùûüÿçœæ]/g, '')
      .split(' ')
      .filter(w => w.length > 3)
      .slice(0, 3);

    searchTerms = [...words, 'madagascar'];
  }

  return searchTerms.join(' ');
}

// Search Pixabay (Free API - 100 requests/minute)
async function searchPixabay(query: string): Promise<ImageResult | null> {
  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey) {
    console.log('Pixabay API key not configured');
    return null;
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodedQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=5&lang=fr`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.hits && data.hits.length > 0) {
      const hit: PixabayHit = data.hits[0];
      return {
        url: hit.largeImageURL,
        thumbnailUrl: hit.previewURL,
        source: 'Pixabay',
        photographer: hit.user,
        sourceUrl: hit.pageURL
      };
    }
  } catch (error) {
    console.error('Pixabay search error:', error);
  }

  return null;
}

// Search Pexels (Free API - 200 requests/month)
async function searchPexels(query: string): Promise<ImageResult | null> {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    console.log('Pexels API key not configured');
    return null;
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodedQuery}&per_page=5&orientation=landscape`,
      {
        headers: { Authorization: apiKey },
        next: { revalidate: 3600 }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      const photo: PexelsPhoto = data.photos[0];
      return {
        url: photo.src.large,
        thumbnailUrl: photo.src.small,
        source: 'Pexels',
        photographer: photo.photographer,
        sourceUrl: photo.url
      };
    }
  } catch (error) {
    console.error('Pexels search error:', error);
  }

  return null;
}

// Search Unsplash (Free API - 50 requests/hour)
async function searchUnsplash(query: string): Promise<ImageResult | null> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!apiKey) {
    console.log('Unsplash API key not configured');
    return null;
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodedQuery}&per_page=5&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${apiKey}` },
        next: { revalidate: 3600 }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result: UnsplashResult = data.results[0];
      return {
        url: result.urls.regular,
        thumbnailUrl: result.urls.small,
        source: 'Unsplash',
        photographer: result.user.name,
        sourceUrl: result.links.html
      };
    }
  } catch (error) {
    console.error('Unsplash search error:', error);
  }

  return null;
}

// Generate image with AI (Gemini) as fallback
async function generateAIImage(query: string, title: string): Promise<ImageResult | null> {
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
          // Return base64 image
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  const summary = searchParams.get('summary') || '';
  const forceAI = searchParams.get('forceAI') === 'true';

  if (!title) {
    return NextResponse.json(
      { success: false, error: 'Title is required' },
      { status: 400 }
    );
  }

  // Extract search keywords
  const keywords = extractKeywords(title, summary);

  let image: ImageResult | null = null;

  // If not forcing AI, try free image sources first
  if (!forceAI) {
    // Try Pixabay first (most generous free tier)
    image = await searchPixabay(keywords);

    // Try Pexels if Pixabay fails
    if (!image) {
      image = await searchPexels(keywords);
    }

    // Try Unsplash if others fail
    if (!image) {
      image = await searchUnsplash(keywords);
    }
  }

  // Fall back to AI generation if no free image found
  if (!image) {
    image = await generateAIImage(keywords, title);
  }

  if (image) {
    return NextResponse.json({
      success: true,
      image,
      keywords,
      source: image.source
    });
  }

  // Return placeholder if all else fails
  return NextResponse.json({
    success: true,
    image: {
      url: '/images/placeholder-news.svg',
      thumbnailUrl: '/images/placeholder-news.svg',
      source: 'Placeholder',
      photographer: null
    },
    keywords,
    source: 'Placeholder'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, summary, category } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Build search query with category if provided
    let searchQuery = extractKeywords(title, summary);
    if (category) {
      searchQuery = `${category} ${searchQuery}`;
    }

    let image: ImageResult | null = null;

    // Try all sources in order
    image = await searchPixabay(searchQuery);

    if (!image) {
      image = await searchPexels(searchQuery);
    }

    if (!image) {
      image = await searchUnsplash(searchQuery);
    }

    if (!image) {
      image = await generateAIImage(searchQuery, title);
    }

    if (image) {
      return NextResponse.json({
        success: true,
        image,
        keywords: searchQuery,
        source: image.source
      });
    }

    return NextResponse.json({
      success: true,
      image: {
        url: '/images/placeholder-news.svg',
        thumbnailUrl: '/images/placeholder-news.svg',
        source: 'Placeholder'
      },
      keywords: searchQuery,
      source: 'Placeholder'
    });

  } catch (error) {
    console.error('Image search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search for images' },
      { status: 500 }
    );
  }
}
