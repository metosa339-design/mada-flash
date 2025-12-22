import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/economy/resources - Get mining resources
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // precious_stone, mineral, metal, energy
    const region = searchParams.get('region');
    const slug = searchParams.get('slug');
    const featured = searchParams.get('featured') === 'true';

    // If specific resource requested
    if (slug) {
      const resource = await prisma.miningResource.findUnique({
        where: { slug },
      });

      if (!resource) {
        return NextResponse.json(
          { error: 'Resource not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(resource);
    }

    // Build where clause
    const where: any = { isActive: true };
    if (type) where.type = type;
    if (region) where.region = { contains: region, mode: 'insensitive' };
    if (featured) where.isFeatured = true;

    const resources = await prisma.miningResource.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Group by type
    const byType = {
      precious_stones: resources.filter(r => r.type === 'precious_stone'),
      minerals: resources.filter(r => r.type === 'mineral'),
      metals: resources.filter(r => r.type === 'metal'),
      energy: resources.filter(r => r.type === 'energy'),
    };

    // Get unique regions
    const regions = [...new Set(resources.map(r => r.region).filter(Boolean))];

    return NextResponse.json({
      resources,
      byType,
      regions,
      total: resources.length,
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des ressources' },
      { status: 500 }
    );
  }
}
