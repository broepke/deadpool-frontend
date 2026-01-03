/**
 * Utility functions for consistent date formatting across the application
 * These functions ensure dates are displayed in UTC to avoid timezone conversion issues
 */

/**
 * Format a date string to display the actual date without timezone conversion
 * @param dateString - ISO date string from the backend
 * @param options - Optional formatting options
 * @returns Formatted date string in UTC
 */
export const formatDateUTC = (
  dateString: string | null | undefined,
  options: {
    includeTime?: boolean;
    dateStyle?: 'full' | 'long' | 'medium' | 'short';
    timeStyle?: 'full' | 'long' | 'medium' | 'short';
  } = {}
): string => {
  if (!dateString) return 'N/A';
  
  const { includeTime = false, dateStyle = 'short', timeStyle = 'short' } = options;
  
  try {
    const date = new Date(dateString);
    
    if (includeTime) {
      return date.toLocaleString('en-US', {
        timeZone: 'UTC',
        dateStyle,
        timeStyle
      });
    } else {
      return date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        year: dateStyle === 'short' ? '2-digit' : 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid Date';
  }
};

/**
 * Format a date for chart/graph display
 * @param dateString - ISO date string
 * @returns Short formatted date for charts
 */
export const formatDateForChart = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting chart date:', dateString, error);
    return '';
  }
};

/**
 * Format a date for detailed display (e.g., tooltips)
 * @param dateString - ISO date string
 * @returns Full formatted date
 */
export const formatDateDetailed = (dateString: string): string => {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting detailed date:', dateString, error);
    return 'Invalid Date';
  }
};

/**
 * Format a timestamp for display (includes date and time)
 * @param dateString - ISO date string
 * @returns Formatted timestamp in UTC
 */
export const formatTimestampUTC = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting timestamp:', dateString, error);
    return 'Invalid Date';
  }
};