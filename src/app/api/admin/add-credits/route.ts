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

    const adminUser = await currentUser();
    const email = adminUser?.emailAddresses?.[0]?.emailAddress;

    if (!email || email !== 'aarif.mohammad0909@gmail.com') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId: targetUserId, thumbnails, regenerates } = body;

    console.log('Admin add-credits request:', { targetUserId, thumbnails, regenerates });

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID required' },
        { status: 400 }
      );
    }

    if ((!thumbnails || thumbnails === 0) && (!regenerates || regenerates === 0)) {
      return NextResponse.json(
        { error: 'At least one credit type must be specified' },
        { status: 400 }
      );
    }

    // Get current user credits
    const targetUserCredits = await prisma.userCredits.findUnique({
      where: { userId: targetUserId }
    });

    console.log('Found target user credits:', targetUserCredits);

    if (!targetUserCredits) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user credits (allow negative values for reduction)
    const newThumbnails = Math.max(0, targetUserCredits.thumbnailsRemaining + (thumbnails || 0));
    const newRegenerates = Math.max(0, targetUserCredits.regeneratesRemaining + (regenerates || 0));
    
    console.log('Updating credits:', { 
      current: { thumbnails: targetUserCredits.thumbnailsRemaining, regenerates: targetUserCredits.regeneratesRemaining },
      adding: { thumbnails: thumbnails || 0, regenerates: regenerates || 0 },
      new: { thumbnails: newThumbnails, regenerates: newRegenerates }
    });

    const updatedUser = await prisma.userCredits.update({
      where: { userId: targetUserId },
      data: {
        thumbnailsRemaining: newThumbnails,
        regeneratesRemaining: newRegenerates,
        lastUpdated: new Date()
      }
    });

    console.log('Successfully updated user credits:', updatedUser);

    return NextResponse.json({
      success: true,
      message: 'Credits updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error adding credits:', error);
    return NextResponse.json(
      { error: 'Failed to update credits' },
      { status: 500 }
    );
  }
}
