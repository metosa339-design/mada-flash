import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { searchImage, getRecentlyUsedImages } from '@/lib/image-search';

// Helper to check authentication (same as other admin routes)
async function checkAuth(request: NextRequest) {
  const sessionId = request.cookies.get('mada-flash-admin-session')?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}

// GET: Voir les articles sans images ou avec placeholder
export async function GET(request: NextRequest) {
  const user = await checkAuth(request);
  if (!user) {
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
  const user = await checkAuth(request);
  if (!user) {
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

    // Pre-fetch recently used images once for better performance
    const usedImages = await getRecentlyUsedImages();
    console.log(`Starting image update for ${articlesToUpdate.length} articles, excluding ${usedImages.size} already used images`);

    // Traiter chaque article
    for (const article of articlesToUpdate) {
      try {
        // Utiliser directement la fonction importée avec la liste des images utilisées
        const image = await searchImage(
          article.title,
          article.summary || '',
          article.category?.name?.toLowerCase(),
          false, // forceAI
          usedImages // pass the set of used images
        );

        if (image && image.url && !image.url.includes('placeholder')) {
          await prisma.article.update({
            where: { id: article.id },
            data: { imageUrl: image.url }
          });

          // Add the newly assigned image to the set to avoid duplicates within this batch
          if (!image.url.startsWith('data:')) {
            usedImages.add(image.url);
          }

          results.updated++;
          results.details.push({
            id: article.id,
            title: article.title.substring(0, 50) + '...',
            status: 'success',
            imageUrl: image.url
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
        console.error(`Error updating image for article ${article.id}:`, err);
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Erreur: ${errorMessage}` },
      { status: 500 }
    );
  }
}
