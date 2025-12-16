import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { unlink } from 'fs/promises';
import path from 'path';

async function checkAuth(request: NextRequest) {
  const sessionId = request.cookies.get('mada-flash-admin-session')?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}

// GET - Get single media by ID
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
    const media = await prisma.media.findUnique({ where: { id } });

    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Média non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Update media metadata
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
    const { alt, caption, folder } = body;

    const media = await prisma.media.update({
      where: { id },
      data: { alt, caption, folder },
    });

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Delete media file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Get media to delete file
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Média non trouvé' },
        { status: 404 }
      );
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), 'public', media.url);
    try {
      await unlink(filePath);
    } catch {
      // File may not exist, continue with database deletion
    }

    // Delete from database
    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
