const fs = require('fs');
const path = require('path');

// Get the environment from command line argument
const env = process.argv[2] || 'staging';

// Define the source file path
const sourceFilePath = path.join(__dirname, '..', `.env.${env}`);
const targetFilePath = path.join(__dirname, '..', '.env');

// Check if the source file exists
if (!fs.existsSync(sourceFilePath)) {
  console.error(`Error: Environment file .env.${env} not found.`);
  process.exit(1);
}

// Copy the environment file
fs.copyFileSync(sourceFilePath, targetFilePath);
console.log(`Successfully loaded ${env} environment.`);

export {}; 