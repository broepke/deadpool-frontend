import { useEffect, useState, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { playersApi } from '../../api';
import { Player } from '../../api/types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAnalytics } from '../../services/analytics/provider';

const AVAILABLE_YEARS = [2025, 2024, 2023];

export default function PlayersPage() {
  const analytics = useAnalytics();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleYearChange = useCallback((year: number) => {
    analytics.trackEvent('PLAYER_SEARCH', {
      filter_type: 'year',
      value: year,
      previous_value: selectedYear
    });
    setSelectedYear(year);
  }, [analytics, selectedYear]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await playersApi.getAll(selectedYear);
        setPlayers(response.data);
        setError(null);

        // Track successful players load
        analytics.trackEvent('PLAYER_SEARCH', {
          total_players: response.data.length,
          has_data: response.data.length > 0,
          years_represented: [...new Set(response.data.map(p => p.year))].sort(),
          filter_type: 'all'
        });
      } catch (err) {
        console.error('Failed to fetch players:', err);
        const errorMessage = 'Failed to load players. Please try again later.';
        setError(errorMessage);

        // Track error
        analytics.trackEvent('API_ERROR', {
          error_type: 'api_error',
          error_message: errorMessage,
          endpoint: 'getAll',
          component: 'PlayersPage'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [analytics, selectedYear]);

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Players</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all players participating in the game.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            aria-label="Select year"
          >
            {AVAILABLE_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px] mt-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="mt-8 text-center text-red-600">{error}</div>
      ) : (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black dark:ring-gray-700 ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Draft Order
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Year
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Has Phone Number
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Phone Verified
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        SMS Notifications
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {players.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                          No players added yet.
                          {/* Track empty state when rendered */}
                          {(() => {
                            analytics.trackEvent('PLAYER_SEARCH', {
                              total_players: 0,
                              has_data: false,
                              state: 'empty',
                              filter_type: 'all'
                            });
                            return null;
                          })()}
                        </td>
                      </tr>
                    ) : (
                      players.map((player) => (
                        <tr key={player.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                            {player.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {player.draft_order}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {player.year}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {player.has_phone ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" aria-label="Has phone number" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-500" aria-label="No phone number" />
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {player.phone_verified ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" aria-label="Verified" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-500" aria-label="Not verified" />
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {player.sms_notifications_enabled ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" aria-label="Enabled" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-500" aria-label="Disabled" />
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}