import { apiClient } from '../client';
import { ApiResponse, PickDetail } from '../types';

const BASE_PATH = '/api/v1/deadpool/picks';

export const picksApi = {
  // Get all picks for a given year with player and picked person details
  getAll: async (year: number): Promise<ApiResponse<PickDetail[]>> => {
    return apiClient.get<ApiResponse<PickDetail[]>>(BASE_PATH, { year });
  }
};