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

    const email = sessionClaims?.email as string;
    
    console.log('Clerk sessionClaims:', JSON.stringify(sessionClaims, null, 2));
    console.log('Extracted email:', email);

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found', sessionClaims },
        { status: 400 }
      );
    }

    // Force create fresh admin user (clears all data and creates new)
    const credits = await UserCreditsManager.forceCreateAdmin(userId, email);
    const isAdmin = credits.isAdmin;
    
    return NextResponse.json({
      success: true,
      userId,
      email,
      isAdmin,
      credits,
      adminEmail: 'aarif.mohammad0909@gmail.com'
    });

  } catch (error) {
    console.error('Error testing admin:', error);
    return NextResponse.json(
      { error: 'Failed to test admin' },
      { status: 500 }
    );
  }
}
