#!/usr/bin/env tsx

import { youtubeScraper } from '../src/lib/youtube-scraper';
import { vectorDB } from '../src/lib/qdrant';
import { config } from '../src/lib/config';

async function main() {

  try {
    // Initialize vector database
    await vectorDB.initializeCollection();

    // Check if we should scrape specific categories
    const categories = process.argv.slice(2);
    
    if (categories.length > 0) {
      
      for (const category of categories) {
        if (config.scraping.categories.includes(category as any)) {
          const thumbnails = await youtubeScraper.scrapeThumbnails(
            category as any,
            config.scraping.maxVideosPerCategory
          );
          
          if (thumbnails.length > 0) {
            await vectorDB.batchAddThumbnails(thumbnails);
          } else {
          }
        } else {
        }
      }
    } else {
      
      // Scrape all categories
      const results = await youtubeScraper.scrapeAllCategories();
      
      // Add to vector database
      for (const [category, thumbnails] of Object.entries(results)) {
        if (Array.isArray(thumbnails) && thumbnails.length > 0) {
          await vectorDB.batchAddThumbnails(thumbnails);
        }
      }
      
      const totalThumbnails = Object.values(results).reduce(
        (sum, thumbnails: any) => sum + (Array.isArray(thumbnails) ? thumbnails.length : 0),
        0
      );
      
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
