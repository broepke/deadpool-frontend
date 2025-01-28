import { useEffect, useState } from 'react';
import { picksApi } from '../../api';
import { PickDetail } from '../../api/types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const AVAILABLE_YEARS = [2025, 2024, 2023];

export default function PicksPage() {
  const [picks, setPicks] = useState<PickDetail[]>([]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        setLoading(true);
        const response = await picksApi.getAll(selectedYear);
        
        // Create a new array with parsed dates for sorting
        const picksWithParsedDates = response.data.map(pick => ({
          ...pick,
          parsedDate: pick.pick_timestamp ? new Date(pick.pick_timestamp + 'Z') : null
        }));

        // Sort by parsed dates and limit to 10
        const sortedPicks = picksWithParsedDates
          .sort((a, b) => {
            if (!a.parsedDate) return 1;
            if (!b.parsedDate) return -1;
            return b.parsedDate.getTime() - a.parsedDate.getTime();
          })
          .slice(0, 10)
          .map(({ parsedDate, ...pick }) => pick); // Remove the parsedDate field before setting state

        setPicks(sortedPicks);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch picks:', err);
        setError('Failed to load picks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPicks();
  }, [selectedYear]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString + 'Z').toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Celebrity Picks</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all celebrity picks and their current status.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
              <div className="flex justify-center items-center min-h-[200px]">
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
                        Player
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Draft Order
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Celebrity
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Age
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Pick Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {picks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-sm text-gray-500">
                          No picks available for {selectedYear}.
                        </td>
                      </tr>
                    ) : (
                      picks.map((pick) => (
                        <tr key={`${pick.player_id}-${pick.pick_person_id}`}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {pick.player_name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {pick.draft_order}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {pick.pick_person_name || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {pick.pick_person_age || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                pick.pick_person_death_date
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {pick.pick_person_death_date ? 'Deceased' : 'Alive'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(pick.pick_timestamp)}
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