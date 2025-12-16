import { NextResponse } from 'next/server';

interface EnhanceRequest {
  originalTitle: string;
  originalSummary: string;
  category: string;
  sourceName: string;
  sourceUrl: string;
}

interface EnhancedArticle {
  title: string;
  summary: string;
  content: string;
  tags: string[];
}

// Use Gemini to enhance and rewrite article with analysis
async function enhanceWithGemini(data: EnhanceRequest): Promise<EnhancedArticle | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GOOGLE_GEMINI_API_KEY not configured');
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

  const context = categoryContext[data.category] || "actualités de Madagascar";

  const prompt = `Tu es un journaliste professionnel et analyste expert sur Madagascar. Tu dois rédiger un article ORIGINAL et ANALYTIQUE basé sur cette information source.

**INFORMATION SOURCE:**
- Titre original: "${data.originalTitle}"
- Résumé: "${data.originalSummary}"
- Source: ${data.sourceName}
- Catégorie: ${data.category} (${context})

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error('No text content in Gemini response');
      return null;
    }

    // Extract JSON from response (handle potential markdown code blocks)
    let jsonStr = textContent;
    const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                      textContent.match(/```\s*([\s\S]*?)\s*```/) ||
                      textContent.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      jsonStr = jsonMatch[1] || jsonMatch[0];
    }

    // Clean up the JSON string
    jsonStr = jsonStr.trim();
    if (!jsonStr.startsWith('{')) {
      const startIdx = jsonStr.indexOf('{');
      if (startIdx !== -1) {
        jsonStr = jsonStr.substring(startIdx);
      }
    }

    const enhanced = JSON.parse(jsonStr) as EnhancedArticle;

    // Validate the response
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

// Fallback: Basic reformulation without AI
function basicEnhancement(data: EnhanceRequest): EnhancedArticle {
  // Create a more engaging title
  const title = data.originalTitle.length > 60
    ? data.originalTitle.substring(0, 57) + '...'
    : data.originalTitle;

  // Create summary with source attribution
  const summary = data.originalSummary.length > 180
    ? data.originalSummary.substring(0, 177) + '...'
    : data.originalSummary;

  // Create basic content
  const content = `**${data.originalTitle}**

${data.originalSummary}

Cette information provient de **${data.sourceName}**. Pour plus de détails et l'analyse complète, consultez la source originale.

*Note: Cet article est une synthèse de l'information publiée par ${data.sourceName}.*`;

  // Generate basic tags
  const words = data.originalTitle.toLowerCase().split(/\s+/);
  const tags = words
    .filter(w => w.length > 4)
    .slice(0, 5)
    .map(w => w.replace(/[^a-zàâäéèêëïîôùûüç]/g, ''));

  return { title, summary, content, tags };
}

export async function POST(request: Request) {
  try {
    const body: EnhanceRequest = await request.json();

    // Validate required fields
    if (!body.originalTitle || !body.originalSummary) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: originalTitle, originalSummary' },
        { status: 400 }
      );
    }

    // Set default category if not provided
    const category = body.category || 'societe';

    console.log(`Enhancing article: "${body.originalTitle.substring(0, 50)}..."`);

    // Try AI enhancement first
    let enhanced = await enhanceWithGemini({
      ...body,
      category
    });

    // Fallback to basic enhancement if AI fails
    if (!enhanced) {
      console.log('AI enhancement failed, using basic enhancement');
      enhanced = basicEnhancement({ ...body, category });
    }

    return NextResponse.json({
      success: true,
      enhanced,
      aiGenerated: enhanced !== null
    });

  } catch (error) {
    console.error('Error in enhance-article API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to enhance article' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  const hasApiKey = !!process.env.GOOGLE_GEMINI_API_KEY;

  return NextResponse.json({
    status: 'ok',
    aiEnhancementEnabled: hasApiKey,
    message: hasApiKey
      ? 'AI article enhancement is active'
      : 'AI enhancement not configured - using basic mode'
  });
}
