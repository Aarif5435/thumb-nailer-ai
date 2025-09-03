import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { UserCreditsManager } from '@/lib/user-credits';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { isAdmin: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user email from Clerk
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { isAdmin: false, error: 'Email not found' },
        { status: 400 }
      );
    }

    // Force create fresh admin user for admin email
    const credits = email === 'aarif.mohammad0909@gmail.com' 
      ? await UserCreditsManager.forceCreateAdmin(userId, email)
      : await UserCreditsManager.getUserCredits(userId, email);
    
    return NextResponse.json({
      isAdmin: credits.isAdmin,
      email: email,
      credits: credits
    });

  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}
