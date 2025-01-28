# Character Validation for Draft Submissions

## Context

The Draft page allows users to submit celebrity names, but currently lacks validation for special characters and non-standard character sets (like emojis). While SQL injection is not a concern due to the use of DynamoDB, there are still potential issues with data consistency and display if non-standard characters are submitted.

## Current State

1. The frontend only performs basic string trimming (`currentPick.trim()`)
2. No validation of character types or sets
3. No restrictions on emoji or special characters
4. No immediate feedback to users about invalid characters

## Decision

We will implement a comprehensive character validation strategy with the following components:

### 1. Frontend Validation

Add a utility function for character validation that:
- Allows standard Latin characters (a-z, A-Z)
- Allows common punctuation (periods, hyphens, apostrophes)
- Allows spaces for multi-word names
- Rejects emojis and other special characters
- Provides immediate feedback to users

Example implementation:
```typescript
const VALID_NAME_REGEX = /^[a-zA-Z\s\-'.]+$/;

function isValidCelebrityName(name: string): boolean {
  return VALID_NAME_REGEX.test(name.trim());
}
```

### 2. Input Sanitization

Add a sanitization function that:
- Normalizes Unicode characters to their closest ASCII equivalents where appropriate
- Removes any invisible or control characters
- Standardizes whitespace
- Maintains proper capitalization

Example implementation:
```typescript
function sanitizeCelebrityName(name: string): string {
  return name
    .trim()
    .normalize('NFKC') // Normalize Unicode characters
    .replace(/\s+/g, ' ') // Standardize whitespace
    .replace(/[^\x20-\x7E]/g, ''); // Remove non-printable ASCII characters
}
```

### 3. User Feedback

Enhance the UI to:
- Show real-time validation feedback as users type
- Clearly indicate which characters are allowed
- Provide helpful error messages for invalid input
- Disable the submit button when input is invalid

### 4. Error Handling

Implement proper error handling that:
- Catches and displays validation errors from both frontend and backend
- Provides clear messages about why input was rejected
- Suggests corrections when possible

## Implementation Steps

1. Create a new validation utility module
2. Add character validation to the DraftPage component
3. Enhance the UI with real-time feedback
4. Update error handling to be more specific
5. Add unit tests for validation functions

Example DraftPage component changes:
```typescript
const handleSubmitPick = async () => {
  const sanitizedName = sanitizeCelebrityName(currentPick);
  
  if (!isValidCelebrityName(sanitizedName)) {
    setError('Celebrity name contains invalid characters. Please use only letters, spaces, hyphens, and apostrophes.');
    return;
  }
  
  // Proceed with submission...
};
```

## Consequences

### Positive

- Prevents data inconsistency issues
- Provides better user experience with immediate feedback
- Reduces potential display issues across different platforms
- Makes data processing and searching more reliable
- Standardizes name formats in the system

### Negative

- May restrict some valid but complex names
- Additional processing overhead for validation
- Need to handle edge cases for international names
- Potential need for exception handling for specific cases

## Alternatives Considered

1. **Allow All Unicode Characters**
   - Rejected due to potential display and processing issues
   - Would make searching and matching more complex

2. **Strict ASCII-only Validation**
   - Rejected as too restrictive for international names
   - Would exclude many valid name characters

3. **Backend-only Validation**
   - Rejected due to poor user experience
   - Would increase server load unnecessarily

## Future Considerations

1. Consider adding support for additional character sets based on user needs
2. Monitor validation error rates to adjust rules if needed
3. Consider implementing a name suggestion system for common misspellings
4. May need to add support for diacritical marks in international names