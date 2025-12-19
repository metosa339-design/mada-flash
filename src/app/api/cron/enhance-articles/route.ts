import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

// AI Enhancement using Gemini
async function enhanceArticleWithAI(
  title: string,
  summary: string,
  category: string,
  sourceName: string,
  sourceUrl?: string
): Promise<{ title: string; summary: string; content: string } | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;

  let fullContent = '';
  if (sourceUrl) {
    const fetched = await fetchFullArticleContent(sourceUrl);
    if (fetched && fetched.length > (summary?.length || 0)) {
      fullContent = fetched;
    }
  }

  const sourceContent = fullContent || summary || title;

  const prompt = `Tu es un journaliste expert de Madagascar. Réécris cet article de manière CAPTIVANTE et PROFESSIONNELLE.

**SOURCE:**
Titre: "${title}"
Contenu source: "${sourceContent.substring(0, 1500)}"
Source: ${sourceName || 'Non spécifié'}
Catégorie: ${category || 'Actualités'}

**RÈGLES STRICTES:**

📰 **TITRE** (max 70 caractères):
- Percutant, informatif, accrocheur
- Utilise des verbes d'action forts

📝 **RÉSUMÉ** (1-2 phrases, max 150 caractères):
- L'essentiel en une phrase choc

📖 **CONTENU** (150-250 mots MAXIMUM):
Structure OBLIGATOIRE:

**[Accroche - 2 lignes max]**
Une phrase choc qui résume l'info principale.

**🔑 Les faits clés:**
• Point important 1
• Point important 2
• Point important 3

**[Contexte bref - 2-3 lignes]**

**[Conclusion/Impact - 1-2 lignes]**

*Source: ${sourceName || 'Non spécifié'}*

**STYLE:**
- Phrases COURTES et DIRECTES
- **Gras** sur les mots-clés importants
- Pas de blabla, que l'essentiel

**FORMAT JSON:**
{
  "title": "Titre accrocheur ici",
  "summary": "Résumé percutant",
  "content": "Contenu structuré avec markdown..."
}

RÉPONDS UNIQUEMENT EN JSON.`;

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

    const enhanced = JSON.parse(jsonStr);
    if (!enhanced.title || !enhanced.content) return null;

    return enhanced;
  } catch {
    return null;
  }
}

// GET: Enhance articles that haven't been enhanced yet
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const forceAll = searchParams.get('force') === 'true';

  try {
    // Get articles that need enhancement
    const articles = await prisma.article.findMany({
      where: forceAll ? { status: 'published' } : {
        status: 'published',
        isAiEnhanced: false, // Only articles not yet enhanced
      },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    console.log(`[ENHANCE] Found ${articles.length} articles to enhance`);

    let enhanced = 0;
    let failed = 0;
    const details: { id: string; title: string; status: string }[] = [];

    for (const article of articles) {
      console.log(`[ENHANCE] Processing: "${article.title.substring(0, 40)}..."`);

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

        enhanced++;
        details.push({
          id: article.id,
          title: result.title.substring(0, 50) + '...',
          status: 'enhanced'
        });
        console.log(`[ENHANCE] ✅ Enhanced: "${result.title.substring(0, 40)}..."`);
      } else {
        failed++;
        details.push({
          id: article.id,
          title: article.title.substring(0, 50) + '...',
          status: 'skipped'
        });
      }

      // Delay between API calls
      await new Promise(r => setTimeout(r, 800));
    }

    return NextResponse.json({
      success: true,
      message: `Enhanced ${enhanced} articles`,
      enhanced,
      failed,
      total: articles.length,
      details,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ENHANCE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Enhancement failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
