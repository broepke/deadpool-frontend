import { useEffect, useState, useCallback } from 'react';
import { picksApi } from '../../api';
import { PickDetail, PickCount } from '../../api/types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAnalytics } from '../../services/analytics/provider';

const AVAILABLE_YEARS = [2025, 2024, 2023];

export default function PicksPage() {
  const analytics = useAnalytics();
  const [picks, setPicks] = useState<PickDetail[]>([]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [picksLoading, setPicksLoading] = useState(true);
  const [pickCountsLoading, setPickCountsLoading] = useState(true);
  const [pickCounts, setPickCounts] = useState<PickCount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [picksCountError, setPicksCountError] = useState<string | null>(null);

  const handleYearChange = useCallback((year: number) => {
    analytics.trackEvent('PICKS_FILTER_CHANGED', {
      filter_type: 'year',
      value: year,
      previous_value: selectedYear,
      total_years_available: AVAILABLE_YEARS.length
    });
    setSelectedYear(year);
  }, [analytics, selectedYear]);

  const handlePickClick = useCallback((pick: PickDetail) => {
    analytics.trackEvent('PICKS_ROW_CLICKED', {
      player_id: pick.player_id,
      pick_person_id: pick.pick_person_id,
      pick_status: pick.pick_person_death_date ? 'deceased' : 'alive',
      year: selectedYear
    });
  }, [analytics, selectedYear]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setPicksLoading(true);
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

        // Calculate pick statistics
        const totalPicks = sortedPicks.length;
        const deceasedPicks = sortedPicks.filter(pick => pick.pick_person_death_date).length;
        const alivePicks = totalPicks - deceasedPicks;
        const averageAge = sortedPicks.reduce((sum, pick) => sum + (pick.pick_person_age || 0), 0) / totalPicks;

        // Track successful picks load with statistics
        analytics.trackEvent('PICKS_LOAD_SUCCESS', {
          year: selectedYear,
          total_picks: totalPicks,
          deceased_picks: deceasedPicks,
          alive_picks: alivePicks,
          average_age: Math.round(averageAge),
          has_data: totalPicks > 0
        });
      } catch (err) {
        console.error('Failed to fetch picks:', err);
        const errorMessage = 'Failed to load picks. Please try again later.';
        setError(errorMessage);

        // Track error with picks-specific event
        analytics.trackEvent('PICKS_LOAD_ERROR', {
          error_type: 'api_error',
          error_message: errorMessage,
          endpoint: 'getAll',
          year: selectedYear,
          component: 'PicksPage'
        });
      } finally {
        setPicksLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, analytics]);

  // Separate effect for fetching pick counts
  useEffect(() => {
    const fetchPickCounts = async () => {
      try {
        setPickCountsLoading(true);
        const response = await picksApi.getPickCounts(selectedYear);
        setPickCounts(response.data);
        setPicksCountError(null);

        analytics.trackEvent('PICK_COUNTS_LOAD_SUCCESS', {
          year: selectedYear,
          total_players: response.data.length
        });
      } catch (err) {
        console.error('Failed to fetch pick counts:', err);
        const errorMessage = 'Failed to load pick counts. Please try again later.';
        setPicksCountError(errorMessage);

        analytics.trackEvent('PICK_COUNTS_LOAD_ERROR', {
          error_type: 'api_error',
          error_message: errorMessage,
          endpoint: 'getPickCounts',
          year: selectedYear,
          component: 'PicksPage'
        });
      } finally {
        setPickCountsLoading(false);
      }
    };

    fetchPickCounts();
  }, [selectedYear, analytics]);

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
            onChange={(e) => handleYearChange(Number(e.target.value))}
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
      
      {picksLoading ? (
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
                        <tr
                          key={`${pick.player_id}-${pick.pick_person_id}`}
                          onClick={() => handlePickClick(pick)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
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

      {/* Pick Counts Table */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pick Counts by Player</h2>
        {pickCountsLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : picksCountError ? (
          <div className="text-center text-red-600">{picksCountError}</div>
        ) : (
          <div className="flow-root">
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
                          Number of Picks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {pickCounts.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="text-center py-4 text-sm text-gray-500">
                            No pick counts available for {selectedYear}.
                          </td>
                        </tr>
                      ) : (
                        pickCounts.map((count) => (
                          <tr key={count.player_id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {count.player_name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {count.pick_count}
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
    </div>
  );
}
