import { NextResponse } from "next/server";
import { auth, currentUser } from '@clerk/nextjs/server';
import { thumbnailGenerator } from "@/lib/thumbnail-generator";
import { UserAnswers } from "@/lib/types";
import { z } from "zod";
import { prisma } from '@/lib/prisma';
import { UserCreditsManager } from '@/lib/user-credits';

const GenerateRequestSchema = z.object({
  userAnswers: z.object({
    topic: z.string().min(1),
    targetAudience: z.string(),
    contentType: z.string(),
    emotion: z.string(),
    keyElements: z.string(),
    stylePreference: z.string(),
    additionalAnswers: z.record(z.string()).optional(),
  }),
  userImage: z.string().optional(), // Base64 encoded image
  variations: z.number().min(1).max(5).default(1),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    const body = await request.json();
    const { userAnswers, userImage, variations } = GenerateRequestSchema.parse(body);

    // Check if this is a regenerate session (don't deduct credits yet)
    const isRegenerateSession = await prisma.regenerateSession.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    // Only check and deduct credits if this is NOT a regenerate session
    if (email && !isRegenerateSession) {
      const creditResult = await UserCreditsManager.useThumbnail(userId);
      if (!creditResult.success) {
        return NextResponse.json(
          { error: creditResult.message || "Insufficient credits" },
          { status: 402 }
        );
      }
      console.log('Credits deducted successfully:', creditResult.credits);
    }

    // Generate thumbnail(s) using YouTube API for references
    if (variations === 1) {
      const thumbnail = await thumbnailGenerator.generateThumbnail(
        userAnswers,
        userImage
      );

      if (!thumbnail) {
        return NextResponse.json(
          { error: "Failed to generate thumbnail" },
          { status: 500 }
        );
      }

      // Save to thumbnail history
      if (email) {
        try {
          console.log('Saving thumbnail history for user:', userId, 'email:', email);
          console.log('Image URL length:', thumbnail.imageUrl?.length);
          console.log('Image URL starts with data:', thumbnail.imageUrl?.startsWith('data:'));
          console.log('Image URL first 100 chars:', thumbnail.imageUrl?.substring(0, 100));
          
          const savedThumbnail = await prisma.thumbnailHistory.create({
            data: {
              userId,
              topic: userAnswers.topic,
              prompt: JSON.stringify(userAnswers),
              imageUrl: thumbnail.imageUrl,
              ctrScore: thumbnail.metadata.ctrOptimization?.score || null,
              ctrAnalysis: thumbnail.metadata.ctrOptimization?.insights?.join(', ') || null,
            }
          });
          console.log('Successfully saved thumbnail:', savedThumbnail.id);
          console.log('Saved image URL length:', savedThumbnail.imageUrl?.length);

          // If this was a regenerate session, deduct regenerate credits now
          if (isRegenerateSession) {
            const regenerateResult = await UserCreditsManager.useRegenerate(userId);
            if (regenerateResult.success) {
              console.log('Regenerate credits deducted successfully:', regenerateResult.credits);
              // Clear the regenerate session
              await prisma.regenerateSession.delete({
                where: { id: isRegenerateSession.id }
              });
            } else {
              console.error('Failed to deduct regenerate credits:', regenerateResult.message);
            }
          }
        } catch (error) {
          console.error('Error saving thumbnail history:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
        }
      } else {
        console.log('No email found, skipping thumbnail history save');
      }

      return NextResponse.json({
        thumbnail,
        similarThumbnails: [], // No longer using Qdrant
        enhancedQuery: userAnswers.topic,
      });
    } else {
      const thumbnails = await thumbnailGenerator.generateMultipleVariations(
        userAnswers,
        variations,
        userImage
      );

      if (thumbnails.length === 0) {
        return NextResponse.json(
          { error: "Failed to generate any thumbnails" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        thumbnails,
        similarThumbnails: [], // No longer using Qdrant
        enhancedQuery: userAnswers.topic,
      });
    }
  } catch (error) {
    console.error("Error in thumbnail generation:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Generation error:', errorMessage);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}