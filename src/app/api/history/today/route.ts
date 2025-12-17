import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // JavaScript months are 0-indexed

    // Fetch events for today, prioritizing Madagascar events
    const events = await prisma.historicalEvent.findMany({
      where: {
        day,
        month,
        isActive: true,
      },
      orderBy: [
        { isMadagascar: 'desc' }, // Madagascar events first
        { year: 'desc' }, // Most recent first
      ],
    });

    return NextResponse.json({
      date: {
        day,
        month,
        formatted: today.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
        }),
      },
      events,
      count: events.length,
    });
  } catch (error) {
    console.error('Error fetching historical events:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    );
  }
}
