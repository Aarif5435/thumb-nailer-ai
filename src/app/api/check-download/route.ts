import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { UserCreditsManager } from '@/lib/user-credits';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user email from Clerk
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email not found' },
        { status: 400 }
      );
    }

    // Force create fresh admin user for admin email
    const credits = email === 'aarif.mohammad0909@gmail.com' 
      ? await UserCreditsManager.forceCreateAdmin(userId, email)
      : await UserCreditsManager.getUserCredits(userId, email);
    
    const result = await UserCreditsManager.canDownload(userId);

    return NextResponse.json({
      success: true,
      canDownload: result.canDownload,
      message: result.message,
      credits: result.credits
    });
  } catch (error) {
    console.error('Error checking download permission:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
