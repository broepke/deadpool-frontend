import { useState, useEffect } from 'react';
import { useAuth } from "react-oidc-context";
import { draftApi } from '../../api/services/draft';
import { picksApi } from '../../api/services/picks';
import { PickDetail } from '../../api/types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { isValidCelebrityName, sanitizeCelebrityName } from '../../utils/validation';
import { useAnalytics } from '../../services/analytics/provider';

export default function DraftPage() {
  const auth = useAuth();
  const analytics = useAnalytics();
  const [picks, setPicks] = useState<PickDetail[]>([]);
  const [currentPick, setCurrentPick] = useState('');
  const [currentDrafter, setCurrentDrafter] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  const loadPicks = async () => {
    try {
      const response = await picksApi.getAll(currentYear);
      // Sort by timestamp in descending order and limit to 10 most recent picks
      const sortedPicks = response.data
        .sort((a, b) => {
          if (!a.pick_timestamp) return 1;
          if (!b.pick_timestamp) return -1;
          return new Date(b.pick_timestamp).getTime() - new Date(a.pick_timestamp).getTime();
        })
        .slice(0, 10);
      setPicks(sortedPicks);

      analytics.trackEvent('LEADERBOARD_VIEW', {
        year: currentYear,
        picks_count: sortedPicks.length
      });
    } catch (err) {
      setError('Failed to load draft history');
      analytics.trackEvent('ERROR_OCCURRED', {
        error_type: 'api_error',
        error_message: 'Failed to load draft history',
        endpoint: 'getAll'
      });
      console.error(err);
    }
  };

  const fetchNextDrafter = async () => {
    try {
      const response = await draftApi.getNextDrafter();
      if (response.data) {
        const nextDrafter = {
          id: response.data.player_id,
          name: response.data.player_name
        };
        setCurrentDrafter(nextDrafter);

        // Track when it's the current user's turn
        if (auth.user?.profile.sub === nextDrafter.id) {
          analytics.trackEvent('DRAFT_PICK', {
            event_type: 'turn_start',
            player_name: nextDrafter.name
          });
        }
      }
    } catch (err: any) {
      // Handle the specific case of no eligible players
      if (err.response?.data?.detail === "No eligible players found") {
        setCurrentDrafter(null);
        analytics.trackEvent('DRAFT_COMPLETE', {
          event_type: 'no_eligible_players'
        });
      } else {
        setError('Failed to fetch next drafter');
        analytics.trackEvent('ERROR_OCCURRED', {
          error_type: 'api_error',
          error_message: 'Failed to fetch next drafter',
          endpoint: 'getNextDrafter'
        });
      }
      console.error(err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchNextDrafter(),
          loadPicks()
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentPick(value);
    
    // Clear previous validation errors
    setValidationError(null);
    
    // Validate input as user types
    if (value.trim() && !isValidCelebrityName(value)) {
      const errorMessage = 'Please use only letters, numbers, spaces, and basic punctuation (hyphens, apostrophes, periods, commas, parentheses)';
      setValidationError(errorMessage);
      
      // Track validation error
      analytics.trackEvent('FORM_ERROR', {
        form: 'draft_pick',
        field: 'celebrity_name',
        error: errorMessage,
        input_value: value
      });
    }
  };

  const handleSubmitPick = async () => {
    if (!currentPick.trim() || !currentDrafter) return;
    
    // Sanitize and validate the input
    const sanitizedName = sanitizeCelebrityName(currentPick);
    if (!isValidCelebrityName(sanitizedName)) {
      const errorMessage = 'Celebrity name contains invalid characters. Please use only letters, numbers, spaces, and basic punctuation (hyphens, apostrophes, periods, commas, parentheses).';
      setValidationError(errorMessage);
      
      // Track validation error
      analytics.trackEvent('FORM_ERROR', {
        form: 'draft_pick',
        field: 'celebrity_name',
        error: errorMessage,
        input_value: currentPick
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await draftApi.draftPerson({
        name: sanitizedName,
        player_id: currentDrafter.id
      });
      
      // Track successful pick
      analytics.trackEvent('DRAFT_PICK_SUBMIT', {
        player_id: currentDrafter.id,
        player_name: currentDrafter.name,
        celebrity_name: sanitizedName
      });
      
      setCurrentPick('');
      setValidationError(null);
      // Fetch the next drafter after successful submission
      await fetchNextDrafter();
      
      // Reload the picks to show the updated history
      await loadPicks();
    } catch (err: any) {
      // Extract the detailed error message if available
      const errorMessage = err.response?.data?.detail || 'Failed to submit pick';
      setError(errorMessage);
      
      // Track submission error
      analytics.trackEvent('ERROR_OCCURRED', {
        error_type: 'api_error',
        error_message: errorMessage,
        endpoint: 'draftPerson',
        celebrity_name: sanitizedName
      });
      
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Draft Room</h1>
          <p className="mt-2 text-sm text-gray-700">
            Make your celebrity picks in turn order.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Error Display */}
        {error && (
          <div className="col-span-2 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Draft Status and Current Turn */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900">Current Turn</h2>
          <div className="mt-4">
            {currentDrafter ? (
              <div className="mt-2 p-4 rounded-md bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-blue-900">{currentDrafter.name}</span>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
                    Current Drafter
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-2 p-4 rounded-md bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-900">No eligible players found</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pick Submission */}
        {currentDrafter && (
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900">Make Your Pick</h2>
            {auth.user?.profile.sub === currentDrafter.id ? (
              <>
                <p className="mt-2 text-sm text-gray-600">
                  It's your turn to draft a celebrity.
                </p>
                <div className="mt-4">
                  <div>
                    <label htmlFor="celebrity" className="block text-sm font-medium text-gray-700">
                      Celebrity Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="celebrity"
                        id="celebrity"
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${
                          validationError 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        value={currentPick}
                        onChange={handleInputChange}
                        placeholder="Enter celebrity name"
                      />
                      {validationError && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationError}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        Allowed characters: letters, numbers, spaces, and basic punctuation.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="btn btn-primary w-full flex justify-center items-center"
                      onClick={handleSubmitPick}
                      disabled={!currentPick.trim() || isSubmitting || !!validationError}
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Submitting...
                        </>
                      ) : (
                        `Draft ${currentPick.trim() || 'Celebrity'}`
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                Waiting for {currentDrafter.name} to make their pick...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Draft History */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Draft History</h2>
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Pick #
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Player
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Celebrity
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {picks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-sm text-gray-500">
                    No picks made yet.
                  </td>
                </tr>
              ) : (
                picks.map((pick) => (
                  <tr key={pick.player_id + pick.pick_timestamp}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {pick.draft_order}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {pick.player_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {pick.pick_person_name || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {pick.pick_timestamp ? new Date(pick.pick_timestamp + 'Z').toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      }) : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
