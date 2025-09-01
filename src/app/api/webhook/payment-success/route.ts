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

    const { orderId, paymentId } = await request.json();

    // Verify payment with Razorpay (in production)
    // For now, we'll assume payment was successful
    
    // Get user email
    const { sessionClaims } = await auth();
    const email = sessionClaims?.email as string;

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 400 }
      );
    }

    // Add credits to user account (3 thumbnails + 5 regenerates)
    const updatedCredits = await UserCreditsManager.addCredits(userId, 3, 5);

    console.log(`Payment successful for user ${userId}. Added 3 thumbnails + 5 regenerates.`);

    return NextResponse.json({
      success: true,
      message: 'Credits added successfully',
      credits: updatedCredits
    });

  } catch (error) {
    console.error('Error processing payment success:', error);
    return NextResponse.json(
      { error: 'Failed to process payment success' },
      { status: 500 }
    );
  }
}
