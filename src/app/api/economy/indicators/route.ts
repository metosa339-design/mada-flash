import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/economy/indicators - Get economic indicators
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // price, rate, export, import, gdp, inflation
    const category = searchParams.get('category'); // vanilla, coffee, rice, mining, tourism
    const slug = searchParams.get('slug');

    // If specific indicator requested
    if (slug) {
      const indicator = await prisma.economicIndicator.findUnique({
        where: { slug },
      });

      if (!indicator) {
        return NextResponse.json(
          { error: 'Indicator not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(indicator);
    }

    // Build where clause
    const where: any = { isActive: true };
    if (type) where.type = type;
    if (category) where.category = category;

    const indicators = await prisma.economicIndicator.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Group by type
    const byType = {
      prices: indicators.filter(i => i.type === 'price'),
      rates: indicators.filter(i => i.type === 'rate'),
      macro: indicators.filter(i => ['gdp', 'inflation', 'export', 'import'].includes(i.type)),
    };

    return NextResponse.json({
      indicators,
      byType,
      total: indicators.length,
      lastUpdated: indicators[0]?.lastUpdated || new Date(),
    });
  } catch (error) {
    console.error('Error fetching indicators:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des indicateurs' },
      { status: 500 }
    );
  }
}
