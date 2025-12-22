import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/daily-content - Get today's daily content
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDate();
    const month = today.getMonth() + 1;

    // Get daily content
    const dailyContent = await prisma.dailyContent.findUnique({
      where: { date: today },
    });

    // Get historical events for today
    const historyEvents = await prisma.historicalEvent.findMany({
      where: {
        day,
        month,
        isActive: true,
      },
      orderBy: [
        { isMadagascar: 'desc' },
        { importance: 'desc' },
        { year: 'desc' },
      ],
      take: 5,
      include: {
        era: {
          select: { name: true, color: true },
        },
      },
    });

    // Get featured figure of the day
    const featuredFigure = dailyContent?.featuredFigureId
      ? await prisma.historicalFigure.findUnique({
          where: { id: dailyContent.featuredFigureId },
        })
      : await prisma.historicalFigure.findFirst({
          where: { isActive: true, isFeatured: true },
          orderBy: { createdAt: 'desc' },
        });

    // Get featured product of the day
    const featuredProduct = await prisma.exportProduct.findFirst({
      where: { isActive: true, isFeatured: true },
      orderBy: { annualExportValue: 'desc' },
    });

    // Get random famous thing
    const famousThings = await prisma.famousThing.findMany({
      where: { isActive: true },
      take: 10,
    });
    const randomFamousThing = famousThings[Math.floor(Math.random() * famousThings.length)];

    return NextResponse.json({
      date: {
        day,
        month,
        formatted: today.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      },
      historyEvents,
      dailyContent: dailyContent
        ? {
            wordOfDay: dailyContent.wordOfDay,
            wordMeaning: dailyContent.wordMeaning,
            wordExample: dailyContent.wordExample,
            quiz: dailyContent.quizQuestion
              ? {
                  question: dailyContent.quizQuestion,
                  options: dailyContent.quizOptions
                    ? JSON.parse(dailyContent.quizOptions)
                    : [],
                  answer: dailyContent.quizAnswer,
                  explanation: dailyContent.quizExplanation,
                }
              : null,
          }
        : null,
      featured: {
        figure: featuredFigure,
        product: featuredProduct,
        famousThing: randomFamousThing,
      },
    });
  } catch (error) {
    console.error('Error fetching daily content:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du contenu quotidien' },
      { status: 500 }
    );
  }
}
