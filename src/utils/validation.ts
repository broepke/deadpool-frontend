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
 * More lenient during typing, only formats complete numbers
 */
export function formatPhoneNumber(input: string): string {
  // If empty, return empty string
  if (!input) return '';
  
  // Preserve + if user entered it
  const hasPlus = input.startsWith('+');
  
  // Remove all non-digit characters except leading +
  const cleaned = input.replace(/[^\d+]/g, '');
  
  // If only + remains, return it
  if (cleaned === '+') return '+';
  
  // Get digits only for length check
  const digitsOnly = cleaned.replace(/\D/g, '');
  
  // If we have a complete number (10+ digits)
  if (digitsOnly.length >= 10) {
    // For complete numbers, ensure proper format
    const withCountryCode = digitsOnly.length === 10
      ? `1${digitsOnly}` // Add US country code for 10-digit numbers
      : digitsOnly;      // Keep as-is for international numbers
    return `+${withCountryCode}`;
  }
  
  // During typing, just return cleaned input
  return hasPlus ? cleaned : `+${cleaned}`;
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
 * More lenient during typing, strict only for complete numbers
 * Returns null if valid or still typing
 */
export function getPhoneNumberError(phone: string): string | null {
  if (!phone) return null; // Allow empty during typing
  if (!phone.startsWith('+')) return 'Phone number must start with +';
  
  // Get digits only for length check
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Only validate complete numbers (10+ digits)
  if (digitsOnly.length >= 10) {
    if (!/^\+[1-9]/.test(phone)) return 'Invalid country code';
    if (!/^\+[0-9]+$/.test(phone)) return 'Phone number can only contain digits';
    if (!isValidPhoneNumber(phone)) return 'Must be 10 digits (US) or international format';
  }
  
  return null; // Still typing, no error yet
}