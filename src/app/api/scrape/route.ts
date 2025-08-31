import { NextResponse } from "next/server";
import { youtubeScraper } from "@/lib/youtube-scraper";
import { vectorDB } from "@/lib/qdrant";
import { z } from "zod";

const ScrapeRequestSchema = z.object({
  categories: z.array(z.string()).optional(),
  maxPerCategory: z.number().min(1).max(200).default(50),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categories, maxPerCategory } = ScrapeRequestSchema.parse(body);


    // Initialize database if needed
    await vectorDB.initializeCollection();

    let results: Record<string, any> = {};

    if (categories && categories.length > 0) {
      // Scrape specific categories
      for (const category of categories) {
        const thumbnails = await youtubeScraper.scrapeThumbnails(
          category as any,
          maxPerCategory
        );
        results[category] = thumbnails;

        // Add to vector database
        if (thumbnails.length > 0) {
          await vectorDB.batchAddThumbnails(thumbnails);
        }
      }
    } else {
      // Scrape all categories
      results = await youtubeScraper.scrapeAllCategories();

      // Add all to vector database
      for (const [category, thumbnails] of Object.entries(results)) {
        if (Array.isArray(thumbnails) && thumbnails.length > 0) {
          await vectorDB.batchAddThumbnails(thumbnails);
        }
      }
    }

    const totalThumbnails = Object.values(results).reduce(
      (sum, thumbnails: any) => sum + (Array.isArray(thumbnails) ? thumbnails.length : 0),
      0
    );

    return NextResponse.json({
      message: "Scraping completed successfully",
      totalThumbnails,
      results: Object.fromEntries(
        Object.entries(results).map(([category, thumbnails]: [string, any]) => [
          category,
          Array.isArray(thumbnails) ? thumbnails.length : 0,
        ])
      ),
    });
  } catch (error) {
    console.error("Error during scraping:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Scraping failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "YouTube Thumbnail Scraper API",
    endpoints: {
      POST: "Start scraping thumbnails",
      body: {
        categories: "Array of categories (optional)",
        maxPerCategory: "Max thumbnails per category (default: 50)",
      },
    },
  });
}
