import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPlayerAnalytics } from '../../api/services/reporting';
import type { PlayerAnalyticsResponse } from '../../api/services/reporting';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { YearSelect } from '../../components/common/YearSelect';

const PlayerAnalyticsPage = () => {
  const [data, setData] = useState<PlayerAnalyticsResponse['data']>([]);
  const [metadata, setMetadata] = useState<PlayerAnalyticsResponse['metadata'] | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getPlayerAnalytics(selectedPlayerId || undefined, selectedYear);
        setData(response.data);
        setMetadata(response.metadata);
        setError(null);
      } catch (err) {
        setError('Failed to load player analytics data');
        console.error('Error fetching player analytics data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPlayerId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Player Analytics</h1>
        <div className="flex gap-4">
          <YearSelect
            selectedYear={selectedYear}
            onChange={(year) => {
              setSelectedYear(year);
              setLoading(true);
            }}
            analyticsEvent="REPORT_FILTER_CHANGED"
          />
          {data.length > 1 && (
            <select
              value={selectedPlayerId}
              onChange={(e) => {
                setSelectedPlayerId(e.target.value);
                setLoading(true);
              }}
              className="rounded-md border border-gray-300 px-3 py-1.5"
            >
              <option value="">All Players</option>
              {data.map((player) => (
                <option key={player.player_id} value={player.player_id}>
                  {player.player_name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {metadata && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Players</h3>
            <p className="text-2xl font-bold">{metadata.total_players}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Picks</h3>
            <p className="text-2xl font-bold">{metadata.total_picks}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Deaths</h3>
            <p className="text-2xl font-bold">{metadata.total_deaths}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Overall Success Rate</h3>
            <p className="text-2xl font-bold">{(metadata.overall_success_rate * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Player Details */}
      {data.map((player) => (
        <div key={player.player_id} className="mb-8">
          {data.length > 1 && (
            <h2 className="text-xl font-semibold mb-4">{player.player_name}</h2>
          )}

          {/* Success Rate and Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm mb-2">Success Rate</h3>
              <p className="text-2xl font-bold">{(player.success_rate * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm mb-2">Pick Timing Pattern</h3>
              <p className="text-lg">{player.pick_timing_pattern}</p>
            </div>
          </div>

          {/* Preferred Age Ranges */}
          <div className="bg-white p-4 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">Preferred Age Ranges</h3>
            <div className="flex flex-wrap gap-2">
              {player.preferred_age_ranges.map((range) => (
                <span
                  key={range}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                >
                  {range}
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Categories */}
          <div className="bg-white p-4 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">Preferred Categories</h3>
            <div className="flex flex-wrap gap-2">
              {player.preferred_categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Score Progression Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Score Progression</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={player.score_progression.map((score, index) => ({
                  period: index + 1,
                  score
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
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
        <div className="mt-8 text-sm text-gray-500">
          Last updated: {new Date(metadata.updated_at).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default PlayerAnalyticsPage;