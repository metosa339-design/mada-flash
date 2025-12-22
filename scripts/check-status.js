const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    // Count articles by status
    const stats = await prisma.article.groupBy({
      by: ['status'],
      _count: true
    });
    console.log('=== Stats by status ===');
    console.log(JSON.stringify(stats, null, 2));

    // Count published articles that need enhancement
    const needEnhancement = await prisma.article.count({
      where: {
        status: 'published',
        isAiEnhanced: false
      }
    });
    console.log(`\nPublished articles needing enhancement: ${needEnhancement}`);

  } finally {
    await prisma.$disconnect();
  }
}

check().catch(console.error);
