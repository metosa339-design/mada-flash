import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/economy/exports - Get export products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // agriculture, mining, textile, seafood, handicraft
    const slug = searchParams.get('slug');
    const featured = searchParams.get('featured') === 'true';

    // If specific product requested
    if (slug) {
      const product = await prisma.exportProduct.findUnique({
        where: { slug },
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(product);
    }

    // Build where clause
    const where: any = { isActive: true };
    if (category) where.category = category;
    if (featured) where.isFeatured = true;

    const products = await prisma.exportProduct.findMany({
      where,
      orderBy: [
        { annualExportValue: 'desc' },
        { name: 'asc' },
      ],
    });

    // Group by category
    const byCategory = {
      agriculture: products.filter(p => p.category === 'agriculture'),
      mining: products.filter(p => p.category === 'mining'),
      textile: products.filter(p => p.category === 'textile'),
      seafood: products.filter(p => p.category === 'seafood'),
      handicraft: products.filter(p => p.category === 'handicraft'),
    };

    // Calculate totals
    const totalExportValue = products.reduce((sum, p) => sum + (p.annualExportValue || 0), 0);

    return NextResponse.json({
      products,
      byCategory,
      stats: {
        total: products.length,
        totalExportValue,
      },
    });
  } catch (error) {
    console.error('Error fetching exports:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}
