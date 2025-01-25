import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '../../api/config';

export default function DraftPage() {
  // Mock data for development
  const mockNextDrafter = { id: 1, name: 'Player 1' };
  const mockPicks = [
    { id: 1, player_name: 'Player 1', celebrity_name: 'Celebrity A' },
    { id: 2, player_name: 'Player 2', celebrity_name: 'Celebrity B' },
  ];
  const mockPeople = [
    { id: 1, name: 'Celebrity A', age: 65 },
    { id: 2, name: 'Celebrity B', age: 70 },
    { id: 3, name: 'Celebrity C', age: 75 },
  ];

  const { data: nextDrafter, isLoading: isLoadingNext } = useQuery({
    queryKey: ['nextDrafter'],
    queryFn: async () => mockNextDrafter,
    staleTime: Infinity,
  });

  const { data: picks, isLoading: isLoadingPicks } = useQuery({
    queryKey: ['picks'],
    queryFn: async () => mockPicks,
    staleTime: Infinity,
  });

  const { data: people, isLoading: isLoadingPeople } = useQuery({
    queryKey: ['people'],
    queryFn: async () => mockPeople,
    staleTime: Infinity,
  });

  if (isLoadingNext || isLoadingPicks || isLoadingPeople) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Current Draft Status
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Next drafter: {nextDrafter?.name || 'Draft Complete'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Draft Picks
          </h3>
          <div className="mt-4 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Pick #
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Player
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Celebrity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {picks?.map((pick: any, index: number) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {pick.player_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {pick.celebrity_name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {nextDrafter && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Available Celebrities
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {people?.map((person: any) => (
                <div
                  key={person.id}
                  className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{person.name}</p>
                    <p className="truncate text-sm text-gray-500">Age: {person.age}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
