import { apiClient } from '../client';
import { ApiResponse, PickDetail, PaginationParams } from '../types';

const BASE_PATH = '/api/v1/deadpool/picks';

export const picksApi = {
  /**
   * Get picks by person ID with optional filtering and pagination
   * @param personId The ID of the person to get picks for
   * @param params Optional parameters including year (defaults to current year),
   * limit, page (default=1), and page_size (default=10)
   */
  getPicksByPerson: async (personId: string, params?: Omit<PaginationParams, 'player_id'>): Promise<ApiResponse<PickDetail[]>> => {
    return apiClient.get<ApiResponse<PickDetail[]>>(`${BASE_PATH}/by-person/${personId}`, params);
  },

  /**
   * Get all picks with optional filtering and pagination
   * @param params Optional parameters including year (defaults to current year), 
   * limit, page (default=1), and page_size (default=10)
   */
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PickDetail[]>> => {
    return apiClient.get<ApiResponse<PickDetail[]>>(BASE_PATH, params);
  },

  /**
   * Get picks for a specific player with optional filtering and pagination
   * @param playerId The ID of the player to get picks for
   * @param params Optional parameters including year (defaults to current year),
   * limit, page (default=1), and page_size (default=10)
   */
  getPlayerPicks: async (playerId: string, params?: Omit<PaginationParams, 'player_id'>): Promise<ApiResponse<PickDetail[]>> => {
    return apiClient.get<ApiResponse<PickDetail[]>>(`${BASE_PATH}/${playerId}`, params);
  }
};
