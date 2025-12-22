// Script to re-enhance all existing articles with improved AI content
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fetch full article content from source URL
async function fetchFullArticleContent(sourceUrl) {
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

    // Extract main content from HTML
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

    // Clean HTML
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
  } catch (error) {
    return null;
  }
}

// AI Enhancement using Gemini
async function enhanceArticleWithAI(title, summary, category, sourceName, sourceUrl) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    console.log('❌ GOOGLE_GEMINI_API_KEY not found');
    return null;
  }

  // Try to fetch full content
  let fullContent = '';
  if (sourceUrl) {
    const fetched = await fetchFullArticleContent(sourceUrl);
    if (fetched && fetched.length > (summary?.length || 0)) {
      fullContent = fetched;
      console.log(`   📄 Fetched ${fullContent.length} chars from source`);
    }
  }

  const sourceContent = fullContent || summary || title;

  const prompt = `Tu es un journaliste expert de Madagascar. Réécris cet article de manière CAPTIVANTE et PROFESSIONNELLE.

**SOURCE:**
Titre: "${title}"
Contenu source: "${sourceContent.substring(0, 1500)}"
Source: ${sourceName || 'Non spécifié'}
Catégorie: ${category || 'Actualités'}

**RÈGLES STRICTES - TRÈS IMPORTANT:**

📰 **TITRE** (max 70 caractères):
- Percutant, informatif, accrocheur
- Pas de clickbait mais donne envie de lire
- Utilise des verbes d'action forts

📝 **RÉSUMÉ** (1-2 phrases, max 150 caractères):
- L'essentiel en une phrase choc
- Répond à: Quoi? Qui? Où?

📖 **CONTENU** (150-250 mots MAXIMUM - c'est court!):
Structure OBLIGATOIRE:

**[Paragraphe d'accroche - 2 lignes max]**
Une phrase choc qui résume l'info principale.

**🔑 Les faits clés:**
• Point important 1
• Point important 2
• Point important 3

**[Contexte bref - 2-3 lignes]**
Explication simple du contexte.

**[Conclusion/Impact - 1-2 lignes]**
Pourquoi c'est important ou quelle suite.

*Source: ${sourceName || 'Non spécifié'}*

**STYLE:**
- Phrases COURTES et DIRECTES
- **Gras** sur les mots-clés importants
- Pas de blabla, que l'essentiel
- Ton journalistique professionnel
- Accessible à tous

**FORMAT JSON:**
{
  "title": "Titre accrocheur ici",
  "summary": "Résumé percutant",
  "content": "Contenu structuré avec markdown..."
}

RÉPONDS UNIQUEMENT EN JSON.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!response.ok) {
      console.log(`   ❌ API error: ${response.status}`);
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

    return enhanced;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function enhanceAllArticles() {
  console.log('🚀 Starting article enhancement...\n');

  try {
    // Get all published articles
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
    });

    console.log(`📊 Found ${articles.length} published articles to enhance\n`);

    let enhanced = 0;
    let failed = 0;

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n[${i + 1}/${articles.length}] "${article.title.substring(0, 50)}..."`);

      const result = await enhanceArticleWithAI(
        article.title,
        article.summary || article.content?.substring(0, 500),
        article.category?.name || 'Actualités',
        article.sourceName,
        article.sourceUrl
      );

      if (result && result.title && result.content) {
        await prisma.article.update({
          where: { id: article.id },
          data: {
            title: result.title,
            summary: result.summary || article.summary,
            content: result.content,
            originalContent: article.content, // Sauvegarder l'ancien contenu
            isAiEnhanced: true,
          },
        });

        enhanced++;
        console.log(`   ✅ Enhanced: "${result.title.substring(0, 40)}..."`);
      } else {
        failed++;
        console.log(`   ⚠️ Skipped (no enhancement)`);
      }

      // Delay between API calls to avoid rate limiting
      await new Promise(r => setTimeout(r, 800));
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✅ Enhancement complete!`);
    console.log(`   - Enhanced: ${enhanced}`);
    console.log(`   - Skipped: ${failed}`);
    console.log(`   - Total: ${articles.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enhanceAllArticles();
