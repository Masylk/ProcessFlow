const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script to synchronize schema changes between environments
 * Usage: ts-node sync-schema.ts
 * 
 * This script helps manage schema changes in a consistent way:
 * 1. First apply changes to staging
 * 2. Then apply the same changes to production
 */

// Get the migration name from arguments or prompt for it
const migrationName = process.argv[2];
if (!migrationName) {
  console.error('\x1b[31mError: Migration name required.\x1b[0m');
  console.log('Usage: ts-node sync-schema.ts [migration_name]');
  console.log('Example: ts-node sync-schema.ts add_user_fields');
  process.exit(1);
}

// Sanitize migration name (only allow lowercase letters, numbers, and underscores)
const sanitizedName = migrationName.replace(/[^a-z0-9_]/g, '_').toLowerCase();

// Function to run a command and return its output
function runCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8' });
  } catch (error: unknown) {
    console.error(`\x1b[31mCommand failed: ${command}\x1b[0m`);
    
    // Fix the error access with proper type checking
    if (error && typeof error === 'object') {
      console.error(
        'stdout' in error ? (error as { stdout: string }).stdout : 
        'message' in error ? (error as { message: string }).message : 
        'Unknown error'
      );
    } else {
      console.error('Unknown error occurred');
    }
    
    process.exit(1);
  }
}

// Update schema process
async function syncSchema() {
  console.log('\x1b[36m%s\x1b[0m', '🔄 Starting schema synchronization process');
  
  // Step 1: Create migration in staging
  console.log('\x1b[36m%s\x1b[0m', '\n📝 Step 1: Creating migration in staging environment');
  const stagingMigrateCommand = `npm run migrate:staging -- --name ${sanitizedName}`;
  console.log('\x1b[33m%s\x1b[0m', `Running: ${stagingMigrateCommand}`);
  runCommand(stagingMigrateCommand);
  console.log('\x1b[32m%s\x1b[0m', '✅ Migration created in staging environment');
  
  // Step 2: Verify staging migration was successful
  console.log('\x1b[36m%s\x1b[0m', '\n📋 Step 2: Verifying staging database');
  const verifyCommand = `npm run prisma:staging -- validate`;
  console.log('\x1b[33m%s\x1b[0m', `Running: ${verifyCommand}`);
  runCommand(verifyCommand);
  console.log('\x1b[32m%s\x1b[0m', '✅ Staging database verified');
  
  // Step 3: Deploy to production (with confirmation)
  console.log('\x1b[36m%s\x1b[0m', '\n🚀 Step 3: Ready to deploy to production');
  console.log('\x1b[33m%s\x1b[0m', 'WARNING: This will apply the migration to the production database.');
  
  // In a real implementation, you might want to add a confirmation prompt here
  console.log('\x1b[36m%s\x1b[0m', '\nTo apply this migration to production, run:');
  console.log('\x1b[33m%s\x1b[0m', `npm run migrate:prod`);
  
  console.log('\n\x1b[32m%s\x1b[0m', '✅ Schema synchronization process completed!');
}

// Run the sync process
syncSchema().catch(error => {
  console.error('\x1b[31mError during schema synchronization:\x1b[0m', error);
  process.exit(1);
});

// Make this file a module
export {}; 