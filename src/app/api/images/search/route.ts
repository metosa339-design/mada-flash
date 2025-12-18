import { NextRequest, NextResponse } from 'next/server';
import {
  extractKeywords,
  searchPixabay,
  searchPexels,
  searchUnsplash,
  generateAIImage,
  ImageResult
} from '@/lib/image-search';

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

    // Extraire les mots-clés optimisés pour la recherche d'images
    const searchQuery = extractKeywords(title, summary, category);

    console.log(`Image search: title="${title.substring(0, 50)}...", category="${category}", query="${searchQuery}"`);

    let image: ImageResult | null = null;

    // Try Pixabay first (avec retry et termes alternatifs)
    image = await searchPixabay(searchQuery, category);

    // Try Pexels if Pixabay fails
    if (!image) {
      image = await searchPexels(searchQuery);
    }

    // Try Unsplash if others fail
    if (!image) {
      image = await searchUnsplash(searchQuery);
    }

    // Fall back to AI generation if no free image found
    if (!image) {
      console.log('No free image found, falling back to AI generation...');
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

    // Return placeholder if all else fails
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
