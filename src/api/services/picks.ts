import { apiClient } from '../client';
import { ApiResponse, PickDetail, PickCount, PaginationParams } from '../types';

const BASE_PATH = '/api/v1/deadpool/picks';

export const picksApi = {
  // Get pick counts for a given year
  getPickCounts: async (year: number): Promise<ApiResponse<PickCount[]>> => {
    return apiClient.get<ApiResponse<PickCount[]>>(`${BASE_PATH}-counts`, { year });
  },

  // Get picks for a given year with player and picked person details
  getAll: async (year: number, params?: Omit<PaginationParams, 'year'>): Promise<ApiResponse<PickDetail[]>> => {
    return apiClient.get<ApiResponse<PickDetail[]>>(BASE_PATH, {
      ...params,
      year
    });
  }
};
