#!/usr/bin/env tsx

import { youtubeScraper } from '../src/lib/youtube-scraper';
import { vectorDB } from '../src/lib/qdrant';
import { config } from '../src/lib/config';

async function main() {
  console.log('🚀 Starting YouTube thumbnail scraping...\n');

  try {
    // Initialize vector database
    console.log('📊 Initializing vector database...');
    await vectorDB.initializeCollection();
    console.log('✅ Vector database initialized\n');

    // Check if we should scrape specific categories
    const categories = process.argv.slice(2);
    
    if (categories.length > 0) {
      console.log(`🎯 Scraping specific categories: ${categories.join(', ')}\n`);
      
      for (const category of categories) {
        if (config.scraping.categories.includes(category)) {
          console.log(`📹 Scraping ${category} thumbnails...`);
          const thumbnails = await youtubeScraper.scrapeThumbnails(
            category as any,
            config.scraping.maxVideosPerCategory
          );
          
          if (thumbnails.length > 0) {
            console.log(`💾 Adding ${thumbnails.length} ${category} thumbnails to database...`);
            await vectorDB.batchAddThumbnails(thumbnails);
            console.log(`✅ Successfully added ${category} thumbnails\n`);
          } else {
            console.log(`⚠️  No thumbnails found for ${category}\n`);
          }
        } else {
          console.log(`❌ Invalid category: ${category}. Available: ${config.scraping.categories.join(', ')}\n`);
        }
      }
    } else {
      console.log('📹 Scraping all categories...\n');
      
      // Scrape all categories
      const results = await youtubeScraper.scrapeAllCategories();
      
      // Add to vector database
      for (const [category, thumbnails] of Object.entries(results)) {
        if (Array.isArray(thumbnails) && thumbnails.length > 0) {
          console.log(`💾 Adding ${thumbnails.length} ${category} thumbnails to database...`);
          await vectorDB.batchAddThumbnails(thumbnails);
          console.log(`✅ Successfully added ${category} thumbnails`);
        }
      }
      
      const totalThumbnails = Object.values(results).reduce(
        (sum, thumbnails: any) => sum + (Array.isArray(thumbnails) ? thumbnails.length : 0),
        0
      );
      
      console.log(`\n🎉 Scraping completed! Total thumbnails: ${totalThumbnails}`);
    }

    // Show final database stats
    const info = await vectorDB.getCollectionInfo();
    console.log('\n📊 Final Database Stats:');
    console.log(`Collection: ${info?.name || 'N/A'}`);
    console.log(`Total Points: ${info?.points_count || 0}`);
    console.log(`Vector Size: ${info?.config?.params?.vectors?.size || 'N/A'}`);

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
