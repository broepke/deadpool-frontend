import { useEffect, useState } from 'react';
import { picksApi } from '../../api/services/picks';
import { PickCount } from '../../api/types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function PickCountsPage() {
  const [pickCounts, setPickCounts] = useState<PickCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPickCounts = async () => {
      try {
        setLoading(true);
        const response = await picksApi.getPicksCounts();
        // Sort by draft order
        const sortedCounts = [...response.data].sort((a, b) => a.draft_order - b.draft_order);
        setPickCounts(sortedCounts);
      } catch (err) {
        setError('Failed to load pick counts');
        console.error('Error fetching pick counts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPickCounts();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Pick Counts</h1>
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Draft Order
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Player
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Picks Needed
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {pickCounts.map((count) => (
              <tr key={count.player_id} className={count.pick_count === 0 ? 'bg-green-50' : ''}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {count.draft_order}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                  {count.player_name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {count.pick_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}