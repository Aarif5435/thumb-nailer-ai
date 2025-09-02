import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
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
        { error: 'Cannot delete admin users' },
        { status: 400 }
      );
    }

    // Delete user and all associated data
    await prisma.$transaction([
      // Delete thumbnail history first (due to foreign key constraint)
      prisma.thumbnailHistory.deleteMany({
        where: { userId: targetUserId }
      }),
      // Delete user credits
      prisma.userCredits.delete({
        where: { userId: targetUserId }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
