import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { topic, originalThumbnailId, userImage } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Create regenerate session (expires in 1 hour)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const session = await prisma.regenerateSession.create({
      data: {
        userId,
        topic,
        originalThumbnailId: originalThumbnailId || null,
        userImage: userImage || null,
        expiresAt
      }
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error creating regenerate session:', error);
    return NextResponse.json(
      { error: 'Failed to create regenerate session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get active regenerate session for user
    const session = await prisma.regenerateSession.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'No active regenerate session'
      });
    }

    return NextResponse.json({
      success: true,
      topic: session.topic,
      sessionId: session.id,
      userImage: session.userImage
    });

  } catch (error) {
    console.error('Error getting regenerate session:', error);
    return NextResponse.json(
      { error: 'Failed to get regenerate session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (sessionId) {
      // Delete specific session
      try {
        await prisma.regenerateSession.delete({
          where: { id: sessionId }
        });
      } catch (error: any) {
        // If session doesn't exist, that's fine - it might have been already deleted
        if (error.code !== 'P2025') {
          throw error;
        }
      }
    } else {
      // Delete all sessions for user
      await prisma.regenerateSession.deleteMany({
        where: { userId }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Regenerate session cleared'
    });

  } catch (error) {
    console.error('Error deleting regenerate session:', error);
    return NextResponse.json(
      { error: 'Failed to delete regenerate session' },
      { status: 500 }
    );
  }
}
