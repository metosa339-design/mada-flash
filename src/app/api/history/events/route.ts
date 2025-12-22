import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/history/events - Get historical events with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eraId = searchParams.get('era');
    const eventType = searchParams.get('type');
    const year = searchParams.get('year');
    const startYear = searchParams.get('startYear');
    const endYear = searchParams.get('endYear');
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      isActive: true,
      isMadagascar: true, // Focus on Madagascar events
    };

    if (eraId) where.eraId = eraId;
    if (eventType) where.eventType = eventType;
    if (year) where.year = parseInt(year);
    if (featured) where.isFeatured = true;

    if (startYear && endYear) {
      where.year = {
        gte: parseInt(startYear),
        lte: parseInt(endYear),
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch events
    const [events, total] = await Promise.all([
      prisma.historicalEvent.findMany({
        where,
        orderBy: { year: 'asc' },
        take: limit,
        skip: offset,
        include: {
          era: {
            select: { name: true, slug: true, color: true },
          },
        },
      }),
      prisma.historicalEvent.count({ where }),
    ]);

    // Get event types for filtering
    const eventTypes = await prisma.historicalEvent.groupBy({
      by: ['eventType'],
      where: { isActive: true, isMadagascar: true },
      _count: true,
    });

    return NextResponse.json({
      events,
      total,
      limit,
      offset,
      eventTypes: eventTypes.map(t => ({
        type: t.eventType,
        count: t._count,
      })),
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    );
  }
}
