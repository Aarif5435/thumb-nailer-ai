import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay only when environment variables are available
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR' } = await request.json();

    // Create order data for Razorpay
    const orderData = {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: `order_${Date.now()}`,
      notes: {
        description: 'Thumbnail AI Service - 3 thumbnails + 5 regenerates'
      }
    };

    // Create real Razorpay order
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(orderData);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: orderData.amount,
      currency: orderData.currency
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
