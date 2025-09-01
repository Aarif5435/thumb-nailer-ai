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

    const { action } = await request.json(); // 'thumbnail' or 'regenerate'

    if (!action || !['thumbnail', 'regenerate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "thumbnail" or "regenerate"' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'thumbnail') {
      result = await UserCreditsManager.useThumbnail(userId);
    } else {
      result = await UserCreditsManager.useRegenerate(userId);
    }

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message,
          credits: result.credits 
        },
        { status: 402 } // Payment Required
      );
    }

    return NextResponse.json({
      success: true,
      credits: result.credits
    });

  } catch (error) {
    console.error('Error using credits:', error);
    return NextResponse.json(
      { error: 'Failed to use credits' },
      { status: 500 }
    );
  }
}
