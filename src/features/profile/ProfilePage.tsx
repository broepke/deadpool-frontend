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
  const [formData, setFormData] = useState<PlayerUpdate & { fullName: string }>({
    fullName: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    phone_verified: false,
    sms_notifications_enabled: false
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

  const fetchPlayerData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await playersApi.getById(auth.user!.profile.sub);
      
      // Split the name into first and last name for the form
      const nameParts = (response.data.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData({
        fullName: response.data.name || '',
        first_name: firstName,
        last_name: lastName,
        phone_number: response.data.phone_number,
        phone_verified: response.data.phone_verified,
        sms_notifications_enabled: response.data.sms_notifications_enabled
      });
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
      const formattedNumber = formatPhoneNumber(value);
      const validationError = formattedNumber ? getPhoneNumberError(formattedNumber) : null;
      setPhoneError(validationError);
      setFormData(prev => ({
        ...prev,
        [field]: formattedNumber
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
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
        <p className="text-gray-600">Please sign in to view your profile.</p>
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
        <h1 className="text-2xl font-bold">Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="space-x-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-green-300"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID (Sub)</label>
            <div className="mt-1">
              <input
                type="text"
                disabled
                value={auth.user?.profile.sub || ''}
                className="bg-gray-50 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1">
              <input
                type="email"
                disabled
                value={auth.user?.profile.email || ''}
                className="bg-gray-50 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {!isEditing ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  disabled
                  value={formData.fullName}
                  className="bg-gray-50 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleNameChange('first_name', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleNameChange('last_name', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="mt-1">
              <input
                type="tel"
                disabled={!isEditing}
                value={formData.phone_number || ''}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                className={`block w-full rounded-md shadow-sm focus:ring-blue-500 ${
                  phoneError
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                } ${
                  !isEditing ? 'bg-gray-50 disabled:cursor-not-allowed' : 'bg-white'
                }`}
                placeholder="+12223334444"
              />
            </div>
            {isEditing && (
              <div className="mt-1">
                {phoneError ? (
                  <p className="text-sm text-red-600">{phoneError}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Enter phone number in format: +1 (US) followed by area code and number
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="smsNotifications"
              disabled={!isEditing}
              checked={formData.sms_notifications_enabled || false}
              onChange={(e) => handleInputChange('sms_notifications_enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700">
              Enable SMS Notifications
            </label>
          </div>

          {formData.phone_number && (
            <div className={`text-sm flex items-center space-x-1 ${formData.phone_verified ? 'text-green-600' : 'text-gray-500'}`}>
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