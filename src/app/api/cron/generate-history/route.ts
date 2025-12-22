import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// AI History Content Generator
// This cron job generates new historical content using Gemini AI

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

interface GeneratedEvent {
  title: string;
  titleMg?: string;
  description: string;
  year: number;
  month?: number;
  day?: number;
  eventType: string;
  importance: number;
  location?: string;
  source?: string;
}

interface GeneratedFigure {
  name: string;
  title?: string;
  biography: string;
  shortBio: string;
  role: string;
  birthYear?: number;
  deathYear?: number;
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

// Call Gemini API
async function callGeminiAPI(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    console.log('GOOGLE_GEMINI_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return null;
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

// Parse JSON from AI response
function parseJSONResponse<T>(text: string): T | null {
  try {
    // Try to extract JSON from response
    let jsonStr = text;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                      text.match(/```\s*([\s\S]*?)\s*```/) ||
                      text.match(/\[[\s\S]*\]/) ||
                      text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      jsonStr = jsonMatch[1] || jsonMatch[0];
    }

    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

// Generate new historical events
async function generateHistoricalEvents(era: string, count: number = 3): Promise<GeneratedEvent[]> {
  const prompt = `Tu es un historien expert de Madagascar. Génère ${count} événements historiques importants de l'époque "${era}" que nous n'aurions pas encore documentés.

Pour chaque événement, inclus:
- title: Titre court et descriptif (en français)
- titleMg: Titre en malgache si pertinent
- description: Description détaillée (150-200 mots) avec contexte historique
- year: Année de l'événement
- month: Mois (1-12) si connu
- day: Jour (1-31) si connu
- eventType: Type (political, economic, social, cultural, discovery, conflict)
- importance: Importance de 1 à 5
- location: Lieu spécifique à Madagascar
- source: Source ou référence historique

IMPORTANT: Les événements doivent être RÉELS et VÉRIFIABLES. Ne pas inventer.

Réponds UNIQUEMENT avec un tableau JSON, sans texte avant ou après:
[{...}, {...}, {...}]`;

  const response = await callGeminiAPI(prompt);
  if (!response) return [];

  const events = parseJSONResponse<GeneratedEvent[]>(response);
  return events || [];
}

// Generate new historical figures
async function generateHistoricalFigures(era: string, count: number = 2): Promise<GeneratedFigure[]> {
  const prompt = `Tu es un historien expert de Madagascar. Génère ${count} personnages historiques importants de l'époque "${era}" que nous n'aurions pas encore documentés.

Pour chaque personnage, inclus:
- name: Nom complet
- title: Titre (Roi, Reine, Général, etc.) si applicable
- biography: Biographie détaillée (200-300 mots)
- shortBio: Résumé en 1-2 phrases
- role: Rôle (monarch, politician, leader, explorer, hero, artist, scientist)
- birthYear: Année de naissance si connue
- deathYear: Année de décès si connue

IMPORTANT: Les personnages doivent être RÉELS et VÉRIFIABLES. Ne pas inventer.

Réponds UNIQUEMENT avec un tableau JSON, sans texte avant ou après:
[{...}, {...}]`;

  const response = await callGeminiAPI(prompt);
  if (!response) return [];

  const figures = parseJSONResponse<GeneratedFigure[]>(response);
  return figures || [];
}

// Generate daily content
async function generateDailyContent(): Promise<{
  wordOfDay: string;
  wordMeaning: string;
  wordExample: string;
  quizQuestion: string;
  quizOptions: string[];
  quizAnswer: string;
  quizExplanation: string;
} | null> {
  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  const prompt = `Tu es un expert de Madagascar. Génère du contenu quotidien pour le ${dateStr}:

1. MOT DU JOUR en malgache:
- wordOfDay: Un mot malgache intéressant
- wordMeaning: Sa signification en français
- wordExample: Un exemple d'utilisation

2. QUIZ sur l'histoire de Madagascar:
- quizQuestion: Une question intéressante
- quizOptions: 4 options de réponse (tableau)
- quizAnswer: La bonne réponse
- quizExplanation: Explication de la réponse

IMPORTANT: Le contenu doit être éducatif et culturellement approprié.

Réponds UNIQUEMENT avec un objet JSON:
{
  "wordOfDay": "...",
  "wordMeaning": "...",
  "wordExample": "...",
  "quizQuestion": "...",
  "quizOptions": ["A", "B", "C", "D"],
  "quizAnswer": "...",
  "quizExplanation": "..."
}`;

  const response = await callGeminiAPI(prompt);
  if (!response) return null;

  return parseJSONResponse(response);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'daily';
  const era = searchParams.get('era');

  // Simple auth check (in production, use proper authentication)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow without auth for development
    console.log('Warning: No CRON_SECRET or invalid auth');
  }

  try {
    const results: any = { action, timestamp: new Date().toISOString() };

    if (action === 'daily' || action === 'all') {
      // Generate daily content
      const dailyContent = await generateDailyContent();

      if (dailyContent) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await prisma.dailyContent.upsert({
          where: { date: today },
          update: {
            ...dailyContent,
            quizOptions: JSON.stringify(dailyContent.quizOptions),
            aiGenerated: true,
          },
          create: {
            date: today,
            ...dailyContent,
            quizOptions: JSON.stringify(dailyContent.quizOptions),
            aiGenerated: true,
          },
        });

        results.dailyContent = 'Generated successfully';
      }
    }

    if ((action === 'events' || action === 'all') && era) {
      // Generate historical events
      const eraRecord = await prisma.historicalEra.findUnique({
        where: { slug: era },
      });

      if (eraRecord) {
        const events = await generateHistoricalEvents(eraRecord.name);
        let addedCount = 0;

        for (const event of events) {
          // Check if event already exists
          const existing = await prisma.historicalEvent.findFirst({
            where: {
              title: event.title,
              year: event.year,
            },
          });

          if (!existing) {
            await prisma.historicalEvent.create({
              data: {
                title: event.title,
                titleMg: event.titleMg,
                description: event.description,
                year: event.year,
                day: event.day || 1,
                month: event.month || 1,
                eventType: event.eventType,
                importance: event.importance,
                location: event.location,
                source: event.source,
                eraId: eraRecord.id,
                isMadagascar: true,
                aiEnhanced: true,
                isActive: true,
              },
            });
            addedCount++;
          }
        }

        results.events = { generated: events.length, added: addedCount };
      }
    }

    if ((action === 'figures' || action === 'all') && era) {
      // Generate historical figures
      const eraRecord = await prisma.historicalEra.findUnique({
        where: { slug: era },
      });

      if (eraRecord) {
        const figures = await generateHistoricalFigures(eraRecord.name);
        let addedCount = 0;

        for (const figure of figures) {
          const slug = generateSlug(figure.name);

          // Check if figure already exists
          const existing = await prisma.historicalFigure.findUnique({
            where: { slug },
          });

          if (!existing) {
            await prisma.historicalFigure.create({
              data: {
                ...figure,
                slug,
                eraId: eraRecord.id,
                isActive: true,
              },
            });
            addedCount++;
          }
        }

        results.figures = { generated: figures.length, added: addedCount };
      }
    }

    // Log AI content generation
    await prisma.aIContentLog.create({
      data: {
        contentType: action,
        prompt: `Action: ${action}, Era: ${era || 'N/A'}`,
        response: JSON.stringify(results).substring(0, 1000),
        status: 'success',
        model: 'gemini-1.5-flash',
      },
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error in generate-history cron:', error);

    // Log error
    await prisma.aIContentLog.create({
      data: {
        contentType: action,
        prompt: `Action: ${action}, Era: ${era || 'N/A'}`,
        status: 'failed',
        error: String(error),
        model: 'gemini-1.5-flash',
      },
    });

    return NextResponse.json(
      { success: false, error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

// POST endpoint for manual trigger
export async function POST(request: Request) {
  return GET(request);
}
