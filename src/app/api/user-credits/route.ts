import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserCreditsManager } from '@/lib/user-credits';

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user email from Clerk
    const email = sessionClaims?.email as string;
    
    console.log('User credits - sessionClaims:', JSON.stringify(sessionClaims, null, 2));
    console.log('User credits - extracted email:', email);

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found', sessionClaims },
        { status: 400 }
      );
    }

    // Force create fresh admin user for admin email
    const credits = email === 'aarif.mohammad0909@gmail.com' 
      ? await UserCreditsManager.forceCreateAdmin(userId, email)
      : await UserCreditsManager.getUserCredits(userId, email);
    
    return NextResponse.json({
      success: true,
      credits
    });

  } catch (error) {
    console.error('Error getting user credits:', error);
    return NextResponse.json(
      { error: 'Failed to get user credits' },
      { status: 500 }
    );
  }
}
