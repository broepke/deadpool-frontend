import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api, endpoints } from '../../api/config';

interface LeaderboardPlayer {
  player_id: string;
  player_name: string;
  score: number;
}

interface LeaderboardResponse {
  message: string;
  data: LeaderboardPlayer[];
}

export default function LeaderboardPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', selectedYear],
    queryFn: async () => {
      const response = await api.get<LeaderboardResponse>(endpoints.leaderboard.get(selectedYear));
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  const years = Array.from(
    { length: currentYear - 2023 + 1 },
    (_, i) => currentYear - i
  );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Leaderboard
          </h2>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="block w-32 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Rank
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Player
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {leaderboardData?.data.map((player, index) => (
              <tr key={player.player_id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {index + 1}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {player.player_name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {player.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
