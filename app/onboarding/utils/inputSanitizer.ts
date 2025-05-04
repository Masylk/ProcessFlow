/**
 * Sanitizes name input (first name, last name)
 * @param value The input value to sanitize
 * @returns Sanitized string that only allows letters, spaces, hyphens, and apostrophes
 */
export function sanitizeNameInput(value: string): string {
  // Remove any HTML tags
  let sanitized = value.replace(/<[^>]*>?/gm, '');
  // Allow only letters, spaces, hyphens, and apostrophes
  sanitized = sanitized.replace(/[^a-zA-ZÀ-ÿ'\- ]/g, '');
  return sanitized;
}

/**
 * Sanitizes workspace name input
 * @param value The input value to sanitize
 * @returns Sanitized string that allows letters, numbers, spaces, hyphens, and apostrophes
 */
export function sanitizeWorkspaceNameInput(value: string): string {
  // Remove HTML tags
  let sanitized = value.replace(/<[^>]*>?/gm, '');
  // Only allow letters, numbers, spaces, and hyphens
  sanitized = sanitized.replace(/[^a-zA-Z0-9\- ]/g, '');
  // Limit to 50 characters
  sanitized = sanitized.slice(0, 50);
  return sanitized;
}

/**
 * Generates a URL slug from a workspace name
 * @param name The workspace name
 * @returns A URL-friendly slug
 */
export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '');
} 