import { useState } from 'react';

interface LeaderboardEntry {
  id: string;
  rank: number;
  playerName: string;
  score: number;
  picks: number;
  successfulPicks: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Leaderboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Current standings and scores for all players.
          </p>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Rank
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Player
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Score
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Picks
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Success Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-sm text-gray-500">
                        No players on the leaderboard yet.
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((entry) => (
                      <tr key={entry.id} className={entry.rank <= 3 ? 'bg-yellow-50' : undefined}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <span className={`
                            inline-flex items-center justify-center w-6 h-6 rounded-full
                            ${entry.rank === 1 ? 'bg-yellow-400 text-white' :
                              entry.rank === 2 ? 'bg-gray-300 text-gray-900' :
                              entry.rank === 3 ? 'bg-amber-700 text-white' :
                              'text-gray-900'}
                          `}>
                            {entry.rank}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {entry.playerName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {entry.score}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {entry.picks}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {((entry.successfulPicks / entry.picks) * 100).toFixed(1)}%
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
    </div>
  );
}