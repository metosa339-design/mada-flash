// Script to delete all necrology articles from the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Same keywords as in sync-rss route
const BLOCKED_KEYWORDS = [
  // Français
  'nécrologie', 'necrologie', 'décès', 'deces', 'décédé', 'decede',
  'mort de', 'est mort', 'est décédé', 'est décédée', 'a péri',
  'obsèques', 'obseques', 'funérailles', 'funerailles',
  'enterrement', 'inhumation', 'hommage posthume', 'disparition de',
  'nous quitte', 'a rendu l\'âme', 'dernier adieu', 'repose en paix',
  'r.i.p', 'rip', 'in memoriam', 'en mémoire de', 'condoléances',
  'deuil national', 'deuil', 'veillée funèbre', 'cercueil',
  // Malgache
  'maty', 'nodimandry', 'niala aina', 'lasa nodimandry', 'namoy ny ainy',
  'fandevenana', 'fasana', 'fitsaboana ny maty', 'faty', 'fahafatesana',
  'maty ny', 'namana maty', 'nalahelo', 'fisaorana faty',
  'famangiana faty', 'filazan-doza', 'fahoriana', 'alahelo'
];

function shouldBlockArticle(title, summary) {
  const text = `${title} ${summary || ''}`.toLowerCase();
  return BLOCKED_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
}

async function cleanupNecrologyArticles() {
  console.log('🧹 Starting necrology cleanup...\n');

  try {
    // Get all articles
    const allArticles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        summary: true,
        status: true,
        publishedAt: true
      }
    });

    console.log(`📊 Total articles in database: ${allArticles.length}\n`);

    // Find necrology articles
    const necrologyArticles = allArticles.filter(article =>
      shouldBlockArticle(article.title, article.summary)
    );

    if (necrologyArticles.length === 0) {
      console.log('✅ No necrology articles found. Database is clean!');
      return;
    }

    console.log(`🔍 Found ${necrologyArticles.length} necrology article(s) to delete:\n`);

    necrologyArticles.forEach((article, index) => {
      console.log(`  ${index + 1}. "${article.title.substring(0, 60)}..."`);
    });

    console.log('\n🗑️  Deleting necrology articles...\n');

    // Delete them
    const idsToDelete = necrologyArticles.map(a => a.id);

    const result = await prisma.article.deleteMany({
      where: {
        id: { in: idsToDelete }
      }
    });

    console.log(`✅ Successfully deleted ${result.count} necrology article(s)`);

    // Show remaining count
    const remainingCount = await prisma.article.count();
    console.log(`📊 Remaining articles: ${remainingCount}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupNecrologyArticles();
