import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTimeAnalytics } from '../../api/services/reporting';
import type { TimeAnalyticsResponse } from '../../api/services/reporting';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { YearSelect } from '../../components/common/YearSelect';

const TimeAnalyticsPage = () => {
  const [data, setData] = useState<TimeAnalyticsResponse['data']>([]);
  const [metadata, setMetadata] = useState<TimeAnalyticsResponse['metadata'] | null>(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getTimeAnalytics(selectedYear, period);
        setData(response.data);
        setMetadata(response.metadata);
        setError(null);
      } catch (err) {
        setError('Failed to load time analytics data');
        console.error('Error fetching time analytics data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, selectedYear]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Time Analytics</h1>
        <div className="flex gap-4">
          <YearSelect
            selectedYear={selectedYear}
            onChange={(year) => {
              setSelectedYear(year);
              setLoading(true);
            }}
            analyticsEvent="REPORT_FILTER_CHANGED"
          />
          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly');
              setLoading(true);
            }}
            className="rounded-md border border-gray-300 px-3 py-1.5"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {metadata && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Avg Picks per Period</h3>
            <p className="text-2xl font-bold">{metadata.average_picks_per_period.toFixed(1)}</p>
          </div>
        </div>
      )}

      {/* Trends Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Pick and Death Trends</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <YAxis
                yAxisId={1}
                orientation="right"
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="pick_count" 
                stroke="#4F46E5" 
                name="Picks"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="death_count" 
                stroke="#EF4444" 
                name="Deaths"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="success_rate" 
                stroke="#10B981" 
                name="Success Rate"
                strokeWidth={2}
                yAxisId={1}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average Age Trend */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Average Age Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <YAxis
                yAxisId={1}
                orientation="right"
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="average_age" 
                stroke="#6366F1" 
                name="Average Age"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TimeAnalyticsPage;