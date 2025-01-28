/**
 * Regular expression for validating celebrity names
 * Allows:
 * - Letters (a-z, A-Z)
 * - Numbers (0-9) for suffixes like "III" or "2nd"
 * - Spaces
 * - Hyphens (for compound names like "Jean-Paul")
 * - Apostrophes (for names like "O'Brien")
 * - Periods (for "Jr." or "Sr.")
 * - Commas (for "Smith, Jr.")
 * - Parentheses (for stage names/aliases like "The Rock (Dwayne Johnson)")
 */
export const VALID_NAME_REGEX = /^[a-zA-Z0-9\s\-'.,()]+$/;

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
 * - Preserving valid name characters
 */
export function sanitizeCelebrityName(name: string): string {
  return name
    .trim()
    .normalize('NFKC') // Normalize Unicode characters
    .replace(/\s+/g, ' ') // Standardize whitespace
    .replace(/[^\x20-\x7E]/g, ''); // Remove non-printable ASCII characters
}