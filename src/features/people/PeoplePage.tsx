import React, { useEffect, useState, useCallback } from 'react';
import { peopleApi, picksApi } from '../../api';
import { Person, PaginationMeta, PickDetail } from '../../api/types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAnalytics } from '../../services/analytics/provider';

type StatusFilter = 'all' | 'deceased' | 'alive';

interface PersonPicks {
  [personId: string]: {
    picks: PickDetail[] | null;
    loading: boolean;
    error: string | null;
    visible: boolean;
  }
}

export default function PeoplePage() {
  const analytics = useAnalytics();
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [personPicks, setPersonPicks] = useState<PersonPicks>({});

  const handleFetchPicks = useCallback(async (personId: string) => {
    // If picks are already visible, hide them
    if (personPicks[personId]?.visible) {
      setPersonPicks(prev => ({
        ...prev,
        [personId]: { ...prev[personId], visible: false }
      }));
      return;
    }

    // If we already have the picks data, just show it
    if (personPicks[personId]?.picks) {
      setPersonPicks(prev => ({
        ...prev,
        [personId]: { ...prev[personId], visible: true }
      }));
      return;
    }

    // Initialize loading state
    setPersonPicks(prev => ({
      ...prev,
      [personId]: { picks: null, loading: true, error: null, visible: true }
    }));

    try {
      const response = await picksApi.getPicksByPerson(personId);
      
      analytics.trackEvent('PERSON_PICKS_LOAD_SUCCESS', {
        person_id: personId,
        picks_count: response.data.length
      });

      setPersonPicks(prev => ({
        ...prev,
        [personId]: {
          picks: response.data,
          loading: false,
          error: null,
          visible: true
        }
      }));
    } catch (err) {
      console.error('Failed to fetch picks:', err);
      const errorMessage = 'Failed to load picks. Please try again.';
      
      analytics.trackEvent('PERSON_PICKS_LOAD_ERROR', {
        person_id: personId,
        error_type: 'api_error',
        error_message: errorMessage
      });

      setPersonPicks(prev => ({
        ...prev,
        [personId]: {
          picks: null,
          loading: false,
          error: errorMessage,
          visible: true
        }
      }));
    }
  }, [analytics, personPicks]);

  const handleStatusChange = useCallback((status: StatusFilter) => {
    analytics.trackEvent('PEOPLE_FILTER_CHANGED', {
      filter_type: 'status',
      value: status,
      previous_value: selectedStatus
    });
    setCurrentPage(1); // Reset to first page when status changes
    setSelectedStatus(status);
  }, [analytics, selectedStatus]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          page_size: pageSize,
          ...(selectedStatus !== 'all' && { status: selectedStatus })
        };
        
        const paginatedResponse = await peopleApi.getAll(params);
        setPeople(paginatedResponse.data);

        // Set pagination metadata
        setPaginationMeta({
          total: paginatedResponse.total,
          page: paginatedResponse.page,
          page_size: paginatedResponse.page_size,
          total_pages: paginatedResponse.total_pages
        });
        
        setError(null);

        // Calculate statistics for analytics
        const currentPagePeople = paginatedResponse.data.length;
        const deceasedCount = paginatedResponse.data.filter((person: Person) => person.status === 'deceased').length;
        const aliveCount = currentPagePeople - deceasedCount;

        // Track successful people load with statistics
        analytics.trackEvent('PEOPLE_LOAD_SUCCESS', {
          total_people: paginatedResponse.total,
          current_page_people: currentPagePeople,
          deceased_count: deceasedCount,
          alive_count: aliveCount,
          has_data: currentPagePeople > 0,
          page: currentPage,
          page_size: pageSize,
          status_filter: selectedStatus
        });
      } catch (err) {
        console.error('Failed to fetch people:', err);
        const errorMessage = 'Failed to load people. Please try again later.';
        setError(errorMessage);

        analytics.trackEvent('PEOPLE_LOAD_ERROR', {
          error_type: 'api_error',
          error_message: errorMessage,
          endpoint: 'getAll',
          component: 'PeoplePage'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedStatus, currentPage, pageSize, analytics]);

  const handlePageChange = useCallback((newPage: number) => {
    analytics.trackEvent('PEOPLE_FILTER_CHANGED', {
      filter_type: 'page',
      previous_page: currentPage,
      new_page: newPage,
      page_size: pageSize
    });
    setCurrentPage(newPage);
  }, [analytics, currentPage, pageSize]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">People</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all people and their current status.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value as StatusFilter)}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="all">All Statuses</option>
            <option value="alive">Alive</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="mt-8 text-center text-red-600 dark:text-red-400">{error}</div>
      ) : (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black dark:ring-gray-700 ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Age
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Birth Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Death Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Picks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {people.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                          No people found.
                        </td>
                      </tr>
                    ) : (
                      people.map((person) => (
                        <React.Fragment key={person.id}>
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                              {person.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  person.status === 'deceased'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                }`}
                              >
                                {person.status === 'deceased' ? 'Deceased' : 'Alive'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {person.metadata?.Age || 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(person.metadata?.BirthDate)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(person.metadata?.DeathDate)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              <button
                                onClick={() => handleFetchPicks(person.id)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
                              >
                                {personPicks[person.id]?.loading ? (
                                  <LoadingSpinner size="sm" />
                                ) : personPicks[person.id]?.visible ? (
                                  'Hide Picks'
                                ) : (
                                  'Show Picks'
                                )}
                              </button>
                            </td>
                          </tr>
                          {personPicks[person.id]?.visible && (
                            <tr className="bg-gray-50 dark:bg-gray-800">
                              <td colSpan={6} className="px-6 py-4">
                                {personPicks[person.id]?.error ? (
                                  <div className="text-red-600 dark:text-red-400 text-sm">{personPicks[person.id].error}</div>
                                ) : personPicks[person.id]?.picks?.length === 0 ? (
                                  <div className="text-gray-500 dark:text-gray-400 text-sm">No picks found for this person.</div>
                                ) : (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Picks for {person.name}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {personPicks[person.id]?.picks?.map((pick) => (
                                        <div key={pick.player_id} className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
                                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            Picked by {pick.player_name}
                                          </div>
                                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Draft Order: {pick.draft_order}
                                          </div>
                                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Pick Date: {new Date(pick.pick_timestamp || '').toLocaleDateString()}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
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
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(paginationMeta.total_pages, currentPage + 1))}
                  disabled={currentPage === paginationMeta.total_pages}
                  className="relative ml-3 inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, paginationMeta.total)}
                    </span> of{' '}
                    <span className="font-medium">{paginationMeta.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageChange(Math.min(paginationMeta.total_pages, currentPage + 1))}
                      disabled={currentPage === paginationMeta.total_pages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
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