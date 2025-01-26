import { apiClient } from '../client';
import { ApiResponse, DraftRequest } from '../types';

const BASE_PATH = '/api/v1/deadpool/draft';

export const draftApi = {
  // Draft a person for the current year
  draftPerson: async (data: DraftRequest): Promise<ApiResponse<Record<string, any>>> => {
    return apiClient.post<ApiResponse<Record<string, any>>>(BASE_PATH, data);
  },

  // Get the next player who should draft
  getNextDrafter: async (): Promise<ApiResponse<Record<string, any>>> => {
    return apiClient.get<ApiResponse<Record<string, any>>>(`${BASE_PATH}-next`);
  }
};