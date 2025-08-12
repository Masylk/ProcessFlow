/**
 * Basic input sanitizer for email and password fields.
 * Strips leading/trailing whitespace and removes dangerous characters.
 */
export function sanitizeInput(input: string): string {
  // Remove leading/trailing whitespace and control characters
  let sanitized = input.trim().replace(/[\u0000-\u001F\u007F]/g, '');
  // Remove script tags and angle brackets
  sanitized = sanitized.replace(/<.*?>/g, '');
  sanitized = sanitized.replace(/[<>]/g, '');
  return sanitized;
} 