import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/history/timeline - Get all historical eras with events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeEvents = searchParams.get('events') === 'true';
    const eraSlug = searchParams.get('era');

    // If specific era requested
    if (eraSlug) {
      const era = await prisma.historicalEra.findUnique({
        where: { slug: eraSlug },
        include: {
          events: {
            where: { isActive: true },
            orderBy: { year: 'asc' },
          },
          figures: {
            where: { isActive: true },
            orderBy: { birthYear: 'asc' },
          },
        },
      });

      if (!era) {
        return NextResponse.json(
          { error: 'Era not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(era);
    }

    // Get all eras
    const eras = await prisma.historicalEra.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: includeEvents ? {
        events: {
          where: { isActive: true, isFeatured: true },
          orderBy: { year: 'asc' },
          take: 5,
        },
        _count: {
          select: { events: true, figures: true },
        },
      } : {
        _count: {
          select: { events: true, figures: true },
        },
      },
    });

    return NextResponse.json({
      eras,
      count: eras.length,
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la timeline' },
      { status: 500 }
    );
  }
}
