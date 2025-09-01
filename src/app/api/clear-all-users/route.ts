import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserCreditsManager } from '@/lib/user-credits';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user email from Clerk
    const { sessionClaims } = await auth();
    const email = sessionClaims?.email as string;

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 400 }
      );
    }

    // Only allow admin to clear all data
    if (email !== 'aarif.mohammad0909@gmail.com') {
      return NextResponse.json(
        { error: 'Only admin can clear all data' },
        { status: 403 }
      );
    }

    // Clear all user data
    UserCreditsManager.clearAllUsers();
    
    return NextResponse.json({
      success: true,
      message: 'All user data cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing all users:', error);
    return NextResponse.json(
      { error: 'Failed to clear user data' },
      { status: 500 }
    );
  }
}
