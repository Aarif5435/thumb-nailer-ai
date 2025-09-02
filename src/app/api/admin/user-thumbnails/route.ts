import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (!email || email !== 'aarif.mohammad0909@gmail.com') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get thumbnails for the specified user
    console.log('Fetching thumbnails for user:', targetUserId);
    const thumbnails = await prisma.thumbnailHistory.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Found thumbnails:', thumbnails.length, 'for user:', targetUserId);

    return NextResponse.json(thumbnails);

  } catch (error) {
    console.error('Error fetching user thumbnails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user thumbnails' },
      { status: 500 }
    );
  }
}
