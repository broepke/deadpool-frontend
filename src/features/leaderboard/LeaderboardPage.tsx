import { useEffect, useState, useCallback } from 'react';
import { leaderboardApi } from '../../api';
import { LeaderboardEntry } from '../../api/types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAnalytics } from '../../services/analytics/provider';

const AVAILABLE_YEARS = [2025, 2024, 2023];

export default function LeaderboardPage() {
  const analytics = useAnalytics();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleYearChange = useCallback((year: number) => {
    analytics.trackEvent('LEADERBOARD_FILTER', {
      filter_type: 'year',
      value: year,
      previous_value: selectedYear
    });
    setSelectedYear(year);
  }, [analytics, selectedYear]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await leaderboardApi.getLeaderboard(selectedYear);
        setLeaderboard(response.data);
        setError(null);

        // Track successful leaderboard load
        analytics.trackEvent('LEADERBOARD_VIEW', {
          year: selectedYear,
          total_players: response.data.length,
          has_data: response.data.length > 0,
          top_score: response.data[0]?.score
        });
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        const errorMessage = 'Failed to load leaderboard. Please try again later.';
        setError(errorMessage);

        // Track error
        analytics.trackEvent('ERROR_OCCURRED', {
          error_type: 'api_error',
          error_message: errorMessage,
          endpoint: 'getLeaderboard',
          year: selectedYear
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedYear, analytics]);

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Leaderboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Current standings and scores for all players.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Rank
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Player
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-sm text-gray-500">
                          No players on the leaderboard yet.
                          {/* Track empty state when rendered */}
                          {(() => {
                            analytics.trackEvent('LEADERBOARD_VIEW', {
                              year: selectedYear,
                              total_players: 0,
                              has_data: false,
                              state: 'empty'
                            });
                            return null;
                          })()}
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((entry, index) => (
                        <tr key={entry.player_id} className={index < 3 ? 'bg-yellow-50' : undefined}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <span className={`
                              inline-flex items-center justify-center w-6 h-6 rounded-full
                              ${index === 0 ? 'bg-yellow-400 text-white' :
                                index === 1 ? 'bg-gray-300 text-gray-900' :
                                index === 2 ? 'bg-amber-700 text-white' :
                                'text-gray-900'}
                            `}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                            {entry.player_name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {entry.score}
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