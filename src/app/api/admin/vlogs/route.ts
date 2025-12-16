import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

async function checkAuth(request: NextRequest) {
  const sessionId = request.cookies.get('mada-flash-admin-session')?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET - List all vlogs
export async function GET(request: NextRequest) {
  const user = await checkAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const [vlogs, total] = await Promise.all([
      prisma.vlog.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vlog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      vlogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching vlogs:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Create vlog
export async function POST(request: NextRequest) {
  const user = await checkAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      categoryId,
      status = 'draft',
      scheduledAt,
      duration,
      isFeatured,
    } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Titre et URL vidéo requis' },
        { status: 400 }
      );
    }

    let slug = generateSlug(title);
    const existing = await prisma.vlog.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const vlog = await prisma.vlog.create({
      data: {
        title,
        slug,
        description,
        videoUrl,
        thumbnailUrl,
        categoryId: categoryId || null,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: status === 'published' ? new Date() : null,
        duration,
        isFeatured: isFeatured || false,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, vlog });
  } catch (error) {
    console.error('Error creating vlog:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
