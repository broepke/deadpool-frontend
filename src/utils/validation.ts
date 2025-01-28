/**
 * Regular expression for validating celebrity names
 * Allows:
 * - Letters (a-z, A-Z)
 * - Spaces
 * - Hyphens
 * - Apostrophes
 * - Periods
 */
export const VALID_NAME_REGEX = /^[a-zA-Z\s\-'.]+$/;

/**
 * Validates if a celebrity name contains only allowed characters
 */
export function isValidCelebrityName(name: string): boolean {
  return VALID_NAME_REGEX.test(name.trim());
}

/**
 * Sanitizes a celebrity name by:
 * - Normalizing Unicode characters
 * - Removing control characters
 * - Standardizing whitespace
 */
export function sanitizeCelebrityName(name: string): string {
  return name
    .trim()
    .normalize('NFKC') // Normalize Unicode characters
    .replace(/\s+/g, ' ') // Standardize whitespace
    .replace(/[^\x20-\x7E]/g, ''); // Remove non-printable ASCII characters
}