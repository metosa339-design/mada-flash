import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, getClientIdentifier, getRateLimitHeaders } from '@/lib/rate-limit';

// AI Enhancement Types
interface EnhancedArticle {
  title: string;
  summary: string;
  content: string;
  tags: string[];
  // Fact-checking
  reliabilityScore: number;  // 0-100
  reliabilityLabel: string;  // "verified", "likely", "unverified", "disputed"
  factCheckNotes: string;    // Notes about verification
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

// Mots-clés à bloquer (nécrologie, décès, etc.) - Français et Malgache
const BLOCKED_KEYWORDS = [
  // Français
  'nécrologie', 'necrologie', 'décès', 'deces', 'décédé', 'decede',
  'mort de', 'est mort', 'est décédé', 'est décédée', 'a péri',
  'obsèques', 'obseques', 'funérailles', 'funerailles',
  'enterrement', 'inhumation', 'hommage posthume', 'disparition de',
  'nous quitte', 'a rendu l\'âme', 'dernier adieu', 'repose en paix',
  'r.i.p', 'rip', 'in memoriam', 'en mémoire de', 'condoléances',
  'deuil national', 'deuil', 'veillée funèbre', 'cercueil',
  // Malgache
  'maty', 'nodimandry', 'niala aina', 'lasa nodimandry', 'namoy ny ainy',
  'fandevenana', 'fasana', 'fitsaboana ny maty', 'faty', 'fahafatesana',
  'maty ny', 'namana maty', 'nalahelo', 'fisaorana faty',
  'famangiana faty', 'filazan-doza', 'fahoriana', 'alahelo'
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

// Fetch full article content from source URL
async function fetchFullArticleContent(sourceUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(sourceUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Mada-Flash/1.0)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    clearTimeout(timeoutId);
    if (!response.ok) return null;

    const html = await response.text();

    // Extract main content from HTML (common patterns)
    let content = '';

    // Try to find article content in common containers
    const articlePatterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/gi,
      /<div[^>]*class="[^"]*(?:content|article|post|entry)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*id="[^"]*(?:content|article|post)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    ];

    for (const pattern of articlePatterns) {
      const matches = html.match(pattern);
      if (matches && matches[0]) {
        content = matches[0];
        break;
      }
    }

    // If no specific container found, use body
    if (!content) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) content = bodyMatch[1];
    }

    // Clean HTML tags and get text
    content = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    // Limit to ~2000 chars for API
    return content.substring(0, 2000);
  } catch (error) {
    console.error('Error fetching full article:', error);
    return null;
  }
}

// Build prompt for AI enhancement - RICH CONTENT VERSION
function buildRSSEnhancementPrompt(
  originalTitle: string,
  sourceContent: string,
  sourceName: string,
  category: string
): string {
  return `Tu es un JOURNALISTE EXPERT et ANALYSTE de Madagascar avec 20 ans d'expérience. Tu dois transformer cette actualité en un ARTICLE COMPLET, RICHE et APPROFONDI.

**SOURCE ORIGINALE:**
Titre: "${originalTitle}"
Contenu: "${sourceContent.substring(0, 2000)}"
Source: ${sourceName}
Catégorie: ${category}

**MISSION: Créer un article ULTRA-RICHE (800-1200 mots minimum)**

📰 **TITRE** (max 80 caractères):
- Accrocheur, informatif, professionnel
- Doit captiver l'attention immédiatement

📝 **RÉSUMÉ** (2-3 phrases, 200 caractères):
- L'essentiel de l'actualité en bref
- Répond à: Quoi? Qui? Où? Quand? Pourquoi?

📖 **CONTENU ULTRA-DÉTAILLÉ** (Structure OBLIGATOIRE):

📌 L'essentiel
[Paragraphe d'accroche percutant - 3-4 lignes qui résument l'actualité principale avec impact]

🔑 Les faits marquants
• **Fait clé 1**: Détail complet avec chiffres si disponibles
• **Fait clé 2**: Information importante avec contexte
• **Fait clé 3**: Élément significatif de l'actualité
• **Fait clé 4**: Donnée ou information complémentaire
• **Fait clé 5**: Point additionnel pertinent

📊 Analyse approfondie
[Paragraphe détaillé analysant les implications de cette actualité - 150-200 mots minimum. Explique le POURQUOI et le COMMENT. Analyse les causes, les conséquences potentielles.]

🏛️ Contexte historique et politique
[Paragraphe expliquant le contexte de Madagascar lié à cette actualité - 100-150 mots. Fais référence à des événements passés, des tendances, des politiques en place.]

👥 Impact sur la population
[Comment cette actualité affecte les Malgaches au quotidien - 100-150 mots. Sois concret et précis sur les implications pour les citoyens.]

🔮 Perspectives et enjeux futurs
[Que peut-on attendre suite à cette actualité? Quels sont les scénarios possibles? - 100-150 mots]

💡 Ce qu'il faut retenir
• Point clé à retenir 1
• Point clé à retenir 2
• Point clé à retenir 3
• Point clé à retenir 4

📚 Pour aller plus loin
[Suggestion de sujets connexes ou questions à suivre - 2-3 lignes]

---
*Source: ${sourceName} | Analyse enrichie par Mada-Flash*

**STYLE OBLIGATOIRE:**
- Utilise **gras** pour les mots-clés et chiffres importants
- Phrases claires et accessibles
- Ton journalistique professionnel mais engageant
- Ajoute des informations contextuelles pertinentes sur Madagascar
- Enrichis avec des données, statistiques, ou faits historiques si pertinent

**FIABILITÉ - TRÈS IMPORTANT:**
- reliabilityScore: Note de 0-100 basée sur la crédibilité de la source
- reliabilityLabel: "verified" (source officielle), "likely" (source fiable), "unverified" (à vérifier), "disputed" (controversé)
- factCheckNotes: Analyse détaillée de la fiabilité (3-5 lignes minimum)

**FORMAT JSON STRICT:**
{
  "title": "Titre accrocheur",
  "summary": "Résumé complet en 2-3 phrases",
  "content": "Contenu ULTRA-RICHE avec toutes les sections markdown...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7"],
  "reliabilityScore": 75,
  "reliabilityLabel": "likely",
  "factCheckNotes": "Analyse détaillée de fiabilité avec justification..."
}

RÉPONDS UNIQUEMENT EN JSON VALIDE.`;
}

// Parse AI response to EnhancedArticle
function parseEnhancedArticle(textContent: string): EnhancedArticle | null {
  try {
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
  } catch {
    return null;
  }
}

// Enhancement using Claude API
async function enhanceWithClaude(prompt: string): Promise<EnhancedArticle | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) return null;
    const result = await response.json();
    const textContent = result.content?.[0]?.text;
    if (!textContent) return null;

    return parseEnhancedArticle(textContent);
  } catch (error) {
    console.error('Claude enhancement error:', error);
    return null;
  }
}

// Enhancement using Groq API (Free - Llama 3)
async function enhanceWithGroq(prompt: string): Promise<EnhancedArticle | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Tu réponds UNIQUEMENT en JSON valide. Les valeurs de chaîne doivent utiliser \\n pour les sauts de ligne, pas de vraies nouvelles lignes.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) return null;
    const result = await response.json();
    const textContent = result.choices?.[0]?.message?.content;
    if (!textContent) return null;

    // With json_object mode, parse directly
    const enhanced = JSON.parse(textContent) as EnhancedArticle;
    if (!enhanced.title || !enhanced.content) return null;

    return enhanced;
  } catch (error) {
    console.error('Groq enhancement error:', error);
    return null;
  }
}

// Enhancement using Gemini API
async function enhanceWithGemini(prompt: string): Promise<EnhancedArticle | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 4096 },
        }),
      }
    );

    if (!response.ok) return null;
    const result = await response.json();
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) return null;

    return parseEnhancedArticle(textContent);
  } catch (error) {
    console.error('Gemini enhancement error:', error);
    return null;
  }
}

// AI Enhancement - tries Groq first (free), then Claude, then Gemini
async function enhanceArticleWithAI(
  originalTitle: string,
  originalSummary: string,
  category: string,
  sourceName: string,
  sourceUrl?: string
): Promise<EnhancedArticle | null> {
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;
  const hasGeminiKey = !!process.env.GOOGLE_GEMINI_API_KEY;

  if (!hasGroqKey && !hasClaudeKey && !hasGeminiKey) return null;

  // Try to fetch full article content for better context
  let fullContent = '';
  if (sourceUrl) {
    const fetched = await fetchFullArticleContent(sourceUrl);
    if (fetched && fetched.length > originalSummary.length) {
      fullContent = fetched;
      console.log(`[AI] Fetched ${fullContent.length} chars from source`);
    }
  }

  const sourceContent = fullContent || originalSummary;
  const prompt = buildRSSEnhancementPrompt(originalTitle, sourceContent, sourceName, category);

  // Try Groq first (free), then Claude, then Gemini
  if (hasGroqKey) {
    const result = await enhanceWithGroq(prompt);
    if (result) return result;
  }

  if (hasClaudeKey) {
    const result = await enhanceWithClaude(prompt);
    if (result) return result;
  }

  if (hasGeminiKey) {
    return await enhanceWithGemini(prompt);
  }

  return null;
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

// Configuration pour le nettoyage automatique
const MAX_ARTICLES = 500; // Nombre maximum d'articles à garder
const ARTICLES_TO_DELETE_BATCH = 50; // Nombre d'articles à supprimer par batch

// Fonction de nettoyage automatique des anciens articles
async function cleanupOldArticles(): Promise<{ deleted: number; remaining: number }> {
  console.log(`[CLEANUP] Starting automatic cleanup...`);

  try {
    // Compter le nombre total d'articles
    const totalArticles = await prisma.article.count();
    console.log(`[CLEANUP] Total articles in database: ${totalArticles}`);

    // Si on est en dessous du maximum, pas besoin de nettoyer
    if (totalArticles <= MAX_ARTICLES) {
      console.log(`[CLEANUP] No cleanup needed (${totalArticles} <= ${MAX_ARTICLES})`);
      return { deleted: 0, remaining: totalArticles };
    }

    // Calculer combien d'articles supprimer
    const articlesToDelete = totalArticles - MAX_ARTICLES + ARTICLES_TO_DELETE_BATCH;
    console.log(`[CLEANUP] Need to delete ${articlesToDelete} articles to free space`);

    // Trouver les articles les plus anciens (non-featured)
    const oldestArticles = await prisma.article.findMany({
      where: {
        isFeatured: false, // Ne pas supprimer les articles mis en avant
      },
      orderBy: {
        publishedAt: 'asc' // Les plus anciens d'abord
      },
      take: articlesToDelete,
      select: { id: true, title: true, publishedAt: true }
    });

    if (oldestArticles.length === 0) {
      console.log(`[CLEANUP] No deletable articles found`);
      return { deleted: 0, remaining: totalArticles };
    }

    // Supprimer les anciens articles
    const idsToDelete = oldestArticles.map(a => a.id);

    const deleteResult = await prisma.article.deleteMany({
      where: {
        id: { in: idsToDelete }
      }
    });

    console.log(`[CLEANUP] Deleted ${deleteResult.count} old articles`);
    console.log(`[CLEANUP] Oldest deleted: "${oldestArticles[0].title.substring(0, 40)}..." from ${oldestArticles[0].publishedAt}`);

    const newTotal = await prisma.article.count();
    console.log(`[CLEANUP] Remaining articles: ${newTotal}`);

    return { deleted: deleteResult.count, remaining: newTotal };

  } catch (error) {
    console.error('[CLEANUP] Error during cleanup:', error);
    return { deleted: 0, remaining: -1 };
  }
}

// Main sync function
async function syncRSSFeeds() {
  console.log(`[CRON RSS] Starting RSS sync at ${new Date().toISOString()}`);

  // Nettoyer les anciens articles AVANT d'en ajouter de nouveaux
  const cleanupResult = await cleanupOldArticles();

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

      // Enhance with AI - fetch full content from source for better quality
      console.log(`[CRON RSS] Enhancing: "${article.title.substring(0, 40)}..." (${article.category})`);
      const enhanced = await enhanceArticleWithAI(
        article.title,
        article.summary,
        article.category,
        article.sourceName,
        article.sourceUrl // Pass source URL to fetch full content
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

      // Save to database with reliability info
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
          // Fact-checking data
          reliabilityScore: enhanced?.reliabilityScore || 70,
          reliabilityLabel: enhanced?.reliabilityLabel || 'likely',
          factCheckNotes: enhanced?.factCheckNotes || 'Non vérifié automatiquement',
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
  console.log(`[CRON RSS] Cleanup: ${cleanupResult.deleted} deleted, ${cleanupResult.remaining} remaining`);

  return {
    savedCount,
    enhancedCount,
    total: allArticles.length,
    cleanup: cleanupResult
  };
}

// Cron endpoint - runs automatically
export async function GET(request: NextRequest) {
  // Rate limiting for cron endpoints
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(clientId, 'cron');

  if (!rateLimit.success) {
    const response = NextResponse.json(
      { success: false, error: 'Rate limit exceeded' },
      { status: 429 }
    );
    Object.entries(getRateLimitHeaders(rateLimit)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

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
