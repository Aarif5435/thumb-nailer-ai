import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { UserCreditsManager } from '@/lib/user-credits';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user email from Clerk using currentUser
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    
    console.log('User credits - currentUser:', JSON.stringify(user, null, 2));
    console.log('User credits - extracted email:', email);

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found', user },
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
