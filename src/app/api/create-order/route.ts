import { NextRequest, NextResponse } from 'next/server';

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

    // For now, return a mock order ID
    // In production, you would make a call to Razorpay API here
    const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      orderId: mockOrderId,
      amount: orderData.amount,
      currency: orderData.currency
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
