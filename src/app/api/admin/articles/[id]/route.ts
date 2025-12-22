import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { articleUpdateSchema, validateData, sanitizeContent } from '@/lib/validations';

async function checkAuth(request: NextRequest) {
  const sessionId = request.cookies.get('mada-flash-admin-session')?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}

// GET - Get single article by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: { category: true, media: { include: { media: true } } },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input with Zod
    const validation = validateData(articleUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: validation.errors },
        { status: 400 }
      );
    }

    const {
      title,
      content,
      summary,
      categoryId,
      imageUrl,
      additionalImages,
      sourceUrl,
      sourceName,
      status,
      scheduledAt,
      isFeatured,
      isBreaking,
      hasCustomImage,
      metaTitle,
      metaDescription,
    } = validation.data;

    // Check if article exists
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // If status is changing to published, set publishedAt
    let publishedAt = existing.publishedAt;
    if (status === 'published' && existing.status !== 'published') {
      publishedAt = new Date();
    }

    // Sanitize content if provided
    const sanitizedContent = content ? sanitizeContent(content) : undefined;

    const article = await prisma.article.update({
      where: { id },
      data: {
        title,
        content: sanitizedContent,
        summary,
        categoryId: categoryId || null,
        imageUrl,
        additionalImages: additionalImages ? JSON.stringify(additionalImages) : null,
        sourceUrl,
        sourceName,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt,
        isFeatured,
        isBreaking,
        hasCustomImage, // Track manual image uploads
        metaTitle,
        metaDescription,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  // Only admin can delete
  if (user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Permission refusée' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
