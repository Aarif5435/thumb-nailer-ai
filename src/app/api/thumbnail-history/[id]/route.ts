import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Delete the thumbnail history entry
    await prisma.thumbnailHistory.delete({
      where: {
        id: id,
        userId: userId // Ensure user can only delete their own entries
      }
    });
    
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting thumbnail history:', error);
    return NextResponse.json(
      { error: 'Failed to delete history entry' },
      { status: 500 }
    );
  }
}
