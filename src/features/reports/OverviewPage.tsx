import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getOverview } from '../../api/services/reporting';
import type { OverviewResponse } from '../../api/services/reporting';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { YearSelect } from '../../components/common/YearSelect';
import { useAnalytics } from '../../services/analytics/provider';

const OverviewPage = () => {
  const [data, setData] = useState<OverviewResponse['data'] | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analytics = useAnalytics();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching overview data for year:', selectedYear);
        const response = await getOverview(selectedYear);
        setData(response.data);
        setError(null);

        // Track successful data load
        analytics.trackEvent('PICKS_LOAD_SUCCESS', {
          year: selectedYear,
          has_data: !!response.data,
          total_picks: response.data?.total_picks,
          total_players: response.data?.total_players,
          success_rate: response.data?.pick_success_rate
        });
      } catch (err) {
        setError('Failed to load overview data');
        console.error('Error fetching overview data:', err);

        // Track error
        analytics.trackEvent('ERROR_OCCURRED', {
          error_type: 'api_error',
          error_message: err instanceof Error ? err.message : 'Failed to load overview data',
          year: selectedYear
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, analytics]);

  // Show loading state only on initial load
  if (loading && !data) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (!data) {
    return <div className="text-gray-600 p-4">No data available for the selected year.</div>;
  }

  // Transform age distribution data for the chart
  const ageDistributionData = Object.entries(data.age_distribution).map(([range, stats]) => ({
    range,
    picks: stats.count,
    deceased: stats.deceased,
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Overview Statistics</h1>
        <YearSelect
          selectedYear={selectedYear}
          onChange={(year) => {
            console.log('Year changed to:', year);
            setSelectedYear(year);
          }}
          analyticsEvent="REPORT_FILTER_CHANGED"
        />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Players</h3>
          <p className="text-2xl font-bold dark:text-gray-100">{data.total_players}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Picks</h3>
          <p className="text-2xl font-bold dark:text-gray-100">{data.total_picks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Success Rate</h3>
          <p className="text-2xl font-bold dark:text-gray-100">{(data.pick_success_rate * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Average Pick Age</h3>
          <p className="text-2xl font-bold dark:text-gray-100">{data.average_pick_age.toFixed(1)}</p>
        </div>
      </div>

      {/* Age Distribution Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Age Distribution</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="picks" fill="#4F46E5" name="Total Picks" />
              <Bar dataKey="deceased" fill="#EF4444" name="Deceased" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Most Popular Age Range</h3>
          <p className="text-lg font-semibold dark:text-gray-100">{data.most_popular_age_range}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Most Successful Age Range</h3>
          <p className="text-lg font-semibold dark:text-gray-100">{data.most_successful_age_range}</p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        Last updated: {new Date(data.updated_at).toLocaleString()}
      </div>
    </div>
  );
};

export default OverviewPage;