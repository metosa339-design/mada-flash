import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, getClientIdentifier, getRateLimitHeaders } from '@/lib/rate-limit';

// Batch processing configuration
const BATCH_SIZE = 3; // Process 3 articles concurrently
const DELAY_BETWEEN_BATCHES = 1500; // 1.5 seconds between batches

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

    let content = '';
    const articlePatterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/gi,
      /<div[^>]*class="[^"]*(?:content|article|post|entry)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    ];

    for (const pattern of articlePatterns) {
      const matches = html.match(pattern);
      if (matches && matches[0]) {
        content = matches[0];
        break;
      }
    }

    if (!content) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) content = bodyMatch[1];
    }

    content = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();

    return content.substring(0, 2000);
  } catch {
    return null;
  }
}

// Build the enhancement prompt - RICH CONTENT VERSION
function buildEnhancementPrompt(
  title: string,
  sourceContent: string,
  sourceName: string,
  category: string
): string {
  return `Tu es un JOURNALISTE EXPERT et ANALYSTE de Madagascar avec 20 ans d'expérience. Tu dois transformer cette actualité en un ARTICLE COMPLET, RICHE et APPROFONDI.

**SOURCE ORIGINALE:**
Titre: "${title}"
Contenu: "${sourceContent.substring(0, 2000)}"
Source: ${sourceName || 'Non spécifié'}
Catégorie: ${category || 'Actualités'}

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
*Source: ${sourceName || 'Non spécifié'} | Analyse enrichie par Mada-Flash*

**STYLE OBLIGATOIRE:**
- Utilise **gras** pour les mots-clés et chiffres importants
- Phrases claires et accessibles
- Ton journalistique professionnel mais engageant
- Ajoute des informations contextuelles pertinentes sur Madagascar
- Enrichis avec des données, statistiques, ou faits historiques si pertinent

**FORMAT JSON STRICT:**
{
  "title": "Titre accrocheur",
  "summary": "Résumé complet en 2-3 phrases",
  "content": "Contenu ULTRA-RICHE avec toutes les sections markdown..."
}

RÉPONDS UNIQUEMENT EN JSON VALIDE.`;
}

// Enhancement using Claude API (Anthropic)
async function enhanceWithClaude(prompt: string): Promise<{ title: string; summary: string; content: string } | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    console.log('[ENHANCE] 📡 Calling Claude API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Fast & cheap model
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    console.log('[ENHANCE] 📡 Claude API response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ENHANCE] ❌ Claude API error:', errorText.substring(0, 500));
      return null;
    }

    const result = await response.json();
    const textContent = result.content?.[0]?.text;
    if (!textContent) return null;

    // Parse JSON from response
    let jsonStr = textContent;
    const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                      textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[1] || jsonMatch[0];

    jsonStr = jsonStr.trim();
    if (!jsonStr.startsWith('{')) {
      const startIdx = jsonStr.indexOf('{');
      if (startIdx !== -1) jsonStr = jsonStr.substring(startIdx);
    }

    const enhanced = JSON.parse(jsonStr);
    if (!enhanced.title || !enhanced.content) return null;

    console.log('[ENHANCE] ✅ Claude: Successfully parsed enhanced content');
    return enhanced;
  } catch (error) {
    console.error('[ENHANCE] ❌ Claude error:', error instanceof Error ? error.message : error);
    return null;
  }
}

// Enhancement using Groq API (Free - Llama 3)
async function enhanceWithGroq(prompt: string): Promise<{ title: string; summary: string; content: string } | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    console.log('[ENHANCE] 📡 Calling Groq API...');
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

    console.log('[ENHANCE] 📡 Groq API response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ENHANCE] ❌ Groq API error:', errorText.substring(0, 500));
      return null;
    }

    const result = await response.json();
    const textContent = result.choices?.[0]?.message?.content;
    if (!textContent) return null;

    console.log('[ENHANCE] 📝 Groq raw response:', textContent.substring(0, 200));

    // With json_object mode, the response should be valid JSON directly
    const enhanced = JSON.parse(textContent);
    if (!enhanced.title || !enhanced.content) {
      console.error('[ENHANCE] ❌ Groq: Missing title or content in response');
      return null;
    }

    console.log('[ENHANCE] ✅ Groq: Successfully parsed enhanced content');
    return enhanced;
  } catch (error) {
    console.error('[ENHANCE] ❌ Groq error:', error instanceof Error ? error.message : error);
    return null;
  }
}

// Enhancement using Gemini API (Google)
async function enhanceWithGemini(prompt: string): Promise<{ title: string; summary: string; content: string } | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    console.log('[ENHANCE] 📡 Calling Gemini API...');
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

    console.log('[ENHANCE] 📡 Gemini API response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ENHANCE] ❌ Gemini API error:', errorText.substring(0, 500));
      return null;
    }

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

    const enhanced = JSON.parse(jsonStr);
    if (!enhanced.title || !enhanced.content) return null;

    console.log('[ENHANCE] ✅ Gemini: Successfully parsed enhanced content');
    return enhanced;
  } catch (error) {
    console.error('[ENHANCE] ❌ Gemini error:', error instanceof Error ? error.message : error);
    return null;
  }
}

// AI Enhancement - tries Groq first (free), then Claude, then Gemini
async function enhanceArticleWithAI(
  title: string,
  summary: string,
  category: string,
  sourceName: string,
  sourceUrl?: string
): Promise<{ title: string; summary: string; content: string } | null> {
  // Check which API keys are available
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;
  const hasGeminiKey = !!process.env.GOOGLE_GEMINI_API_KEY;

  if (!hasGroqKey && !hasClaudeKey && !hasGeminiKey) {
    console.error('[ENHANCE] ❌ No API key found (GROQ_API_KEY, ANTHROPIC_API_KEY or GOOGLE_GEMINI_API_KEY)');
    return null;
  }

  console.log(`[ENHANCE] 🔑 Available APIs: ${hasGroqKey ? 'Groq ✓' : 'Groq ✗'} | ${hasClaudeKey ? 'Claude ✓' : 'Claude ✗'} | ${hasGeminiKey ? 'Gemini ✓' : 'Gemini ✗'}`);

  // Fetch full content if available
  let fullContent = '';
  if (sourceUrl) {
    const fetched = await fetchFullArticleContent(sourceUrl);
    if (fetched && fetched.length > (summary?.length || 0)) {
      fullContent = fetched;
    }
  }

  const sourceContent = fullContent || summary || title;
  const prompt = buildEnhancementPrompt(title, sourceContent, sourceName, category);

  // Try Groq first (free), then Claude, then Gemini
  if (hasGroqKey) {
    const result = await enhanceWithGroq(prompt);
    if (result) return result;
    console.log('[ENHANCE] ⚠️ Groq failed, trying Claude...');
  }

  if (hasClaudeKey) {
    const result = await enhanceWithClaude(prompt);
    if (result) return result;
    console.log('[ENHANCE] ⚠️ Claude failed, trying Gemini...');
  }

  if (hasGeminiKey) {
    return await enhanceWithGemini(prompt);
  }

  return null;
}

// Process a single article enhancement
async function processArticle(article: {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  originalContent: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  category: { name: string } | null;
}): Promise<{ id: string; title: string; status: 'enhanced' | 'skipped' | 'error'; error?: string }> {
  try {
    const result = await enhanceArticleWithAI(
      article.title,
      article.summary || article.content?.substring(0, 500) || '',
      article.category?.name || 'Actualités',
      article.sourceName || '',
      article.sourceUrl || undefined
    );

    if (result && result.title && result.content) {
      await prisma.article.update({
        where: { id: article.id },
        data: {
          title: result.title,
          summary: result.summary || article.summary,
          content: result.content,
          originalContent: article.originalContent || article.content,
          isAiEnhanced: true,
        },
      });

      return {
        id: article.id,
        title: result.title.substring(0, 50) + '...',
        status: 'enhanced'
      };
    }

    return {
      id: article.id,
      title: article.title.substring(0, 50) + '...',
      status: 'skipped'
    };
  } catch (error) {
    return {
      id: article.id,
      title: article.title.substring(0, 50) + '...',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Process articles in batches for better performance
async function processArticlesInBatches(articles: Parameters<typeof processArticle>[0][]) {
  const results: Awaited<ReturnType<typeof processArticle>>[] = [];

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    console.log(`[ENHANCE] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(articles.length / BATCH_SIZE)}`);

    // Process batch concurrently
    const batchResults = await Promise.allSettled(
      batch.map(article => processArticle(article))
    );

    // Collect results
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
        console.log(`[ENHANCE] ${result.value.status === 'enhanced' ? '✅' : '⚠️'} ${result.value.title}`);
      } else {
        console.error(`[ENHANCE] ❌ Batch error:`, result.reason);
      }
    }

    // Delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < articles.length) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }
  }

  return results;
}

// GET: Enhance articles that haven't been enhanced yet
export async function GET(request: NextRequest) {
  // Rate limiting
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

  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Max 50
  const forceAll = searchParams.get('force') === 'true';

  const startTime = Date.now();

  try {
    // Get articles that need enhancement
    const articles = await prisma.article.findMany({
      where: forceAll ? { status: 'published' } : {
        status: 'published',
        isAiEnhanced: false,
      },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    console.log(`[ENHANCE] Found ${articles.length} articles to enhance (batch size: ${BATCH_SIZE})`);

    if (articles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No articles to enhance',
        enhanced: 0,
        failed: 0,
        total: 0,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    }

    // Process articles in batches
    const results = await processArticlesInBatches(articles);

    const enhanced = results.filter(r => r.status === 'enhanced').length;
    const failed = results.filter(r => r.status !== 'enhanced').length;
    const duration = Date.now() - startTime;

    console.log(`[ENHANCE] Completed in ${duration}ms: ${enhanced} enhanced, ${failed} failed/skipped`);

    return NextResponse.json({
      success: true,
      message: `Enhanced ${enhanced} articles in ${(duration / 1000).toFixed(1)}s`,
      enhanced,
      failed,
      total: articles.length,
      batchSize: BATCH_SIZE,
      duration,
      details: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ENHANCE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Enhancement failed',
        duration: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
