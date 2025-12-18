import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

// Vérifier l'authentification admin
async function isAuthenticated() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  return sessionCookie?.value === 'authenticated';
}

// Fonction pour rechercher une image appropriée
async function searchImageForArticle(title: string, summary: string, categoryName?: string): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/images/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        summary,
        category: categoryName?.toLowerCase()
      })
    });

    const data = await response.json();

    if (data.success && data.image?.url && !data.image.url.includes('placeholder')) {
      return data.image.url;
    }
  } catch (error) {
    console.error('Error searching image:', error);
  }

  return null;
}

// GET: Voir les articles sans images ou avec placeholder
export async function GET(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // Trouver les articles sans image ou avec placeholder
    const articlesWithoutImages = await prisma.article.findMany({
      where: {
        OR: [
          { imageUrl: null },
          { imageUrl: '' },
          { imageUrl: { contains: 'placeholder' } }
        ],
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        summary: true,
        imageUrl: true,
        category: { select: { name: true } }
      },
      orderBy: { publishedAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      count: articlesWithoutImages.length,
      articles: articlesWithoutImages
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}

// POST: Mettre à jour les images des articles
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { articleIds, updateAll } = body;

    let articlesToUpdate;

    if (updateAll) {
      // Mettre à jour tous les articles sans images
      articlesToUpdate = await prisma.article.findMany({
        where: {
          OR: [
            { imageUrl: null },
            { imageUrl: '' },
            { imageUrl: { contains: 'placeholder' } }
          ],
          status: 'published'
        },
        include: { category: true },
        take: 20 // Limiter pour éviter les timeouts
      });
    } else if (articleIds && articleIds.length > 0) {
      // Mettre à jour des articles spécifiques
      articlesToUpdate = await prisma.article.findMany({
        where: { id: { in: articleIds } },
        include: { category: true }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Aucun article spécifié' },
        { status: 400 }
      );
    }

    const results = {
      total: articlesToUpdate.length,
      updated: 0,
      failed: 0,
      details: [] as { id: string; title: string; status: string; imageUrl?: string }[]
    };

    // Traiter chaque article
    for (const article of articlesToUpdate) {
      try {
        const imageUrl = await searchImageForArticle(
          article.title,
          article.summary || '',
          article.category?.name
        );

        if (imageUrl) {
          await prisma.article.update({
            where: { id: article.id },
            data: { imageUrl }
          });

          results.updated++;
          results.details.push({
            id: article.id,
            title: article.title.substring(0, 50) + '...',
            status: 'success',
            imageUrl
          });
        } else {
          results.failed++;
          results.details.push({
            id: article.id,
            title: article.title.substring(0, 50) + '...',
            status: 'no_image_found'
          });
        }

        // Petit délai entre les requêtes pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err) {
        results.failed++;
        results.details.push({
          id: article.id,
          title: article.title.substring(0, 50) + '...',
          status: 'error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.updated} articles mis à jour sur ${results.total}`,
      results
    });

  } catch (error) {
    console.error('Error updating images:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour des images' },
      { status: 500 }
    );
  }
}
