#!/usr/bin/env tsx

import { youtubeScraper } from '../src/lib/youtube-scraper';
import { vectorDB } from '../src/lib/qdrant';
import { config } from '../src/lib/config';

async function main() {
   ('🚀 Starting YouTube thumbnail scraping...\n');

  try {
    // Initialize vector database
     ('📊 Initializing vector database...');
    await vectorDB.initializeCollection();
     ('✅ Vector database initialized\n');

    // Check if we should scrape specific categories
    const categories = process.argv.slice(2);
    
    if (categories.length > 0) {
       (`🎯 Scraping specific categories: ${categories.join(', ')}\n`);
      
      for (const category of categories) {
        if (config.scraping.categories.includes(category as any)) {
          const thumbnails = await youtubeScraper.scrapeThumbnails(
            category as any,
            config.scraping.maxVideosPerCategory
          );
          
          if (thumbnails.length > 0) {
             (`💾 Adding ${thumbnails.length} ${category} thumbnails to database...`);
            await vectorDB.batchAddThumbnails(thumbnails);
             (`✅ Successfully added ${category} thumbnails\n`);
          } else {
             (`⚠️  No thumbnails found for ${category}\n`);
          }
        } else {
           (`❌ Invalid category: ${category}. Available: ${config.scraping.categories.join(', ')}\n`);
        }
      }
    } else {
       ('📹 Scraping all categories...\n');
      
      // Scrape all categories
      const results = await youtubeScraper.scrapeAllCategories();
      
      // Add to vector database
      for (const [category, thumbnails] of Object.entries(results)) {
        if (Array.isArray(thumbnails) && thumbnails.length > 0) {
           (`💾 Adding ${thumbnails.length} ${category} thumbnails to database...`);
          await vectorDB.batchAddThumbnails(thumbnails);
           (`✅ Successfully added ${category} thumbnails`);
        }
      }
      
      const totalThumbnails = Object.values(results).reduce(
        (sum, thumbnails: any) => sum + (Array.isArray(thumbnails) ? thumbnails.length : 0),
        0
      );
      
       (`\n🎉 Scraping completed! Total thumbnails: ${totalThumbnails}`);
    }

    // Show final database stats
    const info = await vectorDB.getCollectionInfo();
  
  } catch (error) {
    console.error('❌ Error during scraping:', error);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

export { main };
