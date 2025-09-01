import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserCreditsManager } from '@/lib/user-credits';

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const email = sessionClaims?.email as string;

    // Force create fresh admin user for admin email
    const credits = email === 'aarif.mohammad0909@gmail.com' 
      ? await UserCreditsManager.forceCreateAdmin(userId, email)
      : await UserCreditsManager.getUserCredits(userId, email);
    
    const result = await UserCreditsManager.canGenerateFreePreview(userId);

    return NextResponse.json({
      success: true,
      canGenerate:  email === 'aarif.mohammad0909@gmail.com'? true : result.canGenerate,
      message: result.message,
      credits: result.credits
    });
  } catch (error) {
    console.error('Error checking free preview:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
