const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Helper script to run Prisma commands with the correct environment
 * Usage: ts-node prisma-env.ts [environment] [command] [...args]
 * Example: ts-node prisma-env.ts staging migrate dev --name add_user_fields
 */

// Get arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('\x1b[31mError: Insufficient arguments.\x1b[0m');
  console.log('Usage: ts-node prisma-env.ts [environment] [command] [...args]');
  console.log('Example: ts-node prisma-env.ts staging migrate dev --name add_user_fields');
  process.exit(1);
}

const env = args[0];
const prismaCommand = args[1];
const additionalArgs = args.slice(2).join(' ');

// Define valid environments and commands
const validEnvs: string[] = ['production', 'staging'];
const validCommands: Record<string, boolean> = {
  'migrate': true,    // For migrate dev/deploy/reset
  'db': true,         // For db push/pull
  'studio': true,     // For studio
  'generate': true,   // For generate
  'format': true,     // For format
  'validate': true,   // For validate
  'introspect': true  // For introspect
};

// Validate environment
if (!validEnvs.includes(env)) {
  console.error(`\x1b[31mError: Invalid environment "${env}".\x1b[0m`);
  console.log(`Valid environments: ${validEnvs.join(', ')}`);
  process.exit(1);
}

// Validate primary command
const primaryCommand = prismaCommand.split(' ')[0];
if (!validCommands[primaryCommand]) {
  console.error(`\x1b[31mError: Invalid Prisma command "${primaryCommand}".\x1b[0m`);
  console.log(`Valid primary commands: ${Object.keys(validCommands).join(', ')}`);
  process.exit(1);
}

// Check if env file exists
const envFilePath = path.join(__dirname, '..', `.env.${env}`);
if (!fs.existsSync(envFilePath)) {
  console.error(`\x1b[31mError: Environment file .env.${env} not found at ${envFilePath}\x1b[0m`);
  process.exit(1);
}

// Build the full command
const fullCommand = `dotenv -e .env.${env} -- npx prisma ${prismaCommand} ${additionalArgs}`.trim();

// Display command information
console.log('\x1b[36m%s\x1b[0m', `🔄 Running Prisma command with ${env} environment:`);
console.log('\x1b[33m%s\x1b[0m', fullCommand);
console.log('');

try {
  // Execute the command
  execSync(fullCommand, { stdio: 'inherit' });
  console.log('\n\x1b[32m%s\x1b[0m', `✅ Command completed successfully!`);
} catch (error) {
  console.error('\n\x1b[31m%s\x1b[0m', `❌ Command failed with error code: ${(error as any).status || 'unknown'}`);
  process.exit(1);
} 