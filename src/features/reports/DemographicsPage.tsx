import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDemographics } from '../../api/services/reporting';
import type { DemographicsResponse } from '../../api/services/reporting';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { YearSelect } from '../../components/common/YearSelect';

const DemographicsPage = () => {
  const [data, setData] = useState<DemographicsResponse['data']>([]);
  const [metadata, setMetadata] = useState<DemographicsResponse['metadata'] | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDemographics(selectedYear);
        setData(response.data);
        setMetadata(response.metadata);
        setError(null);
      } catch (err) {
        setError('Failed to load demographics data');
        console.error('Error fetching demographics data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Demographics Analysis</h1>
        <YearSelect
          selectedYear={selectedYear}
          onChange={(year) => {
            setSelectedYear(year);
            setLoading(true);
          }}
          analyticsEvent="REPORT_FILTER_CHANGED"
        />
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
            <h3 className="text-gray-600 text-sm">Most Popular Range</h3>
            <p className="text-2xl font-bold">{metadata.most_popular_range}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Most Successful Range</h3>
            <p className="text-2xl font-bold">{metadata.most_successful_range}</p>
          </div>
        </div>
      )}

      {/* Pick Distribution Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Pick Distribution by Age Range</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="pick_count" 
                fill="#4F46E5" 
                name="Total Picks"
              />
              <Bar 
                dataKey="death_count" 
                fill="#EF4444" 
                name="Deaths"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Success Rate Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Success Rate by Age Range</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis 
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip 
                formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
              />
              <Legend />
              <Bar 
                dataKey="success_rate" 
                fill="#10B981" 
                name="Success Rate"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average Score Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Average Score by Age Range</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="average_score" 
                fill="#6366F1" 
                name="Average Score"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Last Updated */}
      {metadata && (
        <div className="mt-8 text-sm text-gray-500">
          Last updated: {new Date(metadata.updated_at).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default DemographicsPage;