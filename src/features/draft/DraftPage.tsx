import { useState, useEffect } from 'react';
import { useAuth } from "react-oidc-context";
import { draftApi } from '../../api/services/draft';
import { picksApi } from '../../api/services/picks';
import { PickDetail } from '../../api/types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function DraftPage() {
  const auth = useAuth();
  const [picks, setPicks] = useState<PickDetail[]>([]);
  const [currentPick, setCurrentPick] = useState('');
  const [currentDrafter, setCurrentDrafter] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();

  const loadPicks = async () => {
    try {
      const response = await picksApi.getAll(currentYear);
      setPicks(response.data);
    } catch (err) {
      setError('Failed to load draft history');
      console.error(err);
    }
  };

  const fetchNextDrafter = async () => {
    try {
      const response = await draftApi.getNextDrafter();
      if (response.data) {
        setCurrentDrafter({
          id: response.data.player_id,
          name: response.data.player_name
        });
      }
    } catch (err) {
      setError('Failed to fetch next drafter');
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

  const handleSubmitPick = async () => {
    if (!currentPick.trim() || !currentDrafter) return;
    
    setIsSubmitting(true);
    try {
      await draftApi.draftPerson({
        name: currentPick.trim(),
        player_id: currentDrafter.id
      });
      
      setCurrentPick('');
      // Fetch the next drafter after successful submission
      await fetchNextDrafter();
      
      // Reload the picks to show the updated history
      await loadPicks();
    } catch (err) {
      setError('Failed to submit pick');
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
            {currentDrafter && (
              <div className="mt-2 p-4 rounded-md bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-blue-900">{currentDrafter.name}</span>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
                    Current Drafter
                  </span>
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
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={currentPick}
                        onChange={(e) => setCurrentPick(e.target.value)}
                        placeholder="Enter celebrity name"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="btn btn-primary w-full flex justify-center items-center"
                      onClick={handleSubmitPick}
                      disabled={!currentPick.trim() || isSubmitting}
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