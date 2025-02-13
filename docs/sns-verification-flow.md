# SNS Verification Flow Implementation

## Overview
Update the phone verification flow to handle Amazon SNS subscription requirements. The system needs to ensure a phone number is properly subscribed to SNS before allowing SMS notifications.

## API Types Updates

### Player Interface
```typescript
export interface Player {
  // ... existing fields ...
  phone_number?: string;
  phone_verified?: boolean;
  sms_notifications_enabled?: boolean;
  sns_subscription_status?: 'unsubscribed' | 'pending' | 'subscribed';
  sns_subscription_arn?: string;
}
```

### Verification Response Types
```typescript
export interface PhoneVerificationResponse {
  verification_id: string;
  message_id: string;
  expires_at: string;
  phone_number: string;
  sns_subscription_status: 'unsubscribed' | 'pending' | 'subscribed';
  requires_subscription: boolean;
}

export interface PhoneCodeVerificationResponse {
  verified: boolean;
  sns_subscription_status: 'unsubscribed' | 'pending' | 'subscribed';
  requires_subscription_confirmation: boolean;
}
```

## Verification Flow

### 1. Initial Phone Number Entry
- When user enters phone number, check if it's already subscribed to SNS
- If not subscribed, initiate SNS subscription process before verification
- Show appropriate UI messaging about subscription status

### 2. SNS Subscription Process
```typescript
// New API endpoint in players service
export const playersApi = {
  // ... existing endpoints ...
  
  // Subscribe phone number to SNS
  subscribeSnsPhone: async (playerId: string, data: { phone_number: string }): Promise<ApiResponse<{
    subscription_status: 'pending' | 'subscribed';
    requires_confirmation: boolean;
  }>> => {
    return apiClient.post(`${BASE_PATH}/${playerId}/phone/sns-subscribe`, data);
  },
  
  // Confirm SNS subscription (if required)
  confirmSnsSubscription: async (playerId: string, data: { confirmation_code: string }): Promise<ApiResponse<{
    subscription_status: 'subscribed';
    subscription_arn: string;
  }>> => {
    return apiClient.post(`${BASE_PATH}/${playerId}/phone/sns-confirm`, data);
  }
};
```

### 3. UI States

#### Phone Number Entry
```tsx
{!formData.sns_subscription_status && formData.phone_number && (
  <div className="mt-2">
    <p className="text-sm text-amber-600">
      Phone number needs to be subscribed to receive SMS notifications
    </p>
    <button
      onClick={handleSnsSubscribe}
      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
    >
      Subscribe for SMS
    </button>
  </div>
)}
```

#### Subscription Pending
```tsx
{formData.sns_subscription_status === 'pending' && (
  <div className="mt-2">
    <p className="text-sm text-amber-600">
      Please confirm SMS subscription using the code sent to your phone
    </p>
    <div className="mt-2 flex space-x-4">
      <input
        type="text"
        placeholder="Confirmation code"
        value={snsConfirmationCode}
        onChange={(e) => setSnsConfirmationCode(e.target.value)}
        className="..."
      />
      <button
        onClick={handleSnsConfirm}
        className="..."
      >
        Confirm Subscription
      </button>
    </div>
  </div>
)}
```

### 4. Implementation Steps

1. Update API Types:
   - Add new SNS-related fields to Player interface
   - Update verification response types
   - Add new SNS subscription types

2. Update API Service:
   - Add new endpoints for SNS subscription handling
   - Update existing verification endpoints to handle SNS status

3. Update ProfilePage Component:
   - Add SNS subscription state handling
   - Add UI components for subscription flow
   - Update verification flow to check SNS status

4. Flow Logic:
```typescript
const handlePhoneUpdate = async () => {
  // Check if phone number needs SNS subscription
  if (!formData.sns_subscription_status) {
    const subResponse = await playersApi.subscribeSnsPhone(userId, {
      phone_number: formData.phone_number
    });
    
    if (subResponse.data.requires_confirmation) {
      setShowSnsConfirmation(true);
      return;
    }
  }
  
  // Proceed with verification if subscribed
  if (formData.sns_subscription_status === 'subscribed') {
    await handleRequestVerification();
  }
};
```

## Error Handling

1. SNS Subscription Errors:
   - Handle subscription failure
   - Handle confirmation code errors
   - Provide clear error messages to users

2. Verification with SNS:
   - Check SNS status before allowing verification
   - Handle expired subscriptions
   - Handle unsubscribed status

## Analytics Integration

Add new events:
- SNS_SUBSCRIPTION_REQUESTED
- SNS_SUBSCRIPTION_CONFIRMED
- SNS_SUBSCRIPTION_FAILED

## Security Considerations

1. Rate Limiting:
   - Apply rate limits to SNS subscription attempts
   - Limit confirmation code attempts

2. Validation:
   - Validate phone numbers before SNS subscription
   - Validate confirmation codes
   - Verify SNS subscription status

## Future Enhancements

1. Subscription Management:
   - Allow users to unsubscribe
   - Show subscription history
   - Handle subscription renewal

2. Error Recovery:
   - Add retry mechanisms
   - Handle temporary SNS service issues
   - Provide manual subscription options