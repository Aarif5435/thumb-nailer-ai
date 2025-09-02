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

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    
    console.log('Clerk currentUser:', JSON.stringify(user, null, 2));
    console.log('Extracted email:', email);

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found', user },
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
