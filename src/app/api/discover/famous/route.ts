import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/discover/famous - Get famous things about Madagascar
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // fauna, flora, culture, landmark, tradition, cuisine, sport
    const slug = searchParams.get('slug');
    const featured = searchParams.get('featured') === 'true';
    const endemic = searchParams.get('endemic') === 'true';

    // If specific thing requested
    if (slug) {
      const thing = await prisma.famousThing.findUnique({
        where: { slug },
      });

      if (!thing) {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(thing);
    }

    // Build where clause
    const where: any = { isActive: true };
    if (category) where.category = category;
    if (featured) where.isFeatured = true;
    if (endemic) where.endemic = true;

    const things = await prisma.famousThing.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group by category
    const byCategory = {
      fauna: things.filter(t => t.category === 'fauna'),
      flora: things.filter(t => t.category === 'flora'),
      culture: things.filter(t => t.category === 'culture'),
      landmark: things.filter(t => t.category === 'landmark'),
      tradition: things.filter(t => t.category === 'tradition'),
      cuisine: things.filter(t => t.category === 'cuisine'),
    };

    // Endemic species count
    const endemicCount = things.filter(t => t.endemic).length;

    return NextResponse.json({
      items: things,
      byCategory,
      stats: {
        total: things.length,
        endemic: endemicCount,
      },
    });
  } catch (error) {
    console.error('Error fetching famous things:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des éléments' },
      { status: 500 }
    );
  }
}
