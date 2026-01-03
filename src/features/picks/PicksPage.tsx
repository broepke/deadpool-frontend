import { useEffect, useState, useCallback } from 'react';
import { picksApi, playersApi } from '../../api';
import { PickDetail, Player, PaginationMeta } from '../../api/types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAnalytics } from '../../services/analytics/provider';

const AVAILABLE_YEARS = [2026, 2025, 2024, 2023];
const PAGE_SIZE = 10;

export default function PicksPage() {
  const analytics = useAnalytics();
  const [picks, setPicks] = useState<PickDetail[]>([]);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [picksLoading, setPicksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const handleYearChange = useCallback((year: number) => {
    analytics.trackEvent('PICKS_FILTER_CHANGED', {
      filter_type: 'year',
      value: year,
      previous_value: selectedYear,
      total_years_available: AVAILABLE_YEARS.length
    });
    setCurrentPage(1); // Reset to first page when year changes
    setSelectedYear(year);
  }, [analytics, selectedYear]);

  const handlePlayerChange = useCallback((playerId: string | null) => {
    setCurrentPage(1); // Reset to first page when player changes
    analytics.trackEvent('PICKS_FILTER_CHANGED', {
      filter_type: 'player',
      value: playerId,
      previous_value: selectedPlayer
    });
    setSelectedPlayer(playerId);
  }, [analytics, selectedPlayer]);

  // Fetch players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setPlayersLoading(true);
        const response = await playersApi.getAll(selectedYear);
        setPlayers(response.data);
      } catch (err) {
        console.error('Failed to fetch players:', err);
        analytics.trackEvent('API_ERROR', {
          error_type: 'api_error',
          endpoint: 'getAll',
          year: selectedYear,
          component: 'PicksPage'
        });
      } finally {
        setPlayersLoading(false);
      }
    };

    fetchPlayers();
  }, [selectedYear, analytics]);

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
        console.log(`Fetching picks data for page ${currentPage}, year ${selectedYear}, player ${selectedPlayer || 'all'}`);
        setPicksLoading(true);
        
        const params = {
          year: selectedYear,
          page: currentPage,
          page_size: PAGE_SIZE
        };
        
        console.log('Request params:', params);
        
        const response = selectedPlayer
          ? await picksApi.getPlayerPicks(selectedPlayer, params)
          : await picksApi.getAll(params);
        
        setPicks(response.data);
        
        // Set pagination metadata if available
        if (response.total !== undefined &&
            response.page !== undefined &&
            response.page_size !== undefined &&
            response.total_pages !== undefined) {
          
          console.log('Pagination metadata received:', {
            total: response.total,
            page: response.page,
            page_size: response.page_size,
            total_pages: response.total_pages
          });
          
          // Verify the returned page matches the requested page
          if (response.page !== currentPage) {
            console.warn(`Page mismatch: requested page ${currentPage} but received page ${response.page}`);
            // Update currentPage to match what the API returned to keep UI in sync
            setCurrentPage(response.page);
          }
          
          setPaginationMeta({
            total: response.total,
            page: response.page,
            page_size: response.page_size,
            total_pages: response.total_pages
          });
        } else {
          console.warn('No pagination metadata received in response');
          setPaginationMeta(null);
        }
        setError(null);

        // Calculate statistics for the current page
        const currentPagePicks = response.data.length;
        const deceasedPicks = response.data.filter((pick: PickDetail) => pick.pick_person_death_date).length;
        const alivePicks = currentPagePicks - deceasedPicks;
        const averageAge = currentPagePicks > 0
          ? response.data.reduce((sum: number, pick: PickDetail) => sum + (pick.pick_person_age || 0), 0) / currentPagePicks
          : 0;

        // Track successful picks load with statistics
        analytics.trackEvent('PICKS_LOAD_SUCCESS', {
          year: selectedYear,
          total_picks: response.total || 0,
          current_page_picks: currentPagePicks,
          deceased_picks: deceasedPicks,
          alive_picks: alivePicks,
          average_age: Math.round(averageAge),
          has_data: currentPagePicks > 0,
          page: response.page,
          page_size: PAGE_SIZE
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
  }, [selectedYear, selectedPlayer, currentPage, analytics]);

  const handlePageChange = useCallback((newPage: number) => {
    // Ensure newPage is a number and different from current page
    const pageToSet = Number(newPage);
    if (pageToSet === currentPage) {
      console.log('Attempted to set same page number, ignoring:', pageToSet);
      return;
    }
    
    console.log(`Changing page from ${currentPage} to ${pageToSet}`);
    
    analytics.trackEvent('PICKS_FILTER_CHANGED', {
      filter_type: 'page',
      previous_page: currentPage,
      new_page: pageToSet,
      year: selectedYear,
      page_size: PAGE_SIZE
    });
    
    setCurrentPage(pageToSet);
  }, [analytics, currentPage, selectedYear]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    // Parse the date and display it in UTC to show the actual date the pick was made
    // This avoids timezone confusion where a pick made on 1/1/26 UTC shows as 12/31/25 in EST
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      year: '2-digit',
      month: 'numeric',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Celebrity Picks</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all celebrity picks and their current status.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-4">
          <div className="flex gap-4">
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              {AVAILABLE_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {playersLoading ? (
              <div className="w-48 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <select
                value={selectedPlayer || ''}
                onChange={(e) => handlePlayerChange(e.target.value || null)}
                className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">All Players</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            )}
          </div>
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
              <div className="overflow-hidden shadow ring-1 ring-black dark:ring-gray-700 ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">
                        Player
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Draft Order
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Celebrity
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Age
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Pick Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {picks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                          No picks available for {selectedYear}.
                        </td>
                      </tr>
                    ) : (
                      picks.map((pick) => (
                        <tr
                          key={`${pick.player_id}-${pick.pick_person_id}`}
                          onClick={() => handlePickClick(pick)}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                            {pick.player_name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {pick.draft_order}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {pick.pick_person_name || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {pick.pick_person_age || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                pick.pick_person_death_date
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              }`}
                            >
                              {pick.pick_person_death_date ? 'Deceased' : 'Alive'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
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
          
          {/* Pagination Controls */}
          {paginationMeta && (
            <div className="mt-4 flex items-center justify-between border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 shadow ring-1 ring-black dark:ring-gray-700 ring-opacity-5 rounded-lg">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || picksLoading}
                  className="relative inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(paginationMeta.total_pages, currentPage + 1))}
                  disabled={currentPage === paginationMeta.total_pages || picksLoading}
                  className="relative ml-3 inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{((paginationMeta.page - 1) * paginationMeta.page_size) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(paginationMeta.page * paginationMeta.page_size, paginationMeta.total)}
                    </span> of{' '}
                    <span className="font-medium">{paginationMeta.total}</span> results
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Page <span className="font-medium">{paginationMeta.page}</span> of <span className="font-medium">{paginationMeta.total_pages}</span>
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    {/* First Page Button */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1 || picksLoading}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">First</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M15.79 14.77a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L11.832 10l3.938 3.71a.75.75 0 01.02 1.06zm-6 0a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L5.832 10l3.938 3.71a.75.75 0 01.02 1.06z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || picksLoading}
                      className="relative inline-flex items-center px-2 py-2 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {/* Page Number Display */}
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-offset-0">
                      {picksLoading ? (
                        <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mx-2"></div>
                      ) : (
                        paginationMeta.page
                      )}
                    </span>
                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(Math.min(paginationMeta.total_pages, currentPage + 1))}
                      disabled={currentPage === paginationMeta.total_pages || picksLoading}
                      className="relative inline-flex items-center px-2 py-2 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {/* Last Page Button */}
                    <button
                      onClick={() => handlePageChange(paginationMeta.total_pages)}
                      disabled={currentPage === paginationMeta.total_pages || picksLoading}
                      className="relative inline-flex items-center px-2 py-2 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Last</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.21 5.23a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L8.168 10 4.23 6.29a.75.75 0 01-.02-1.06zm6 0a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L14.168 10 10.23 6.29a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Direct Page Input */}
                    <div className="relative ml-3 inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700">
                      <span className="mr-2">Go to:</span>
                      <input
                        type="number"
                        min={1}
                        max={paginationMeta.total_pages}
                        value={currentPage}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 1 && value <= paginationMeta.total_pages) {
                            handlePageChange(value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const value = parseInt((e.target as HTMLInputElement).value);
                            if (!isNaN(value) && value >= 1 && value <= paginationMeta.total_pages) {
                              handlePageChange(value);
                            }
                          }
                        }}
                        className="w-12 rounded-md border-0 py-1 pl-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                        disabled={picksLoading}
                      />
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
