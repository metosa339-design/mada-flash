import { NextRequest, NextResponse } from 'next/server';
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
}

interface ParsedArticle {
  title: string;
  summary: string;
  sourceUrl: string;
  publishedAt: string;
  imageUrl: string | null;
}

// RSS feeds for Madagascar news - PRIORITÉ: Politique et Société
const RSS_SOURCES = [
  // Sources principales pour politique/société
  {
    id: 'midi-madagascar',
    name: 'Midi Madagascar',
    feedUrl: 'https://www.midi-madagasikara.mg/feed/',
    baseUrl: 'https://www.midi-madagasikara.mg',
    priority: 1, // Haute priorité - beaucoup de politique
  },
  {
    id: 'la-gazette',
    name: 'La Gazette de la Grande Île',
    feedUrl: 'https://www.lagazette-dgi.com/feed/',
    baseUrl: 'https://www.lagazette-dgi.com',
    priority: 1, // Haute priorité
  },
  {
    id: 'lexpress',
    name: "L'Express de Madagascar",
    feedUrl: 'https://lexpress.mg/feed/',
    baseUrl: 'https://lexpress.mg',
    priority: 1, // Haute priorité
  },
  // Sources secondaires
  {
    id: '24h-mada',
    name: '24h Mada',
    feedUrl: 'https://www.24hmada.com/feed/',
    baseUrl: 'https://www.24hmada.com',
    priority: 2,
  },
  {
    id: 'newsmada',
    name: 'News Mada',
    feedUrl: 'https://www.newsmada.com/feed/',
    baseUrl: 'https://www.newsmada.com',
    priority: 2,
  }
];

// Categories prioritaires
const PRIORITY_CATEGORIES = ['politique', 'societe'];

// Mots-clés à bloquer (nécrologie, décès, etc.)
const BLOCKED_KEYWORDS = [
  'nécrologie', 'necrologie', 'décès', 'deces', 'décédé', 'decede',
  'mort de', 'obsèques', 'obseques', 'funérailles', 'funerailles',
  'enterrement', 'inhumation', 'hommage posthume', 'disparition de',
  'nous quitte', 'a rendu l\'âme', 'dernier adieu', 'repose en paix'
];

// Fonction pour vérifier si un article doit être bloqué
function shouldBlockArticle(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase();
  return BLOCKED_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
}

// Simple XML parser for RSS feeds
function parseXML(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let itemMatch;

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const itemContent = itemMatch[1];
    const title = extractTag(itemContent, 'title');
    const link = extractTag(itemContent, 'link');
    const description = extractTag(itemContent, 'description');
    const pubDate = extractTag(itemContent, 'pubDate');

    let imageUrl: string | undefined;
    const enclosureMatch = itemContent.match(/<enclosure[^>]*url="([^"]*)"[^>]*type="image[^"]*"/i);
    if (enclosureMatch) imageUrl = enclosureMatch[1];
    const mediaMatch = itemContent.match(/<media:content[^>]*url="([^"]*)"/i);
    if (!imageUrl && mediaMatch) imageUrl = mediaMatch[1];
    if (!imageUrl) {
      const imgMatch = itemContent.match(/<img[^>]*src="([^"]*)"/i);
      if (imgMatch) imageUrl = imgMatch[1];
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
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
  const cdataMatch = content.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1];
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

// Detect category - PRIORITÉ: politique et société
function detectCategory(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();

  // Mots-clés élargis pour politique
  const politiqueKeywords = [
    'politique', 'gouvernement', 'président', 'ministre', 'premier ministre',
    'assemblée', 'élection', 'vote', 'parti', 'député', 'sénat', 'sénateur',
    'rajoelina', 'andry', 'hvm', 'tim', 'arema', 'constitution', 'loi',
    'décret', 'réforme', 'campagne', 'scrutin', 'urne', 'mandat', 'pouvoir',
    'opposition', 'majorité', 'coalition', 'diplomatie', 'ambassadeur',
    'état', 'nation', 'république', 'parlement', 'conseil des ministres',
    'bianco', 'pac', 'cst', 'hcc', 'ceni', 'irmar', 'pds'
  ];

  // Mots-clés élargis pour société
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
      if (text.includes(keyword)) return category;
    }
  }

  return 'societe'; // Default: société
}

// AI Enhancement using Gemini
async function enhanceArticleWithAI(
  originalTitle: string,
  originalSummary: string,
  category: string,
  sourceName: string
): Promise<EnhancedArticle | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const categoryContext: Record<string, string> = {
    politique: "politique malgache, gouvernement, élections, assemblée nationale, actualité politique de Madagascar",
    economie: "économie de Madagascar, ariary, commerce, investissements, croissance économique",
    sport: "sport malgache, football, Barea, athlétisme, compétitions sportives",
    culture: "culture malgache, traditions, art, musique, patrimoine culturel",
    societe: "société malgache, vie quotidienne, santé, éducation, problèmes sociaux",
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
   - **Mets en gras** (avec **texte**) les idées importantes
   - Ajoute du CONTEXTE et de l'ANALYSE sur Madagascar
   - Inclus des CHIFFRES et STATISTIQUES si pertinent
   - Reste FACTUEL et OBJECTIF
   - Cite la source originale à la fin

4. **TAGS** (5 mots-clés pertinents)

**FORMAT DE RÉPONSE (JSON):**
{
  "title": "Titre captivant ici",
  "summary": "Résumé percutant ici",
  "content": "Contenu de l'article...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!response.ok) return null;

    const result = await response.json();
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) return null;

    let jsonStr = textContent;
    const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                      textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[1] || jsonMatch[0];

    jsonStr = jsonStr.trim();
    if (!jsonStr.startsWith('{')) {
      const startIdx = jsonStr.indexOf('{');
      if (startIdx !== -1) jsonStr = jsonStr.substring(startIdx);
    }

    const enhanced = JSON.parse(jsonStr) as EnhancedArticle;
    if (!enhanced.title || !enhanced.content) return null;

    return enhanced;
  } catch (error) {
    console.error('AI enhancement error:', error);
    return null;
  }
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

async function fetchRSSFeed(source: typeof RSS_SOURCES[0]): Promise<(ParsedArticle & { sourceName: string })[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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

    // Prendre plus d'articles des sources prioritaires
    const limit = source.priority === 1 ? 15 : 8;

    return items.slice(0, limit).map(item => ({
      title: item.title,
      summary: item.description,
      sourceUrl: item.link,
      publishedAt: item.pubDate,
      imageUrl: item.enclosure?.url || null,
      sourceName: source.name
    }));
  } catch (error) {
    console.error(`Error fetching ${source.name}:`, error);
    return [];
  }
}

// Main sync function
async function syncRSSFeeds() {
  console.log(`[CRON RSS] Starting RSS sync at ${new Date().toISOString()}`);

  let allArticles: (ParsedArticle & { sourceName: string; category: string })[] = [];

  // Fetch from all sources
  for (const source of RSS_SOURCES) {
    try {
      console.log(`[CRON RSS] Fetching from ${source.name}...`);
      const articles = await fetchRSSFeed(source);

      // Detect category for each article
      const articlesWithCategory = articles.map(article => ({
        ...article,
        category: detectCategory(article.title, article.summary)
      }));

      allArticles = [...allArticles, ...articlesWithCategory];
      console.log(`[CRON RSS] Got ${articles.length} articles from ${source.name}`);
    } catch (error) {
      console.error(`[CRON RSS] Error with ${source.name}:`, error);
    }
  }

  // Sort: priorité aux articles politique et société
  allArticles.sort((a, b) => {
    const aPriority = PRIORITY_CATEGORIES.includes(a.category) ? 0 : 1;
    const bPriority = PRIORITY_CATEGORIES.includes(b.category) ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    // Ensuite par date
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  console.log(`[CRON RSS] Total articles to process: ${allArticles.length}`);
  console.log(`[CRON RSS] Politique/Société: ${allArticles.filter(a => PRIORITY_CATEGORIES.includes(a.category)).length}`);

  let savedCount = 0;
  let enhancedCount = 0;

  for (const article of allArticles) {
    try {
      // Bloquer les articles de nécrologie
      if (shouldBlockArticle(article.title, article.summary)) {
        console.log(`[CRON RSS] Bloqué (nécrologie): "${article.title.substring(0, 40)}..."`);
        continue;
      }

      // Check if already exists
      const existing = await prisma.article.findFirst({
        where: { sourceUrl: article.sourceUrl }
      });

      if (existing) continue;

      // Enhance with AI
      console.log(`[CRON RSS] Enhancing: "${article.title.substring(0, 40)}..." (${article.category})`);
      const enhanced = await enhanceArticleWithAI(
        article.title,
        article.summary,
        article.category,
        article.sourceName
      );

      const finalTitle = enhanced?.title || article.title;
      const finalSummary = enhanced?.summary || article.summary;
      const finalContent = enhanced?.content || article.summary;

      // Generate slug
      let slug = generateSlug(finalTitle);
      const slugExists = await prisma.article.findUnique({ where: { slug } });
      if (slugExists) slug = `${slug}-${Date.now()}`;

      // Parse date
      let publishedAt = new Date();
      try {
        const parsed = new Date(article.publishedAt);
        if (!isNaN(parsed.getTime())) publishedAt = parsed;
      } catch {}

      // Find category
      const categoryNames: Record<string, string> = {
        politique: 'Politique', economie: 'Économie', sport: 'Sport',
        culture: 'Culture', societe: 'Société', international: 'International',
        environnement: 'Environnement', technologie: 'Technologie'
      };

      let categoryId: string | null = null;
      const categoryName = categoryNames[article.category];
      if (categoryName) {
        const cat = await prisma.category.findFirst({ where: { name: categoryName } });
        if (cat) categoryId = cat.id;
      }

      // Save to database
      await prisma.article.create({
        data: {
          title: finalTitle,
          slug,
          summary: finalSummary,
          content: finalContent,
          originalContent: article.summary,
          sourceUrl: article.sourceUrl,
          sourceName: article.sourceName,
          imageUrl: article.imageUrl,
          status: 'published',
          publishedAt,
          isFromRSS: true,
          isAiEnhanced: !!enhanced,
          categoryId,
        },
      });

      savedCount++;
      if (enhanced) enhancedCount++;

      // Delay between AI calls
      if (enhanced) await new Promise(r => setTimeout(r, 600));

    } catch (error) {
      console.error(`[CRON RSS] Error saving article:`, error);
    }
  }

  console.log(`[CRON RSS] Sync complete: ${savedCount} saved, ${enhancedCount} AI enhanced`);

  return { savedCount, enhancedCount, total: allArticles.length };
}

// Cron endpoint - runs automatically
export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await syncRSSFeeds();

    return NextResponse.json({
      success: true,
      message: `RSS sync completed`,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CRON RSS] Error:', error);
    return NextResponse.json(
      { success: false, error: 'RSS sync failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
