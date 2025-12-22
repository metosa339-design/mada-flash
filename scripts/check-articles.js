const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    // Count articles by isAiEnhanced status
    const stats = await prisma.article.groupBy({
      by: ['isAiEnhanced'],
      _count: true
    });
    console.log('=== Stats isAiEnhanced ===');
    console.log(JSON.stringify(stats, null, 2));

    // Get total count
    const total = await prisma.article.count();
    console.log(`\nTotal articles: ${total}`);

    // Sample enhanced article
    const enhanced = await prisma.article.findFirst({
      where: { isAiEnhanced: true },
      select: { title: true, content: true, isAiEnhanced: true }
    });

    if (enhanced) {
      console.log('\n=== Sample ENHANCED article ===');
      console.log('Title:', enhanced.title);
      console.log('Content preview:', enhanced.content.substring(0, 800));
    } else {
      console.log('\n!!! NO ENHANCED ARTICLES FOUND !!!');
    }

    // Sample non-enhanced article
    const notEnhanced = await prisma.article.findFirst({
      where: { isAiEnhanced: false },
      select: { title: true, content: true, isAiEnhanced: true }
    });

    if (notEnhanced) {
      console.log('\n=== Sample NON-ENHANCED article ===');
      console.log('Title:', notEnhanced.title);
      console.log('Content preview:', notEnhanced.content.substring(0, 800));
    }

  } finally {
    await prisma.$disconnect();
  }
}

check().catch(console.error);
