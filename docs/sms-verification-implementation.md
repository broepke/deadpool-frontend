# SMS Verification Implementation Plan

## Overview
Implement phone number verification flow using new API endpoints to enhance user security and enable SMS notifications.

## API Integration

### 1. New API Types
Add to `src/api/types.ts`:
```typescript
// Phone verification request/response types
export interface PhoneVerificationRequest {
  phone_number: string;
}

export interface PhoneVerificationResponse {
  message_id: string;
  expires_at: string;
}

export interface PhoneCodeVerificationRequest {
  code: string;
}

export interface PhoneCodeVerificationResponse {
  verified: boolean;
}
```

### 2. New API Endpoints
Add to `src/api/services/players.ts`:
```typescript
// Request verification code
requestPhoneVerification: async (playerId: string, data: PhoneVerificationRequest): Promise<ApiResponse<PhoneVerificationResponse>> => {
  return apiClient.post<ApiResponse<PhoneVerificationResponse>>(`${BASE_PATH}/${playerId}/phone/request-verification`, data);
},

// Verify code
verifyPhoneCode: async (playerId: string, data: PhoneCodeVerificationRequest): Promise<ApiResponse<PhoneCodeVerificationResponse>> => {
  return apiClient.post<ApiResponse<PhoneCodeVerificationResponse>>(`${BASE_PATH}/${playerId}/phone/verify`, data);
}
```

## UI Implementation

### 1. Profile Page Updates
Modify `src/features/profile/ProfilePage.tsx`:

- Add new state variables:
```typescript
const [isVerifying, setIsVerifying] = useState(false);
const [verificationError, setVerificationError] = useState<string | null>(null);
const [showVerificationInput, setShowVerificationInput] = useState(false);
const [verificationCode, setVerificationCode] = useState('');
const [verificationExpiry, setVerificationExpiry] = useState<Date | null>(null);
```

- Add verification UI components:
  - "Verify Phone" button next to phone input when number is unverified
  - Verification code input field with countdown timer
  - Loading states during verification
  - Error messages for failed attempts
  - Success confirmation

### 2. Verification Flow

1. Initial State:
   - Show unverified status with "Verify Phone" button
   - Disable SMS notifications toggle until verified

2. Request Verification:
   - User clicks "Verify Phone"
   - System sends verification code
   - Show verification code input
   - Display countdown timer

3. Code Verification:
   - User enters verification code
   - System verifies code
   - Update verification status
   - Enable SMS notifications toggle if verified

4. Error Handling:
   - Invalid phone number format
   - Invalid verification code
   - Expired verification code
   - Network errors

## Implementation Steps

1. API Integration:
   - Add new types
   - Implement API endpoints
   - Update existing interfaces

2. UI Components:
   - Add verification button
   - Create verification code input
   - Implement countdown timer
   - Add loading states
   - Create error displays

3. Business Logic:
   - Handle verification flow
   - Manage verification state
   - Implement error handling
   - Update profile state after verification

4. Testing:
   - Test API integration
   - Verify UI flow
   - Check error handling
   - Validate state management

## Security Considerations

1. Rate Limiting:
   - Implement cooldown period between verification attempts
   - Track failed attempts

2. Input Validation:
   - Validate phone number format
   - Sanitize verification code input

3. Error Handling:
   - Clear error messages
   - Secure error responses

## Analytics Integration

Track verification-related events:
- Verification requested
- Verification succeeded/failed
- Phone number updated
- SMS notifications enabled/disabled

## Future Enhancements

1. Resend Verification:
   - Add resend code capability
   - Implement cooldown period

2. Auto-verification:
   - Consider SMS deep linking
   - Implement auto-fill where supported

3. Accessibility:
   - Ensure ARIA labels
   - Keyboard navigation
   - Screen reader support