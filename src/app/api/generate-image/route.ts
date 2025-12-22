import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// In-memory cache for generated images
const imageCache = new Map<string, { imageUrl: string; timestamp: number }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days for AI-generated images

// Generate unique fallback image using title as seed
// Each article gets a unique image from Picsum based on its title
function getCategoryFallbackImage(category: string, title: string): string {
  // Create a unique seed from the title - this ensures each article gets a unique image
  const seed = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 30) + category;

  // Use Picsum with unique seed for each article
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/450`;
}

// Category translations for the prompt (French to English context)
const categoryContext: Record<string, string> = {
  politique: 'political scene, government building, official meeting room, parliament, formal setting in Madagascar',
  economie: 'business scene, market, commerce, financial district, trading, economy symbols, Madagascar marketplace',
  sport: 'sports stadium, athletic competition, football match, sports arena, athletic event',
  culture: 'cultural celebration, traditional art, heritage site, festival, Madagascar traditions, music performance',
  societe: 'community scene, urban life, social gathering, public space, daily life in Madagascar, Antananarivo streets',
  international: 'diplomatic meeting, global connection, international conference, world map, embassy',
  environnement: 'Madagascar nature, baobab trees, lemur habitat, rainforest, wildlife, conservation, national park',
  technologie: 'technology workspace, digital innovation, modern office, tech devices, startup environment'
};

// Generate cache key from title and category
function generateCacheKey(title: string, category: string): string {
  return `${category}-${title.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '-')}`;
}

// Extract meaningful keywords from title and summary
function extractKeywords(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase();
  const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'en', 'à', 'au', 'aux', 'pour', 'par', 'sur', 'avec', 'dans', 'est', 'sont', 'a', 'ont', 'qui', 'que', 'ce', 'cette', 'ces', 'son', 'sa', 'ses', 'leur', 'leurs', 'nous', 'vous', 'ils', 'elles', 'être', 'avoir', 'fait', 'faire', 'dit', 'dire', 'plus', 'moins', 'très', 'aussi', 'comme', 'mais', 'donc', 'car'];

  const words = text
    .replace(/[^a-zA-ZàâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word));

  // Return unique keywords, max 5
  return [...new Set(words)].slice(0, 5);
}

// Create a detailed, safe, and compliant prompt for Gemini image generation
function createImagePrompt(title: string, summary: string, category: string): string {
  const keywords = extractKeywords(title, summary);
  const context = categoryContext[category] || 'news scene, journalism, Madagascar';

  // Professional, safe, and regulation-compliant prompt
  const prompt = `Create a professional, high-quality editorial illustration for a Madagascar news website.

SCENE CONTEXT: ${context}
ARTICLE TOPIC: ${title}
KEY ELEMENTS TO INCLUDE: ${keywords.join(', ')}

MANDATORY REQUIREMENTS:
- Professional photojournalistic or editorial illustration style
- Clean, modern composition suitable for a news website
- 16:9 landscape aspect ratio
- NO text, words, letters, watermarks, or logos anywhere in the image
- NO human faces or identifiable people - use silhouettes, back views, or symbolic representations instead
- NO controversial, violent, or sensitive content
- NO political figures, celebrities, or real identifiable individuals
- Safe for all audiences, family-friendly
- Realistic colors and natural lighting
- High resolution and sharp details

MADAGASCAR VISUAL ELEMENTS (include when relevant):
- Red and green color accents (national colors)
- Tropical landscapes, baobab trees, rice terraces
- Traditional Malagasy architecture (red brick buildings)
- Urban scenes of Antananarivo with hills and buildings
- Wildlife symbols like lemurs (only as background elements)

COMPOSITION:
- Clear focal point
- Professional news editorial aesthetic
- Balanced layout with space for overlaying text
- Avoid cluttered or busy backgrounds

Generate a single, cohesive image that represents the news topic professionally and respectfully.`;

  return prompt;
}

// Generate image using Gemini Imagen API
async function generateImageWithGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GOOGLE_GEMINI_API_KEY not configured');
    return null;
  }

  try {
    // Try Imagen 3 API with correct Google AI Studio format
    console.log('Trying Imagen 3 API...');
    const imagenResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: '16:9',
            safetyFilterLevel: 'BLOCK_MEDIUM_AND_ABOVE',
            personGeneration: 'DONT_ALLOW'
          }
        }),
      }
    );

    if (imagenResponse.ok) {
      const data = await imagenResponse.json();
      console.log('Imagen 3 response:', JSON.stringify(data).substring(0, 200));

      // Check for generated images in response
      if (data.generatedImages && data.generatedImages[0]?.image?.imageBytes) {
        console.log('Imagen 3 SUCCESS - Image generated!');
        return await saveGeneratedImage(data.generatedImages[0].image.imageBytes);
      }
    } else {
      const errorText = await imagenResponse.text();
      console.log('Imagen 3 API error:', imagenResponse.status, errorText.substring(0, 300));
    }

    // Fallback to Gemini 2.0 Flash with image generation
    console.log('Trying Gemini 2.0 Flash experimental...');
    return await tryGemini2ImageGeneration(prompt, apiKey);

  } catch (error) {
    console.error('Gemini image generation error:', error);
    return null;
  }
}

// Try Gemini for image generation
async function tryGemini2ImageGeneration(prompt: string, apiKey: string): Promise<string | null> {
  try {
    // Use gemini-1.5-flash model for images
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a professional news illustration image for this article topic. The image should be photorealistic, editorial style, 16:9 aspect ratio, no text or watermarks, no identifiable faces. Topic: ${prompt}`
            }]
          }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
            responseMimeType: 'text/plain'
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Gemini 2.0 API error:', response.status, errorText.substring(0, 300));
      return null;
    }

    const data = await response.json();
    console.log('Gemini 2.0 response structure:', Object.keys(data));

    // Check for inline image data in response
    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith('image/')) {
          console.log('Gemini 2.0 SUCCESS - Image generated!');
          return await saveGeneratedImage(part.inlineData.data);
        }
      }
    }

    console.log('Gemini 2.0: No image in response');
    return null;
  } catch (error) {
    console.error('Gemini 2.0 image generation error:', error);
    return null;
  }
}

// Save base64 image to public folder
async function saveGeneratedImage(base64Data: string): Promise<string> {
  const imageBuffer = Buffer.from(base64Data, 'base64');
  const filename = `ai-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
  const relativePath = `/images/generated/${filename}`;
  const absolutePath = path.join(process.cwd(), 'public', 'images', 'generated', filename);

  // Ensure directory exists
  const dir = path.dirname(absolutePath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(absolutePath, imageBuffer);
  console.log(`AI image generated and saved: ${relativePath}`);

  return relativePath;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, summary, category, forceGenerate } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const cat = category || 'societe';
    const cacheKey = generateCacheKey(title, cat);

    // Check cache first (unless force generate)
    if (!forceGenerate) {
      const cached = imageCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return NextResponse.json({
          success: true,
          imageUrl: cached.imageUrl,
          cached: true,
          source: 'cache',
          aiGenerated: true,
          notice: 'Image générée par IA - Gemini'
        });
      }
    }

    // Create the AI prompt
    const prompt = createImagePrompt(title, summary || '', cat);
    console.log('Generating AI image for:', title.substring(0, 50));

    // Generate with Gemini
    let imageUrl = await generateImageWithGemini(prompt);
    let source = 'gemini-ai';

    if (!imageUrl) {
      // Fallback to category-based image from Picsum
      console.log('AI generation failed, using category fallback for:', cat);
      imageUrl = getCategoryFallbackImage(cat, title);
      source = 'category-fallback';
    }

    // Cache both AI and fallback images
    imageCache.set(cacheKey, {
      imageUrl,
      timestamp: Date.now()
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      source,
      aiGenerated: source === 'gemini-ai',
      cached: false,
      notice: source === 'gemini-ai' ? 'Image générée par IA - Gemini' : 'Image d\'illustration'
    });

  } catch (error) {
    console.error('API Error:', error);
    const cat = 'societe';
    const fallbackImage = getCategoryFallbackImage(cat, 'default');

    return NextResponse.json({
      success: true,
      imageUrl: fallbackImage,
      source: 'error-fallback',
      aiGenerated: false,
      error: 'Generation failed'
    });
  }
}

// GET endpoint to check API status
export async function GET() {
  const hasApiKey = !!process.env.GOOGLE_GEMINI_API_KEY;
  const aiEnabled = process.env.ENABLE_AI_IMAGE_GENERATION === 'true';

  return NextResponse.json({
    status: 'ok',
    cacheSize: imageCache.size,
    geminiConfigured: hasApiKey,
    aiGenerationEnabled: aiEnabled,
    message: hasApiKey && aiEnabled
      ? 'AI image generation is active'
      : 'AI image generation is not configured'
  });
}
