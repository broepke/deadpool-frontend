import { useState, useEffect } from 'react';
import { useAuth } from "react-oidc-context";
import { draftApi } from '../../api/services/draft';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { isValidCelebrityName, sanitizeCelebrityName } from '../../utils/validation';
import { useAnalytics } from '../../services/analytics/provider';

export default function DraftPage() {
  const auth = useAuth();
  const analytics = useAnalytics();
  const [currentPick, setCurrentPick] = useState('');
  const [currentDrafter, setCurrentDrafter] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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
        await fetchNextDrafter();
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Draft Room</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Make your celebrity picks in turn order.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Error Display */}
        {error && (
          <div className="col-span-2 rounded-md bg-red-50 dark:bg-red-900/30 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Draft Status and Current Turn */}
        <div className="card bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Current Turn</h2>
          <div className="mt-4">
            {currentDrafter ? (
              <div className="mt-2 p-4 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-blue-900 dark:text-blue-100">{currentDrafter.name}</span>
                  <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-800 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:text-blue-200">
                    Current Drafter
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-2 p-4 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-900 dark:text-gray-100">No eligible players found</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pick Submission */}
        {currentDrafter && (
          <div className="card bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Make Your Pick</h2>
            {auth.user?.profile.sub === currentDrafter.id ? (
              <>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  It's your turn to draft a celebrity.
                </p>
                <div className="mt-4">
                  <div>
                    <label htmlFor="celebrity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Celebrity Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="celebrity"
                        id="celebrity"
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${
                          validationError
                            ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                        } bg-white dark:bg-gray-700 dark:text-gray-100`}
                        value={currentPick}
                        onChange={handleInputChange}
                        placeholder="Enter celebrity name"
                      />
                      {validationError && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {validationError}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Allowed characters: letters, numbers, spaces, and basic punctuation.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="btn btn-primary w-full flex justify-center items-center bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors py-2"
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
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Waiting for {currentDrafter.name} to make their pick...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
