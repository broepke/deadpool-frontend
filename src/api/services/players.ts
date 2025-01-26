import { apiClient } from '../client';
import { Player, PlayerUpdate } from '../types';

const BASE_PATH = '/api/v1/deadpool/players';

export const playersApi = {
  // Get all players for a given year
  getAll: async (year?: number): Promise<Player[]> => {
    return apiClient.get<Player[]>(BASE_PATH, { year });
  },

  // Get a single player by ID
  getById: async (playerId: string, year?: number): Promise<Player> => {
    return apiClient.get<Player>(`${BASE_PATH}/${playerId}`, { year });
  },

  // Update or create a player
  update: async (playerId: string, data: PlayerUpdate): Promise<Player[]> => {
    return apiClient.put<Player[]>(`${BASE_PATH}/${playerId}`, data);
  },

  // Get player's picks
  getPlayerPicks: async (playerId: string, year?: number): Promise<Player> => {
    return apiClient.get<Player>(`/api/v1/deadpool/player-picks/${playerId}`, { year });
  },

  // Update player's pick
  updatePlayerPick: async (playerId: string, data: { person_id: string; year: number }): Promise<Player> => {
    return apiClient.put<Player>(`/api/v1/deadpool/player-picks/${playerId}`, data);
  },

  // Update player's draft order
  updateDraftOrder: async (playerId: string, year: number, draftOrder: number): Promise<Player[]> => {
    return apiClient.put<Player[]>(
      `/api/v1/deadpool/draft-order/${playerId}`, 
      null, 
      { year, draft_order: draftOrder }
    );
  }
};