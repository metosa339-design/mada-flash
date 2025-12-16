import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// This endpoint publishes scheduled articles whose scheduledAt date has passed
// Can be called by:
// - A cron job (Vercel Cron, external service, etc.)
// - Manually from the admin dashboard
// - A scheduled task

export async function GET(request: NextRequest) {
  // Optional: Add a secret key for security in production
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In production, verify the cron secret
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // For development, allow without auth
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  try {
    const now = new Date();

    // Find all scheduled articles whose scheduledAt is in the past
    const articlesToPublish = await prisma.article.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now,
        },
      },
    });

    if (articlesToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No articles to publish',
        published: 0,
      });
    }

    // Update all scheduled articles to published
    const result = await prisma.article.updateMany({
      where: {
        id: {
          in: articlesToPublish.map((a) => a.id),
        },
      },
      data: {
        status: 'published',
        publishedAt: now,
      },
    });

    console.log(`[CRON] Published ${result.count} articles at ${now.toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Published ${result.count} article(s)`,
      published: result.count,
      articles: articlesToPublish.map((a) => ({
        id: a.id,
        title: a.title,
        scheduledAt: a.scheduledAt,
      })),
    });
  } catch (error) {
    console.error('[CRON] Error publishing scheduled articles:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// Also support POST for webhook-style calls
export async function POST(request: NextRequest) {
  return GET(request);
}
