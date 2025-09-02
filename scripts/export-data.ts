import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db' // Your local SQLite database
    }
  }
});

async function exportData() {
  try {
    console.log('🔄 Exporting data from SQLite...');

    // Export UserCredits
    const userCredits = await prisma.userCredits.findMany();
    console.log(`📊 Found ${userCredits.length} user credits`);

    // Export ThumbnailHistory
    const thumbnailHistory = await prisma.thumbnailHistory.findMany();
    console.log(`🖼️ Found ${thumbnailHistory.length} thumbnail history entries`);

    // Export RegenerateSessions
    const regenerateSessions = await prisma.regenerateSession.findMany();
    console.log(`🔄 Found ${regenerateSessions.length} regenerate sessions`);

    // Create export data
    const exportData = {
      userCredits,
      thumbnailHistory,
      regenerateSessions,
      exportedAt: new Date().toISOString()
    };

    // Write to file
    const exportPath = path.join(process.cwd(), 'data-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

    console.log(`✅ Data exported to: ${exportPath}`);
    console.log(`📦 Export summary:`);
    console.log(`   - User Credits: ${userCredits.length}`);
    console.log(`   - Thumbnail History: ${thumbnailHistory.length}`);
    console.log(`   - Regenerate Sessions: ${regenerateSessions.length}`);

  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
