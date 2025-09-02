import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const history = await prisma.thumbnailHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Fetched thumbnail history count:', history.length);
    if (history.length > 0) {
      console.log('First thumbnail imageUrl length:', history[0].imageUrl?.length);
      console.log('First thumbnail imageUrl starts with data:', history[0].imageUrl?.startsWith('data:'));
      console.log('First thumbnail imageUrl first 100 chars:', history[0].imageUrl?.substring(0, 100));
    }
    
    return NextResponse.json(history);

  } catch (error) {
    console.error('Error fetching thumbnail history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { topic, prompt, imageUrl, ctrScore, ctrAnalysis } = body;

    const history = await prisma.thumbnailHistory.create({
      data: {
        userId,
        topic,
        prompt,
        imageUrl,
        ctrScore,
        ctrAnalysis,
      }
    });
    
    return NextResponse.json(history);

  } catch (error) {
    console.error('Error creating thumbnail history:', error);
    return NextResponse.json(
      { error: 'Failed to create history entry' },
      { status: 500 }
    );
  }
}
