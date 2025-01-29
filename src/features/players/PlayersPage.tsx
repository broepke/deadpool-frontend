import { useEffect, useState } from 'react';
import { playersApi } from '../../api';
import { Player } from '../../api/types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAnalytics } from '../../services/analytics/provider';

export default function PlayersPage() {
  const analytics = useAnalytics();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await playersApi.getAll();
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
  }, [analytics]);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Players</h1>
        <p className="mt-2 text-sm text-gray-700">
          A list of all players participating in the game.
        </p>
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
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Draft Order
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Year
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {players.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-sm text-gray-500">
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
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {player.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {player.draft_order}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {player.year}
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