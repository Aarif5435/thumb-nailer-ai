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

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (!email || email !== 'aarif.mohammad0909@gmail.com') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId: targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID required' },
        { status: 400 }
      );
    }

    // Check if target user is admin
    const targetUser = await prisma.userCredits.findUnique({
      where: { userId: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (targetUser.isAdmin) {
      return NextResponse.json(
        { error: 'Cannot block admin users' },
        { status: 400 }
      );
    }

    // Block user by setting credits to 0
    const updatedUser = await prisma.userCredits.update({
      where: { userId: targetUserId },
      data: {
        thumbnailsRemaining: 0,
        regeneratesRemaining: 0,
        lastUpdated: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User blocked successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { error: 'Failed to block user' },
      { status: 500 }
    );
  }
}
