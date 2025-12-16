import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

async function checkAuth(request: NextRequest) {
  const sessionId = request.cookies.get('mada-flash-admin-session')?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET - List all categories
export async function GET(request: NextRequest) {
  const user = await checkAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { articles: true, vlogs: true },
        },
      },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Create category
export async function POST(request: NextRequest) {
  const user = await checkAuth(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, color, icon, order } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nom requis' },
        { status: 400 }
      );
    }

    let slug = generateSlug(name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        color: color || '#ff6b35',
        icon,
        order: order || 0,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
