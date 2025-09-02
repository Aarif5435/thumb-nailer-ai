import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ExportData {
  userCredits: any[];
  thumbnailHistory: any[];
  regenerateSessions: any[];
  exportedAt: string;
}

async function importData() {
  try {
    console.log('🔄 Importing data to PostgreSQL...');

    // Read export file
    const exportPath = path.join(process.cwd(), 'data-export.json');
    if (!fs.existsSync(exportPath)) {
      console.error('❌ Export file not found. Please run export-data.ts first.');
      return;
    }

    const exportData: ExportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    console.log(`📦 Importing data exported at: ${exportData.exportedAt}`);

    // Import UserCredits
    console.log(`📊 Importing ${exportData.userCredits.length} user credits...`);
    for (const userCredit of exportData.userCredits) {
      await prisma.userCredits.upsert({
        where: { userId: userCredit.userId },
        update: {
          email: userCredit.email,
          thumbnailsRemaining: userCredit.thumbnailsRemaining,
          regeneratesRemaining: userCredit.regeneratesRemaining,
          isAdmin: userCredit.isAdmin,
          hasUsedFreePreview: userCredit.hasUsedFreePreview,
          lastUpdated: new Date(userCredit.lastUpdated),
          updatedAt: new Date()
        },
        create: {
          userId: userCredit.userId,
          email: userCredit.email,
          thumbnailsRemaining: userCredit.thumbnailsRemaining,
          regeneratesRemaining: userCredit.regeneratesRemaining,
          isAdmin: userCredit.isAdmin,
          hasUsedFreePreview: userCredit.hasUsedFreePreview,
          lastUpdated: new Date(userCredit.lastUpdated),
          createdAt: new Date(userCredit.createdAt),
          updatedAt: new Date(userCredit.updatedAt)
        }
      });
    }

    // Import ThumbnailHistory
    console.log(`🖼️ Importing ${exportData.thumbnailHistory.length} thumbnail history entries...`);
    for (const thumbnail of exportData.thumbnailHistory) {
      await prisma.thumbnailHistory.upsert({
        where: { id: thumbnail.id },
        update: {
          topic: thumbnail.topic,
          prompt: thumbnail.prompt,
          imageUrl: thumbnail.imageUrl,
          ctrScore: thumbnail.ctrScore,
          ctrAnalysis: thumbnail.ctrAnalysis,
          updatedAt: new Date()
        },
        create: {
          id: thumbnail.id,
          userId: thumbnail.userId,
          topic: thumbnail.topic,
          prompt: thumbnail.prompt,
          imageUrl: thumbnail.imageUrl,
          ctrScore: thumbnail.ctrScore,
          ctrAnalysis: thumbnail.ctrAnalysis,
          createdAt: new Date(thumbnail.createdAt),
          updatedAt: new Date(thumbnail.updatedAt)
        }
      });
    }

    // Import RegenerateSessions (only active ones)
    const activeSessions = exportData.regenerateSessions.filter(
      session => new Date(session.expiresAt) > new Date()
    );
    console.log(`🔄 Importing ${activeSessions.length} active regenerate sessions...`);
    for (const session of activeSessions) {
      await prisma.regenerateSession.upsert({
        where: { id: session.id },
        update: {
          topic: session.topic,
          expiresAt: new Date(session.expiresAt)
        },
        create: {
          id: session.id,
          userId: session.userId,
          topic: session.topic,
          createdAt: new Date(session.createdAt),
          expiresAt: new Date(session.expiresAt)
        }
      });
    }

    console.log('✅ Data import completed successfully!');
    console.log(`📊 Import summary:`);
    console.log(`   - User Credits: ${exportData.userCredits.length}`);
    console.log(`   - Thumbnail History: ${exportData.thumbnailHistory.length}`);
    console.log(`   - Active Regenerate Sessions: ${activeSessions.length}`);

  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
