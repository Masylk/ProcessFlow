/**
 * Removes all line breaks and trims the string to the first 150 characters.
 * @param title The input string to format.
 * @returns The formatted string.
 */
export function formatTitle(title: string | undefined): string | undefined {
  if (!title) return undefined;
  // Remove all line breaks (\r, \n) and trim to 120 characters
  return title.replace(/[\r\n]+/g, ' ').slice(0, 120);
} 