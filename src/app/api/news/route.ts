import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// AI Enhancement Types
interface EnhancedArticle {
  title: string;
  summary: string;
  content: string;
  tags: string[];
}

// Types for RSS parsing
interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  enclosure?: {
    url: string;
    type: string;
  };
  'media:content'?: {
    url: string;
  };
}

interface ParsedArticle {
  title: string;
  summary: string;
  sourceUrl: string;
  publishedAt: string;
  imageUrl: string | null;
}

// RSS feeds for Madagascar news sources
const RSS_SOURCES = [
  {
    id: '24h-mada',
    name: '24h Mada',
    feedUrl: 'https://www.24hmada.com/feed/',
    baseUrl: 'https://www.24hmada.com'
  },
  {
    id: 'midi-madagascar',
    name: 'Midi Madagascar',
    feedUrl: 'https://www.midi-madagasikara.mg/feed/',
    baseUrl: 'https://www.midi-madagasikara.mg'
  },
  {
    id: 'la-gazette',
    name: 'La Gazette de la Grande Île',
    feedUrl: 'https://www.lagazette-dgi.com/feed/',
    baseUrl: 'https://www.lagazette-dgi.com'
  },
  {
    id: 'lexpress',
    name: "L'Express de Madagascar",
    feedUrl: 'https://lexpress.mg/feed/',
    baseUrl: 'https://lexpress.mg'
  },
  {
    id: 'newsmada',
    name: 'News Mada',
    feedUrl: 'https://www.newsmada.com/feed/',
    baseUrl: 'https://www.newsmada.com'
  }
];

// Simple XML parser for RSS feeds
function parseXML(xml: string): RSSItem[] {
  const items: RSSItem[] = [];

  // Extract all <item> elements
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let itemMatch;

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const itemContent = itemMatch[1];

    // Extract fields
    const title = extractTag(itemContent, 'title');
    const link = extractTag(itemContent, 'link');
    const description = extractTag(itemContent, 'description');
    const pubDate = extractTag(itemContent, 'pubDate');

    // Extract image from enclosure or media:content
    let imageUrl: string | undefined;
    const enclosureMatch = itemContent.match(/<enclosure[^>]*url="([^"]*)"[^>]*type="image[^"]*"/i);
    if (enclosureMatch) {
      imageUrl = enclosureMatch[1];
    }
    const mediaMatch = itemContent.match(/<media:content[^>]*url="([^"]*)"/i);
    if (!imageUrl && mediaMatch) {
      imageUrl = mediaMatch[1];
    }
    // Try to extract image from content:encoded
    if (!imageUrl) {
      const imgMatch = itemContent.match(/<img[^>]*src="([^"]*)"/i);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }
    }

    if (title && link) {
      items.push({
        title: cleanText(title),
        link: cleanText(link),
        description: cleanText(description || ''),
        pubDate: pubDate || new Date().toISOString(),
        enclosure: imageUrl ? { url: imageUrl, type: 'image' } : undefined
      });
    }
  }

  return items;
}

function extractTag(content: string, tag: string): string | null {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
  const cdataMatch = content.match(cdataRegex);
  if (cdataMatch) {
    return cdataMatch[1];
  }

  // Handle regular tags
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = content.match(regex);
  return match ? match[1] : null;
}

function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// Reformulate content to create a unique summary (legal compliance)
function reformulateSummary(original: string, sourceName: string): string {
  // Clean and shorten the text
  let text = original.trim();

  // If text is too short, return as is with source attribution
  if (text.length < 50) {
    return `Selon ${sourceName}: ${text}`;
  }

  // Create a brief by extracting key information
  // Remove any "Read more" or "Continue reading" text
  text = text.replace(/\s*(Lire la suite|Read more|Continue reading|En savoir plus|Suite|\.\.\.)\s*$/gi, '');

  // Limit to first 200 characters for the brief
  if (text.length > 200) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    text = '';
    for (const sentence of sentences) {
      if ((text + sentence).length < 200) {
        text += sentence + ' ';
      } else {
        break;
      }
    }
    text = text.trim();
  }

  // Add source attribution prefix to make it clear this is a reformulation
  const prefixes = [
    `D'après ${sourceName}, `,
    `Selon ${sourceName}, `,
    `${sourceName} rapporte que `,
    `Comme l'indique ${sourceName}, `,
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  // Ensure first letter after prefix is lowercase if needed
  if (text.length > 0 && text[0] === text[0].toUpperCase()) {
    text = text[0].toLowerCase() + text.slice(1);
  }

  return prefix + text;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

// Detect category from content/title - PRIORITÉ: politique et société
function detectCategory(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();

  // Mots-clés élargis pour politique (PRIORITAIRE)
  const politiqueKeywords = [
    'politique', 'gouvernement', 'président', 'ministre', 'premier ministre',
    'assemblée', 'élection', 'vote', 'parti', 'député', 'sénat', 'sénateur',
    'rajoelina', 'andry', 'hvm', 'tim', 'arema', 'constitution', 'loi',
    'décret', 'réforme', 'campagne', 'scrutin', 'urne', 'mandat', 'pouvoir',
    'opposition', 'majorité', 'coalition', 'diplomatie', 'ambassadeur',
    'état', 'nation', 'république', 'parlement', 'conseil des ministres',
    'bianco', 'pac', 'cst', 'hcc', 'ceni', 'irmar', 'pds'
  ];

  // Mots-clés élargis pour société (PRIORITAIRE)
  const societeKeywords = [
    'société', 'social', 'population', 'citoyen', 'malgache', 'santé',
    'éducation', 'école', 'université', 'hôpital', 'médecin', 'covid',
    'pauvreté', 'faim', 'sécurité', 'criminalité', 'vol', 'insécurité',
    'vie quotidienne', 'famille', 'jeune', 'femme', 'enfant', 'droits',
    'travail', 'emploi', 'chômage', 'grève', 'manifestation', 'protestation',
    'transport', 'route', 'taxi-be', 'jirama', 'coupure', 'délestage',
    'eau', 'électricité', 'logement', 'habitat', 'bidonville', 'quartier',
    'antananarivo', 'tana', 'toamasina', 'mahajanga', 'fianarantsoa', 'toliara',
    'commune', 'fokontany', 'région', 'district', 'riz', 'vary', 'kere'
  ];

  // Vérifier d'abord les catégories prioritaires
  for (const keyword of politiqueKeywords) {
    if (text.includes(keyword)) return 'politique';
  }

  for (const keyword of societeKeywords) {
    if (text.includes(keyword)) return 'societe';
  }

  // Autres catégories
  const categoryKeywords: Record<string, string[]> = {
    economie: ['économie', 'économique', 'ariary', 'banque', 'commerce', 'investissement', 'marché', 'prix', 'inflation', 'pib', 'exportation', 'importation'],
    sport: ['sport', 'football', 'barea', 'match', 'championnat', 'athlète', 'équipe', 'victoire', 'basket', 'rugby', 'jeux', 'olympique'],
    culture: ['culture', 'culturel', 'artiste', 'musique', 'festival', 'tradition', 'patrimoine', 'art', 'cinéma', 'théâtre', 'hira gasy', 'vakodrazana'],
    international: ['international', 'monde', 'étranger', 'onu', 'union africaine', 'sadc', 'coi', 'france', 'chine', 'usa', 'europe'],
    environnement: ['environnement', 'climat', 'cyclone', 'forêt', 'biodiversité', 'écologie', 'nature', 'inondation', 'sécheresse', 'lémuriens'],
    technologie: ['technologie', 'numérique', 'digital', 'internet', 'startup', 'innovation', 'mobile', 'application', 'orange', 'telma', 'airtel']
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }

  return 'societe'; // Default: société
}

// AI Enhancement using Gemini
async function enhanceArticleWithAI(
  originalTitle: string,
  originalSummary: string,
  category: string,
  sourceName: string,
  sourceUrl: string
): Promise<EnhancedArticle | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.log('GOOGLE_GEMINI_API_KEY not configured - skipping AI enhancement');
    return null;
  }

  const categoryContext: Record<string, string> = {
    politique: "politique malgache, gouvernement, élections, assemblée nationale",
    economie: "économie de Madagascar, ariary, commerce, investissements, croissance",
    sport: "sport malgache, football, Barea, athlétisme, compétitions",
    culture: "culture malgache, traditions, art, musique, patrimoine",
    societe: "société malgache, vie quotidienne, santé, éducation",
    international: "relations internationales, diplomatie, Madagascar dans le monde",
    environnement: "environnement à Madagascar, biodiversité, cyclones, climat",
    technologie: "technologie, numérique, innovation, startups à Madagascar"
  };

  const context = categoryContext[category] || "actualités de Madagascar";

  const prompt = `Tu es un journaliste professionnel et analyste expert sur Madagascar. Tu dois rédiger un article ORIGINAL et ANALYTIQUE basé sur cette information source.

**INFORMATION SOURCE:**
- Titre original: "${originalTitle}"
- Résumé: "${originalSummary}"
- Source: ${sourceName}
- Catégorie: ${category} (${context})

**INSTRUCTIONS STRICTES:**

1. **TITRE CAPTIVANT** (max 80 caractères):
   - Accrocheur, qui donne envie de lire
   - Évite le clickbait mais soit percutant
   - Utilise des verbes d'action

2. **RÉSUMÉ** (2-3 phrases, max 200 caractères):
   - Synthèse claire et impactante
   - Les informations essentielles

3. **CONTENU DE L'ARTICLE** (300-400 mots):
   - NE COPIE PAS le contenu source, RÉÉCRIS entièrement
   - Structure en paragraphes clairs
   - **Mets en gras** (avec **texte**) les idées importantes, chiffres clés, noms importants
   - Ajoute du CONTEXTE et de l'ANALYSE:
     * Pourquoi c'est important?
     * Quel impact sur Madagascar/les Malgaches?
     * Comparaisons avec des données existantes si pertinent
   - Inclus des CHIFFRES et STATISTIQUES si disponibles ou pertinents au contexte
   - Reste FACTUEL et OBJECTIF
   - Cite la source originale à la fin

4. **TAGS** (5 mots-clés pertinents)

**FORMAT DE RÉPONSE (JSON):**
{
  "title": "Titre captivant ici",
  "summary": "Résumé percutant ici",
  "content": "Contenu de l'article avec **textes en gras** pour les points importants...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ]
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return null;
    }

    const result = await response.json();
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error('No text content in Gemini response');
      return null;
    }

    // Extract JSON from response
    let jsonStr = textContent;
    const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                      textContent.match(/```\s*([\s\S]*?)\s*```/) ||
                      textContent.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      jsonStr = jsonMatch[1] || jsonMatch[0];
    }

    jsonStr = jsonStr.trim();
    if (!jsonStr.startsWith('{')) {
      const startIdx = jsonStr.indexOf('{');
      if (startIdx !== -1) {
        jsonStr = jsonStr.substring(startIdx);
      }
    }

    const enhanced = JSON.parse(jsonStr) as EnhancedArticle;

    if (!enhanced.title || !enhanced.summary || !enhanced.content) {
      console.error('Invalid enhanced article structure');
      return null;
    }

    return enhanced;
  } catch (error) {
    console.error('Error enhancing article with Gemini:', error);
    return null;
  }
}

async function fetchRSSFeed(source: typeof RSS_SOURCES[0]): Promise<ParsedArticle[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(source.feedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mada-Flash News Aggregator/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch ${source.name}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const items = parseXML(xml);

    return items.slice(0, 10).map(item => ({
      title: item.title,
      summary: reformulateSummary(item.description, source.name),
      sourceUrl: item.link,
      publishedAt: item.pubDate,
      imageUrl: item.enclosure?.url || null
    }));
  } catch (error) {
    console.error(`Error fetching ${source.name}:`, error);
    return [];
  }
}

// Save RSS articles to database with AI enhancement
async function saveArticlesToDatabase(articles: Array<ParsedArticle & { sourceId: string; sourceName: string }>) {
  const savedArticles = [];

  for (const article of articles) {
    try {
      // Check if article already exists by sourceUrl
      const existing = await prisma.article.findFirst({
        where: { sourceUrl: article.sourceUrl }
      });

      if (!existing) {
        // Detect category from title/summary
        const detectedCategory = detectCategory(article.title, article.summary);

        // Try to enhance article with AI
        console.log(`Enhancing article: "${article.title.substring(0, 50)}..."`);
        const enhanced = await enhanceArticleWithAI(
          article.title,
          article.summary,
          detectedCategory,
          article.sourceName,
          article.sourceUrl
        );

        // Use enhanced content if available, otherwise use original
        const finalTitle = enhanced?.title || article.title;
        const finalSummary = enhanced?.summary || article.summary;
        const finalContent = enhanced?.content || article.summary;

        // Generate unique slug from final title
        let slug = generateSlug(finalTitle);
        const slugExists = await prisma.article.findUnique({ where: { slug } });
        if (slugExists) {
          slug = `${slug}-${Date.now()}`;
        }

        // Parse the publication date
        let publishedAt: Date;
        try {
          publishedAt = new Date(article.publishedAt);
          if (isNaN(publishedAt.getTime())) {
            publishedAt = new Date();
          }
        } catch {
          publishedAt = new Date();
        }

        // Find category ID if exists
        let categoryId: string | null = null;
        const categoryNames: Record<string, string> = {
          politique: 'Politique',
          economie: 'Économie',
          sport: 'Sport',
          culture: 'Culture',
          societe: 'Société',
          international: 'International',
          environnement: 'Environnement',
          technologie: 'Technologie'
        };
        const categoryName = categoryNames[detectedCategory];
        if (categoryName) {
          const category = await prisma.category.findFirst({
            where: { name: categoryName }
          });
          if (category) {
            categoryId = category.id;
          }
        }

        // Create article in database with enhanced content
        const newArticle = await prisma.article.create({
          data: {
            title: finalTitle,
            slug,
            summary: finalSummary,
            content: finalContent,
            originalContent: article.summary, // Keep original for reference
            sourceUrl: article.sourceUrl,
            sourceName: article.sourceName,
            imageUrl: article.imageUrl,
            status: 'published', // RSS articles are auto-published
            publishedAt,
            isFromRSS: true,
            isAiEnhanced: !!enhanced, // Track if AI enhanced
            categoryId, // Auto-assign category
          },
        });

        console.log(`Saved article: "${finalTitle}" (AI enhanced: ${!!enhanced})`);
        savedArticles.push(newArticle);

        // Add small delay between AI calls to avoid rate limiting
        if (enhanced) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error(`Error saving article ${article.title}:`, error);
    }
  }

  return savedArticles;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourceId = searchParams.get('source');
  const syncRSS = searchParams.get('sync') === 'true';
  const fromDB = searchParams.get('fromDB') !== 'false'; // Default to true

  try {
    // If fromDB is true, return articles from database
    if (fromDB) {
      const dbArticles = await prisma.article.findMany({
        where: { status: 'published' },
        orderBy: [
          { isFeatured: 'desc' },  // Featured articles first
          { publishedAt: 'desc' }  // Then by date
        ],
        take: 50,
        include: { category: true },
      });

      // If no articles in DB or sync requested, fetch from RSS
      if (dbArticles.length === 0 || syncRSS) {
        await syncRSSFeeds(sourceId);

        // Fetch again after sync
        const freshArticles = await prisma.article.findMany({
          where: { status: 'published' },
          orderBy: [
            { isFeatured: 'desc' },  // Featured articles first
            { publishedAt: 'desc' }  // Then by date
          ],
          take: 50,
          include: { category: true },
        });

        return NextResponse.json({
          success: true,
          count: freshArticles.length,
          articles: freshArticles.map(formatArticle),
          lastUpdated: new Date().toISOString(),
          synced: true
        });
      }

      return NextResponse.json({
        success: true,
        count: dbArticles.length,
        articles: dbArticles.map(formatArticle),
        lastUpdated: new Date().toISOString()
      });
    }

    // Legacy mode: fetch directly from RSS without saving
    let articles: Array<ParsedArticle & { sourceId: string; sourceName: string }> = [];

    const sourcesToFetch = sourceId
      ? RSS_SOURCES.filter(s => s.id === sourceId)
      : RSS_SOURCES;

    const results = await Promise.allSettled(
      sourcesToFetch.map(async (source) => {
        const items = await fetchRSSFeed(source);
        return items.map(item => ({
          ...item,
          sourceId: source.id,
          sourceName: source.name
        }));
      })
    );

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        articles = [...articles, ...result.value];
      }
    });

    articles.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return NextResponse.json({
      success: true,
      count: articles.length,
      articles,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// Helper function to sync RSS feeds
async function syncRSSFeeds(sourceId: string | null) {
  let articles: Array<ParsedArticle & { sourceId: string; sourceName: string }> = [];

  const sourcesToFetch = sourceId
    ? RSS_SOURCES.filter(s => s.id === sourceId)
    : RSS_SOURCES;

  const results = await Promise.allSettled(
    sourcesToFetch.map(async (source) => {
      const items = await fetchRSSFeed(source);
      return items.map(item => ({
        ...item,
        sourceId: source.id,
        sourceName: source.name
      }));
    })
  );

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      articles = [...articles, ...result.value];
    }
  });

  // Save to database
  await saveArticlesToDatabase(articles);
}

// Format article for API response
function formatArticle(article: any) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    content: article.content,
    sourceUrl: article.sourceUrl,
    sourceName: article.sourceName,
    sourceId: article.sourceName?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
    imageUrl: article.imageUrl,
    publishedAt: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
    category: article.category,
    isFeatured: article.isFeatured,
    isBreaking: article.isBreaking,
    isFromRSS: article.isFromRSS,
    views: article.views,
  };
}

// POST endpoint to manually sync RSS feeds
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sourceId = body.sourceId || null;

    await syncRSSFeeds(sourceId);

    const count = await prisma.article.count({
      where: { isFromRSS: true }
    });

    return NextResponse.json({
      success: true,
      message: 'RSS feeds synced successfully',
      totalRSSArticles: count
    });
  } catch (error) {
    console.error('Sync Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync RSS feeds' },
      { status: 500 }
    );
  }
}
