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

    // Get admin statistics
    const [
      totalUsers,
      totalThumbnails,
      activeUsers,
      blockedUsers
    ] = await Promise.all([
      prisma.userCredits.count(),
      prisma.thumbnailHistory.count(),
      prisma.userCredits.count({
        where: {
          OR: [
            { isAdmin: true },
            { thumbnailsRemaining: { gt: 0 } },
            { regeneratesRemaining: { gt: 0 } }
          ]
        }
      }),
      prisma.userCredits.count({
        where: {
          isAdmin: false,
          thumbnailsRemaining: 0,
          regeneratesRemaining: 0
        }
      })
    ]);

    const stats = {
      totalUsers,
      totalThumbnails,
      activeUsers,
      blockedUsers,
      totalCreditsUsed: totalThumbnails // Simplified for now
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
