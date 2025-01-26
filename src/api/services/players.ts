import { apiClient } from '../client';
import { ApiResponse, Player, PlayerUpdate } from '../types';

const BASE_PATH = '/api/v1/deadpool/players';

export const playersApi = {
  // Get all players for a given year
  getAll: async (year?: number): Promise<ApiResponse<Player[]>> => {
    return apiClient.get<ApiResponse<Player[]>>(BASE_PATH, { year });
  },

  // Get a single player by ID
  getById: async (playerId: string, year?: number): Promise<ApiResponse<Player>> => {
    return apiClient.get<ApiResponse<Player>>(`${BASE_PATH}/${playerId}`, { year });
  },

  // Update or create a player
  update: async (playerId: string, data: PlayerUpdate): Promise<ApiResponse<Player[]>> => {
    return apiClient.put<ApiResponse<Player[]>>(`${BASE_PATH}/${playerId}`, data);
  },

  // Get player's picks
  getPlayerPicks: async (playerId: string, year?: number): Promise<ApiResponse<Player>> => {
    return apiClient.get<ApiResponse<Player>>(`/api/v1/deadpool/player-picks/${playerId}`, { year });
  },

  // Update player's pick
  updatePlayerPick: async (playerId: string, data: { person_id: string; year: number }): Promise<ApiResponse<Player>> => {
    return apiClient.put<ApiResponse<Player>>(`/api/v1/deadpool/player-picks/${playerId}`, data);
  },

  // Update player's draft order
  updateDraftOrder: async (playerId: string, year: number, draftOrder: number): Promise<ApiResponse<Player[]>> => {
    return apiClient.put<ApiResponse<Player[]>>(
      `/api/v1/deadpool/draft-order/${playerId}`, 
      null, 
      { year, draft_order: draftOrder }
    );
  }
};