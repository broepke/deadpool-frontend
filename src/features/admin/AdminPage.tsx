import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '../../api/config';

export default function AdminPage() {
  const queryClient = useQueryClient();

  // Mock data for development
  const mockPeople = [
    { id: '1', name: 'Celebrity A', age: 65, status: 'Alive' },
    { id: '2', name: 'Celebrity B', age: 70, status: 'Alive' },
    { id: '3', name: 'Celebrity C', age: 75, status: 'Alive' },
  ];

  const mockDraftOrder = [
    { id: '1', name: 'Player 1' },
    { id: '2', name: 'Player 2' },
    { id: '3', name: 'Player 3' },
  ];

  const { data: people, isLoading: isLoadingPeople } = useQuery({
    queryKey: ['people'],
    queryFn: async () => mockPeople,
    staleTime: Infinity,
  });

  const updatePersonMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Mock mutation - in reality this would update the backend
      console.log('Updating person:', { id, data });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });

  const { data: draftOrder, isLoading: isLoadingDraft } = useQuery({
    queryKey: ['draftOrder'],
    queryFn: async () => mockDraftOrder,
    staleTime: Infinity,
  });

  if (isLoadingPeople || isLoadingDraft) {
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
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Celebrity Management
          </h3>
          <div className="mt-4 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Age
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {people?.map((person: any) => (
                      <tr key={person.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {person.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.age}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.status || 'Alive'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <button
                            onClick={() => {
                              if (window.confirm('Mark as deceased?')) {
                                updatePersonMutation.mutate({
                                  id: person.id,
                                  data: { ...person, status: 'Deceased' },
                                });
                              }
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Update Status
                          </button>
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

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Draft Order
          </h3>
          <div className="mt-4">
            <ul role="list" className="divide-y divide-gray-100">
              {draftOrder?.map((player: any, index: number) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between gap-x-6 py-5"
                >
                  <div className="flex gap-x-4">
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        {index + 1}. {player.name}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
