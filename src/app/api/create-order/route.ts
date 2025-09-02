import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    console.log('Creating Razorpay order...');
    console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set');
    console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set');
    
    const { amount, currency = 'INR' } = await request.json();
    console.log('Order amount:', amount, 'currency:', currency);

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
    const order = await razorpay.orders.create(orderData);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: orderData.amount,
      currency: orderData.currency
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
