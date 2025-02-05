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

/**
 * Formats a phone number to E.164 format (+12223334444)
 * Removes all non-digit characters and adds + prefix
 */
export function formatPhoneNumber(input: string): string {
  // Remove all non-digit characters
  const digitsOnly = input.replace(/\D/g, '');
  
  // If empty, return empty string
  if (!digitsOnly) return '';
  
  // If no country code (length < 11), assume US (+1)
  const withCountryCode = digitsOnly.length < 11
    ? `1${digitsOnly}`
    : digitsOnly;
  
  return `+${withCountryCode}`;
}

/**
 * Validates if a phone number is in E.164 format
 * Must start with + followed by 11-15 digits
 * Common format is +12223334444 for US numbers
 */
export function isValidPhoneNumber(phone: string): boolean {
  const e164Regex = /^\+[1-9]\d{10,14}$/;
  return e164Regex.test(phone);
}

/**
 * Gets validation error message for a phone number
 * Returns null if valid
 */
export function getPhoneNumberError(phone: string): string | null {
  if (!phone) return 'Phone number is required';
  if (!phone.startsWith('+')) return 'Phone number must start with +';
  if (!/^\+[1-9]/.test(phone)) return 'Invalid country code';
  if (!/^\+[0-9]+$/.test(phone)) return 'Phone number can only contain digits';
  if (!isValidPhoneNumber(phone)) return 'Invalid phone number format';
  return null;
}