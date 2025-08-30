import { NextResponse } from "next/server";
import { thumbnailGenerator } from "@/lib/thumbnail-generator";
import { UserAnswers } from "@/lib/types";
import { z } from "zod";

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
    const body = await request.json();
    const { userAnswers, userImage, variations } = GenerateRequestSchema.parse(body);

    console.log('Generating thumbnail for topic:', userAnswers.topic);

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