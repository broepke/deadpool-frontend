import { useState } from "react";

interface ProfileData {
  ID: string;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  PhoneVerified: boolean;
  SmsNotificationsEnabled: boolean;
}

export default function ReviewerProfilePage() {
  // Stub data - will be replaced with API call
  const [profile] = useState<ProfileData>({
    ID: "PLAYER#34b83458-5041-7025-f53a-506e8e47578b",
    FirstName: "Brian",
    LastName: "Roepke",
    PhoneNumber: "+14151112222",
    PhoneVerified: false,
    SmsNotificationsEnabled: true
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Profile Review</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Player ID</label>
            <div className="mt-1">
              <input
                type="text"
                disabled
                value={profile.ID}
                className="bg-gray-50 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  disabled
                  value={profile.FirstName}
                  className="bg-gray-50 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  disabled
                  value={profile.LastName}
                  className="bg-gray-50 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="mt-1">
              <input
                type="tel"
                disabled
                value={profile.PhoneNumber}
                className="bg-gray-50 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${profile.PhoneVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-700">
                Phone Number {profile.PhoneVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>

            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${profile.SmsNotificationsEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-700">
                SMS Notifications {profile.SmsNotificationsEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}