import { useState } from 'react';

interface DraftPlayer {
  id: string;
  name: string;
  picksRemaining: number;
  isCurrentTurn: boolean;
}

interface DraftPick {
  id: string;
  playerName: string;
  celebrityName: string;
  pickNumber: number;
  timestamp: string;
}

export default function DraftPage() {
  const [draftStatus, setDraftStatus] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');
  const [players, setPlayers] = useState<DraftPlayer[]>([]);
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [currentPick, setCurrentPick] = useState('');

  const handleStartDraft = () => {
    // TODO: Implement draft start logic
    setDraftStatus('in_progress');
  };

  const handleSubmitPick = () => {
    if (!currentPick.trim()) return;
    // TODO: Implement pick submission logic
    setCurrentPick('');
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Draft Room</h1>
          <p className="mt-2 text-sm text-gray-700">
            Make your celebrity picks in turn order.
          </p>
        </div>
        {draftStatus === 'not_started' && (
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStartDraft}
            >
              Start Draft
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Draft Status and Current Turn */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900">Draft Status</h2>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status:</span>
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                draftStatus === 'completed' ? 'bg-green-100 text-green-800' :
                draftStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {draftStatus.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            {draftStatus === 'in_progress' && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">Current Turn</h3>
                {players.map(player => (
                  <div
                    key={player.id}
                    className={`mt-2 p-2 rounded-md ${
                      player.isCurrentTurn ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{player.name}</span>
                      <span className="text-sm text-gray-500">
                        {player.picksRemaining} picks remaining
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pick Submission */}
        {draftStatus === 'in_progress' && (
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900">Make Your Pick</h2>
            <div className="mt-4">
              <div>
                <label htmlFor="celebrity" className="block text-sm font-medium text-gray-700">
                  Celebrity Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="celebrity"
                    id="celebrity"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={currentPick}
                    onChange={(e) => setCurrentPick(e.target.value)}
                    placeholder="Enter celebrity name"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={handleSubmitPick}
                  disabled={!currentPick.trim()}
                >
                  Submit Pick
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Draft History */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Draft History</h2>
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Pick #
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Player
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Celebrity
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {picks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-sm text-gray-500">
                    No picks made yet.
                  </td>
                </tr>
              ) : (
                picks.map((pick) => (
                  <tr key={pick.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {pick.pickNumber}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {pick.playerName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {pick.celebrityName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(pick.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}