import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resultId } = await params;

    // Find the thumbnail result by ID
    const thumbnailHistory = await prisma.thumbnailHistory.findUnique({
      where: { id: resultId },
    });

    if (!thumbnailHistory) {
      return NextResponse.json(
        { success: false, error: 'Result not found' },
        { status: 404 }
      );
    }

    // Parse the stored data
    const result: any = {
      id: thumbnailHistory.id,
      thumbnail: {
        imageUrl: thumbnailHistory.imageUrl,
        prompt: thumbnailHistory.prompt,
        ctrScore: thumbnailHistory.ctrScore,
        createdAt: thumbnailHistory.createdAt,
      },
      similarThumbnails: [],
      enhancedQuery: thumbnailHistory.topic,
      userAnswers: {
        topic: thumbnailHistory.topic,
        targetAudience: 'general',
        contentType: 'video',
        emotion: 'excited',
        keyElements: 'engaging visuals',
        stylePreference: 'modern',
        additionalAnswers: {}
      },
      userImage: null,
      topic: thumbnailHistory.topic,
    };

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error fetching result:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch result' },
      { status: 500 }
    );
  }
}
