import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/history/leaders - Get political leaders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // monarch, president, prime_minister, colonial
    const slug = searchParams.get('slug');

    // If specific leader requested
    if (slug) {
      const leader = await prisma.politicalLeader.findUnique({
        where: { slug },
      });

      if (!leader) {
        return NextResponse.json(
          { error: 'Leader not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(leader);
    }

    // Build where clause
    const where: any = { isActive: true };
    if (type) where.type = type;

    const leaders = await prisma.politicalLeader.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    // Group by type
    const monarchs = leaders.filter(l => l.type === 'monarch');
    const presidents = leaders.filter(l => l.type === 'president');
    const colonial = leaders.filter(l => l.type === 'colonial');

    return NextResponse.json({
      leaders,
      byType: {
        monarchs,
        presidents,
        colonial,
      },
      total: leaders.length,
    });
  } catch (error) {
    console.error('Error fetching leaders:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des dirigeants' },
      { status: 500 }
    );
  }
}
