import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import { useAnalytics } from "../../services/analytics/provider";
import { playersApi } from "../../api/services/players";
import { PlayerUpdate } from "../../api/types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { formatPhoneNumber, getPhoneNumberError } from "../../utils/validation";

export default function ProfilePage() {
  const auth = useAuth();
  const analytics = useAnalytics();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationExpiry, setVerificationExpiry] = useState<Date | null>(null);
  const [formData, setFormData] = useState<PlayerUpdate & { fullName: string }>({
    fullName: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    phone_verified: false,
    sms_notifications_enabled: false,
    phone_verification_id: '',
    phone_verification_expires_at: ''
  });

  useEffect(() => {
    analytics.trackEvent('PROFILE_VIEW', {
      is_authenticated: auth.isAuthenticated,
      has_email: !!auth.user?.profile.email,
      has_phone: !!auth.user?.profile.phone_number
    });
  }, [auth.isAuthenticated, auth.user?.profile, analytics]);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.profile.sub) {
      fetchPlayerData();
    }
  }, [auth.isAuthenticated, auth.user?.profile.sub]);

  // Update countdown timer every second
  useEffect(() => {
    if (!verificationExpiry) return;

    const timer = setInterval(() => {
      const now = new Date();
      if (now >= verificationExpiry) {
        setShowVerificationInput(false);
        setVerificationCode('');
        setVerificationExpiry(null);
        setVerificationError('Verification code expired. Please request a new one.');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [verificationExpiry]);

  const fetchPlayerData = async () => {
    let profileData;
    try {
      setIsLoading(true);
      setError(null);
      const response = await playersApi.getById(auth.user!.profile.sub);
      profileData = response.data;
      
      // Split the name into first and last name for the form
      const nameParts = (profileData.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData({
        fullName: profileData.name || '',
        first_name: firstName,
        last_name: lastName,
        phone_number: profileData.phone_number,
        phone_verified: profileData.phone_verified,
        sms_notifications_enabled: profileData.sms_notifications_enabled,
        phone_verification_id: profileData.phone_verification_id || '',
        phone_verification_expires_at: profileData.phone_verification_expires_at || ''
      });

      // Check for active verification attempt
      if (profileData.phone_verification_id && profileData.phone_verification_expires_at) {
        const expiryDate = new Date(profileData.phone_verification_expires_at);
        if (expiryDate > new Date()) {
          setShowVerificationInput(true);
          setVerificationExpiry(expiryDate);
        }
      }
    } catch (err) {
      setError('Failed to load profile data');
      analytics.trackEvent('API_ERROR', {
        error_type: 'fetch_profile',
        error_message: err instanceof Error ? err.message : 'Unknown error',
        component: 'ProfilePage'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!auth.user?.profile.sub) return;
    
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      // Send only the fields expected by the API
      const updateData: PlayerUpdate = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        phone_verified: formData.phone_verified,
        sms_notifications_enabled: formData.sms_notifications_enabled
      };

      await playersApi.update(auth.user.profile.sub, updateData);
      await fetchPlayerData(); // Refetch player data after successful update
      setIsEditing(false);
      analytics.trackEvent('PROFILE_UPDATE', {
        success: true
      });
    } catch (err) {
      setError('Failed to update profile');
      analytics.trackEvent('API_ERROR', {
        error_type: 'update_profile',
        error_message: err instanceof Error ? err.message : 'Unknown error',
        component: 'ProfilePage'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNameChange = (field: 'first_name' | 'last_name', value: string) => {
    setFormData(prev => {
      const updates = {
        ...prev,
        [field]: value
      };
      // Update the full name when either first or last name changes
      updates.fullName = `${updates.first_name} ${updates.last_name}`.trim();
      return updates;
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === 'phone_number' && typeof value === 'string') {
      // Get the current phone number
      const currentNumber = formData.phone_number || '';
      
      // If deleting (new value is shorter), don't format
      if (value.length < currentNumber.length) {
        setPhoneError(null); // Clear error while deleting
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      } else {
        // Only format when adding characters
        const formattedNumber = formatPhoneNumber(value);
        const validationError = formattedNumber ? getPhoneNumberError(formattedNumber) : null;
        setPhoneError(validationError);
        setFormData(prev => ({
          ...prev,
          [field]: formattedNumber
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const formatTimeRemaining = (expiryDate: Date): string => {
    const now = new Date();
    const diff = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / 1000));
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleRequestVerification = async () => {
    if (!auth.user?.profile.sub || !formData.phone_number) return;

    try {
      setIsVerifying(true);
      setVerificationError(null);
      
      const response = await playersApi.requestPhoneVerification(auth.user.profile.sub, {
        phone_number: formData.phone_number
      });
const expiryDate = new Date(response.data.expires_at);
setShowVerificationInput(true);
setVerificationExpiry(expiryDate);

// Update form data with verification details
setFormData(prev => ({
  ...prev,
  phone_verification_id: response.data.verification_id,
  phone_verification_expires_at: response.data.expires_at
}));

      
      analytics.trackEvent('PHONE_VERIFICATION_REQUESTED', {
        success: true
      });
    } catch (err) {
      setVerificationError('Failed to send verification code. Please try again.');
      analytics.trackEvent('API_ERROR', {
        error_type: 'request_verification',
        error_message: err instanceof Error ? err.message : 'Unknown error',
        component: 'ProfilePage'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!auth.user?.profile.sub || !verificationCode) return;

    try {
      setIsVerifying(true);
      setVerificationError(null);

      const response = await playersApi.verifyPhoneCode(auth.user.profile.sub, {
        code: verificationCode
      });

      if (response.data.verified) {
        setFormData(prev => ({
          ...prev,
          phone_verified: true,
          phone_verification_id: '',
          phone_verification_expires_at: ''
        }));
        setShowVerificationInput(false);
        setVerificationCode('');
        setVerificationExpiry(null);
        
        analytics.trackEvent('PHONE_VERIFICATION_COMPLETED', {
          success: true
        });
      } else {
        setVerificationError('Invalid verification code. Please try again.');
        analytics.trackEvent('PHONE_VERIFICATION_FAILED', {
          error: 'invalid_code'
        });
      }
    } catch (err) {
      setVerificationError('Failed to verify code. Please try again.');
      analytics.trackEvent('API_ERROR', {
        error_type: 'verify_code',
        error_message: err instanceof Error ? err.message : 'Unknown error',
        component: 'ProfilePage'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const validateForm = (): boolean => {
    if (formData.phone_number) {
      const phoneValidationError = getPhoneNumberError(formData.phone_number);
      setPhoneError(phoneValidationError);
      if (phoneValidationError) return false;
    }
    return true;
  };

  if (!auth.isAuthenticated) {
    analytics.trackEvent('AUTH_ERROR', {
      error_type: 'unauthorized',
      error_message: 'User not authenticated',
      component: 'ProfilePage'
    });
    return (
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">Please sign in to view your profile.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="space-x-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition-colors disabled:bg-green-300 dark:disabled:bg-green-800"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User ID (Sub)</label>
            <div className="mt-1">
              <input
                type="text"
                disabled
                value={auth.user?.profile.sub || ''}
                className="bg-gray-50 dark:bg-gray-700 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed dark:text-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <div className="mt-1">
              <input
                type="email"
                disabled
                value={auth.user?.profile.email || ''}
                className="bg-gray-50 dark:bg-gray-700 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed dark:text-gray-300"
              />
            </div>
          </div>

          {!isEditing ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  disabled
                  value={formData.fullName}
                  className="bg-gray-50 dark:bg-gray-700 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed dark:text-gray-300"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleNameChange('first_name', e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleNameChange('last_name', e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
            <div className="mt-1">
              <input
                type="tel"
                disabled={!isEditing}
                value={formData.phone_number || ''}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                className={`block w-full rounded-md shadow-sm focus:ring-blue-500 ${
                  phoneError
                    ? 'border-red-300 dark:border-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                } ${
                  !isEditing ? 'bg-gray-50 dark:bg-gray-700 disabled:cursor-not-allowed' : 'bg-white dark:bg-gray-700'
                } dark:text-gray-300`}
                placeholder="+12223334444"
              />
            </div>
            {isEditing && (
              <div className="mt-1">
                {phoneError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{phoneError}</p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter phone number in format: +1 (US) followed by area code and number
                  </p>
                )}
              </div>
            )}
          </div>

          {isEditing && formData.phone_number && !formData.phone_verified && (
            <div className="mt-4">
              {!showVerificationInput ? (
                <button
                  onClick={handleRequestVerification}
                  disabled={isVerifying || !!phoneError}
                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? 'Sending Code...' : 'Verify Phone Number'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enter Verification Code
                    </label>
                    <div className="mt-1 flex space-x-4">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter code"
                        className="block w-32 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-300"
                      />
                      <button
                        onClick={handleVerifyCode}
                        disabled={isVerifying || !verificationCode}
                        className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isVerifying ? 'Verifying...' : 'Submit'}
                      </button>
                    </div>
                    {verificationExpiry && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Code expires in: {formatTimeRemaining(verificationExpiry)}
                      </p>
                    )}
                  </div>
                  {verificationError && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {verificationError}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="smsNotifications"
              disabled={!isEditing || !formData.phone_verified}
              checked={formData.sms_notifications_enabled || false}
              onChange={(e) => handleInputChange('sms_notifications_enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            />
            <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable SMS Notifications
            </label>
          </div>

          {formData.phone_number && (
            <div className={`text-sm flex items-center space-x-1 ${formData.phone_verified ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {formData.phone_verified ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Phone number verified</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
                  </svg>
                  <span>Phone number not verified</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}