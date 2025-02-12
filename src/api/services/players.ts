import { apiClient } from '../client';
import {
  ApiResponse,
  Player,
  PlayerUpdate,
  PickDetail,
  PhoneVerificationRequest,
  PhoneVerificationResponse,
  PhoneCodeVerificationRequest,
  PhoneCodeVerificationResponse
} from '../types';

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

  // Update player profile
  update: async (playerId: string, data: PlayerUpdate): Promise<ApiResponse<void>> => {
    return apiClient.put<ApiResponse<void>>(`${BASE_PATH}/${playerId}/profile`, data);
  },

  // Get player's picks with their details
  getPlayerPicks: async (playerId: string, year?: number): Promise<ApiResponse<PickDetail[]>> => {
    return apiClient.get<ApiResponse<PickDetail[]>>(`/api/v1/deadpool/player-picks/${playerId}`, { year });
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
  },

  // Request phone verification code
  requestPhoneVerification: async (playerId: string, data: PhoneVerificationRequest): Promise<ApiResponse<PhoneVerificationResponse>> => {
    return apiClient.post<ApiResponse<PhoneVerificationResponse>>(
      `${BASE_PATH}/${playerId}/phone/request-verification`,
      data
    );
  },

  // Verify phone number with code
  verifyPhoneCode: async (playerId: string, data: PhoneCodeVerificationRequest): Promise<ApiResponse<PhoneCodeVerificationResponse>> => {
    return apiClient.post<ApiResponse<PhoneCodeVerificationResponse>>(
      `${BASE_PATH}/${playerId}/phone/verify`,
      data
    );
  }
};