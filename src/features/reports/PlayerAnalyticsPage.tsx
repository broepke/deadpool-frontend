import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPlayerAnalytics } from '../../api/services/reporting';
import type { PlayerAnalyticsResponse } from '../../api/services/reporting';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { YearSelect } from '../../components/common/YearSelect';
import { useAnalytics } from '../../services/analytics/provider';

const PlayerAnalyticsPage = () => {
  const [data, setData] = useState<PlayerAnalyticsResponse['data']>([]);
  const [allPlayers, setAllPlayers] = useState<Array<{ player_id: string; player_name: string }>>([]);
  const [metadata, setMetadata] = useState<PlayerAnalyticsResponse['metadata'] | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analytics = useAnalytics();

  // Initial load to get all players
  useEffect(() => {
    const fetchAllPlayers = async () => {
      try {
        const response = await getPlayerAnalytics(undefined, selectedYear);
        setAllPlayers(response.data.map(player => ({
          player_id: player.player_id,
          player_name: player.player_name
        })));
        
        analytics.trackEvent('PICKS_LOAD_SUCCESS', {
          year: selectedYear,
          has_data: response.data.length > 0,
          total_players: response.data.length,
          type: 'all_players'
        });
      } catch (err) {
        console.error('Error fetching all players:', err);
        analytics.trackEvent('ERROR_OCCURRED', {
          error_type: 'api_error',
          error_message: err instanceof Error ? err.message : 'Failed to load all players',
          year: selectedYear
        });
      }
    };

    fetchAllPlayers();
  }, [selectedYear, analytics]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getPlayerAnalytics(selectedPlayerId || undefined, selectedYear);
        setData(response.data);
        setMetadata(response.metadata);
        setError(null);

        analytics.trackEvent('PICKS_LOAD_SUCCESS', {
          year: selectedYear,
          player_id: selectedPlayerId || 'all',
          has_data: response.data.length > 0,
          total_picks: response.metadata?.total_picks,
          total_deaths: response.metadata?.total_deaths,
          success_rate: response.metadata?.overall_success_rate
        });
      } catch (err) {
        setError('Failed to load player analytics data');
        console.error('Error fetching player analytics data:', err);

        analytics.trackEvent('ERROR_OCCURRED', {
          error_type: 'api_error',
          error_message: err instanceof Error ? err.message : 'Failed to load player analytics data',
          year: selectedYear,
          player_id: selectedPlayerId || 'all'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPlayerId, selectedYear, analytics]);

  // Show loading state only on initial load
  if (loading && !data.length) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (!data.length) {
    return <div className="text-gray-600 p-4">No data available for the selected filters.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Player Analytics</h1>
        <div className="flex gap-4">
          <YearSelect
            selectedYear={selectedYear}
            onChange={(year) => {
              console.log('Year changed to:', year);
              setSelectedYear(year);
            }}
            analyticsEvent="REPORT_FILTER_CHANGED"
          />
          <select
            value={selectedPlayerId}
            onChange={(e) => {
              const newPlayerId = e.target.value;
              setSelectedPlayerId(newPlayerId);
              setLoading(true);
              
              analytics.trackEvent('REPORT_FILTER_CHANGED', {
                filter_type: 'player',
                value: newPlayerId || 'all',
                previous_value: selectedPlayerId || 'all',
                year: selectedYear
              });
            }}
            className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Players</option>
            {allPlayers.map((player) => (
              <option key={player.player_id} value={player.player_id}>
                {player.player_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {metadata && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Players</h3>
            <p className="text-2xl font-bold dark:text-gray-100">{metadata.total_players}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Picks</h3>
            <p className="text-2xl font-bold dark:text-gray-100">{metadata.total_picks}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Deaths</h3>
            <p className="text-2xl font-bold dark:text-gray-100">{metadata.total_deaths}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Overall Success Rate</h3>
            <p className="text-2xl font-bold dark:text-gray-100">{(metadata.overall_success_rate * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Player Details */}
      {data.map((player) => (
        <div key={player.player_id} className="mb-8">
          {data.length > 1 && (
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">{player.player_name}</h2>
          )}

          {/* Success Rate and Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Success Rate</h3>
              <p className="text-2xl font-bold dark:text-gray-100">{(player.success_rate * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Pick Timing Pattern</h3>
              <p className="text-lg dark:text-gray-100">{player.pick_timing_pattern}</p>
            </div>
          </div>

          {/* Preferred Age Ranges */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Preferred Age Ranges</h3>
            <div className="flex flex-wrap gap-2">
              {player.preferred_age_ranges.map((range) => (
                <span
                  key={range}
                  className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                >
                  {range}
                </span>
              ))}
            </div>
          </div>

          {/* Score Progression Chart */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Score Progression</h3>
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={player.score_progression.map((score, index) => ({
                    period: index + 1,
                    score
                  }))}
                  margin={{ bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="period"
                    label={{ value: 'Pick Number', position: 'bottom', offset: 0 }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, _name) => [value, 'Score']}
                    labelFormatter={(label) => `Pick #${label}`}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4F46E5"
                    name="Score"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ))}

      {/* Last Updated */}
      {metadata && (
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(metadata.updated_at).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default PlayerAnalyticsPage;