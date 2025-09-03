import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { UserCreditsManager } from '@/lib/user-credits';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  return handlePaymentVerification(request);
}

export async function GET(request: NextRequest) {
  return handlePaymentVerification(request);
}

async function handlePaymentVerification(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email not found' },
        { status: 400 }
      );
    }

    // Handle both POST (JSON) and GET (URL params) requests
    let razorpay_payment_id, razorpay_order_id, razorpay_signature;
    
    if (request.method === 'GET') {
      const url = new URL(request.url);
      razorpay_payment_id = url.searchParams.get('razorpay_payment_id');
      razorpay_order_id = url.searchParams.get('razorpay_order_id');
      razorpay_signature = url.searchParams.get('razorpay_signature');
    } else {
      const body = await request.json();
      razorpay_payment_id = body.razorpay_payment_id;
      razorpay_order_id = body.razorpay_order_id;
      razorpay_signature = body.razorpay_signature;
    }

    // Check if payment data is present
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Payment data missing' },
        { status: 400 }
      );
    }

    // Verify the payment signature
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Razorpay configuration missing' },
        { status: 500 }
      );
    }

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Payment is verified, add credits to user
    const updatedCredits = await UserCreditsManager.addCredits(userId, 3, 5);

    return NextResponse.json({
      success: true,
      message: 'Payment verified and credits added successfully',
      credits: updatedCredits
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
