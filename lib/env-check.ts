/**
 * Environment Variable Validator
 * 
 * This utility helps validate that required environment variables are present
 * and provides helpful debugging information when they're missing.
 */

export type EnvCheckResult = {
  isValid: boolean;
  missingVars: string[];
  message: string;
};

/**
 * Validates that required environment variables are present
 */
export function checkRequiredEnvVars(requiredVars: string[]): EnvCheckResult {
  const missingVars = requiredVars.filter(
    varName => !process.env[varName] || process.env[varName] === ''
  );

  const isValid = missingVars.length === 0;
  let message = isValid 
    ? 'All required environment variables are present.' 
    : `Missing required environment variables: ${missingVars.join(', ')}`;

  if (!isValid) {
    const envPrefix = process.env.NODE_ENV === 'production' ? '' : 'NEXT_PUBLIC_';
    message += `\n\nPlease check your .env file and ensure these variables are present.`;
    message += `\nRemember that variables accessible in the browser must be prefixed with NEXT_PUBLIC_.`;
    message += `\nCurrent environment: ${process.env.NODE_ENV}`;
    
    // Provide information about available env vars without revealing sensitive values
    const availableVars = Object.keys(process.env)
      .filter(key => !key.includes('SECRET') && !key.includes('KEY'))
      .join(', ');
    
    message += `\n\nAvailable environment variables: ${availableVars}`;
  }

  return { isValid, missingVars, message };
}

// Check Stripe-related environment variables on import
const stripeEnvCheck = checkRequiredEnvVars([
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_MONTHLY_PRICE_ID',
  'NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_ANNUAL_PRICE_ID'
]);

// Log warnings in development but not in production to avoid cluttering logs
if (!stripeEnvCheck.isValid && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ Stripe environment check failed:');
  console.warn(stripeEnvCheck.message);
}

export default { checkRequiredEnvVars }; 