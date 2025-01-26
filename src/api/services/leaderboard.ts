import { apiClient } from '../client';
import { ApiResponse, LeaderboardEntry } from '../types';

const BASE_PATH = '/api/v1/deadpool/leaderboard';

export const leaderboardApi = {
  // Get the leaderboard for a specific year
  // Players are scored based on their dead celebrity picks:
  // Score = sum of (50 + (100 - Age)) for each dead celebrity
  getLeaderboard: async (year?: number): Promise<ApiResponse<LeaderboardEntry[]>> => {
    return apiClient.get<ApiResponse<LeaderboardEntry[]>>(BASE_PATH, { year });
  }
};