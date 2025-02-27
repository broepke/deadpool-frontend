import React, { useMemo } from 'react';
import { SearchResult, PickDetail } from '../../api/types';
import { LoadingSpinner } from './LoadingSpinner';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error?: string;
  metadata: {
    total: number;
    limit: number;
    offset: number;
  };
  onPageChange: (offset: number) => void;
  onFetchPicks: (personId: string) => void;
  personPicks: {
    [personId: string]: {
      picks: PickDetail[] | null;
      loading: boolean;
      error: string | null;
      visible: boolean;
    }
  };
}

export function SearchResults({
  results,
  isLoading,
  error,
  metadata,
  onPageChange,
  onFetchPicks,
  personPicks
}: SearchResultsProps) {
  const currentPage = useMemo(() => 
    Math.floor(metadata.offset / metadata.limit) + 1,
    [metadata.offset, metadata.limit]
  );

  const totalPages = useMemo(() => 
    Math.ceil(metadata.total / metadata.limit),
    [metadata.total, metadata.limit]
  );

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
        No results found.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="overflow-hidden shadow ring-1 ring-black dark:ring-gray-700 ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">
                Name
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Type
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Status
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Match Score
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Details
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Picks
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {results.map((result) => (
              <React.Fragment key={result.id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                    {result.attributes.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        result.attributes.status === 'deceased'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      }`}
                    >
                      {result.attributes.status.charAt(0).toUpperCase() + result.attributes.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {(result.score * 100).toFixed(1)}%
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {result.type === 'people' ? (
                      <>
                        Age: {result.attributes.metadata.Age || 'N/A'}
                        <br />
                        Birth: {formatDate(result.attributes.metadata.BirthDate)}
                        {result.attributes.status === 'deceased' && (
                          <>
                            <br />
                            Death: {formatDate(result.attributes.metadata.DeathDate)}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        Draft Order: {result.attributes.metadata.draft_order || 'N/A'}
                        <br />
                        Has Phone: {result.attributes.metadata.has_phone ? 'Yes' : 'No'}
                      </>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <button
                      onClick={() => onFetchPicks(result.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
                    >
                      {personPicks[result.id]?.loading ? (
                        <LoadingSpinner size="sm" />
                      ) : personPicks[result.id]?.visible ? (
                        'Hide Picks'
                      ) : (
                        'Show Picks'
                      )}
                    </button>
                  </td>
                </tr>
                {personPicks[result.id]?.visible && (
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td colSpan={6} className="px-6 py-4">
                      {personPicks[result.id]?.error ? (
                        <div className="text-red-600 dark:text-red-400 text-sm">{personPicks[result.id].error}</div>
                      ) : personPicks[result.id]?.picks?.length === 0 ? (
                        <div className="text-gray-500 dark:text-gray-400 text-sm">No picks found for this person.</div>
                      ) : (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Picks for {result.attributes.name}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {personPicks[result.id]?.picks?.map((pick) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(0, metadata.offset - metadata.limit))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(metadata.offset + metadata.limit)}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{metadata.offset + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(metadata.offset + metadata.limit, metadata.total)}
                </span>{' '}
                of <span className="font-medium">{metadata.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(Math.max(0, metadata.offset - metadata.limit))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => onPageChange(metadata.offset + metadata.limit)}
                  disabled={currentPage === totalPages}
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
  );
}

export default SearchResults;