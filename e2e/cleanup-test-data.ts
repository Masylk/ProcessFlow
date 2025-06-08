import { TestDataSeeder } from './seed-test-data';

async function cleanup() {
  console.log('🧹 Starting test data cleanup...');
  
  const seeder = new TestDataSeeder();
  
  try {
    await seeder.cleanupTestData();
    console.log('✅ Test data cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await seeder.close();
  }
}

// Run cleanup
cleanup();