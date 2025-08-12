/**
 * Time utility functions for read mode
 */

/**
 * Formats time in minutes to human-readable format
 * @param minutes - Time in minutes as string or number
 * @returns Formatted time string (e.g., "5 min", "1h 30min", "2h")
 */
export function formatTime(minutes: string | number | null | undefined): string {
  if (!minutes) return '';
  
  const numMinutes = typeof minutes === 'string' ? parseInt(minutes, 10) : minutes;
  
  if (isNaN(numMinutes) || numMinutes <= 0) return '';
  
  if (numMinutes < 60) {
    return `${numMinutes} min`;
  }
  
  const hours = Math.floor(numMinutes / 60);
  const remainingMinutes = numMinutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Calculates total time from an array of blocks
 * @param blocks - Array of blocks with average_time property
 * @returns Total time in minutes
 */
export function calculateTotalTime(blocks: Array<{ average_time?: string | null }>): number {
  return blocks.reduce((total, block) => {
    if (!block.average_time) return total;
    
    const minutes = parseInt(block.average_time, 10);
    return isNaN(minutes) ? total : total + minutes;
  }, 0);
}

/**
 * Checks if a time value is valid
 * @param minutes - Time in minutes as string or number
 * @returns True if the time is valid and greater than 0
 */
export function isValidTime(minutes: string | number | null | undefined): boolean {
  if (!minutes) return false;
  
  const numMinutes = typeof minutes === 'string' ? parseInt(minutes, 10) : minutes;
  return !isNaN(numMinutes) && numMinutes > 0;
} 