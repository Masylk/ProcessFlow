const { execSync } = require('child_process');
const fs = require('fs');
const pathModule = require('path');
const cryptoModule = require('crypto');

/**
 * Script to validate that schemas across environments are in sync
 * Usage: ts-node validate-schemas.ts
 */

// Function to get a schema hash for an environment
async function getSchemaHash(env: string) {
  const tempDir = pathModule.join(__dirname, '..', 'tmp');
  const schemaPath = pathModule.join(tempDir, `${env}-schema.prisma`);
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  // Pull the current schema from the database
  const command = `npm run prisma:${env} -- db pull --schema=${schemaPath}`;
  
  try {
    execSync(command, { stdio: 'inherit' });
    
    // Read the schema file and create a hash
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const hash = cryptoModule.createHash('md5').update(schemaContent).digest('hex');
    
    // Cleanup
    fs.unlinkSync(schemaPath);
    
    return hash;
  } catch (error) {
    console.error(`\x1b[31mFailed to get schema for ${env} environment\x1b[0m`);
    throw error;
  }
}

// Function to validate schemas across environments
async function validateSchemas() {
  console.log('\x1b[36m%s\x1b[0m', '🔍 Validating schemas across environments');
  
  try {
    // Get schema hashes
    const stagingHash = await getSchemaHash('staging');
    const productionHash = await getSchemaHash('production');
    
    console.log('\x1b[36m%s\x1b[0m', '\nSchema hashes:');
    console.log('\x1b[33m%s\x1b[0m', `Staging:    ${stagingHash}`);
    console.log('\x1b[33m%s\x1b[0m', `Production: ${productionHash}`);
    
    // Compare hashes
    if (stagingHash === productionHash) {
      console.log('\n\x1b[32m%s\x1b[0m', '✅ Schemas match across environments!');
    } else {
      console.log('\n\x1b[31m%s\x1b[0m', '❌ Schemas do not match!');
      console.log('\x1b[33m%s\x1b[0m', 'To synchronize schemas, run migrations on the out-of-sync environment.');
    }
  } catch (error) {
    console.error('\x1b[31mError during schema validation:\x1b[0m', error);
    process.exit(1);
  }
}

// Run the validation
validateSchemas().catch(error => {
  console.error('\x1b[31mError during schema validation:\x1b[0m', error);
  process.exit(1);
});

// Make this file a module
export {}; 