import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const endpoints = {
  players: {
    list: () => '/api/v1/deadpool/players',
    get: (id: string) => `/api/v1/deadpool/players/${id}`,
    update: (id: string) => `/api/v1/deadpool/players/${id}`,
  },
  people: {
    list: () => '/api/v1/deadpool/people',
    get: (id: string) => `/api/v1/deadpool/people/${id}`,
    update: (id: string) => `/api/v1/deadpool/people/${id}`,
  },
  draft: {
    order: () => '/api/v1/deadpool/draft-order',
    updateOrder: (playerId: string) => `/api/v1/deadpool/draft-order/${playerId}`,
    playerPicks: (playerId: string) => `/api/v1/deadpool/player-picks/${playerId}`,
    updatePick: (playerId: string) => `/api/v1/deadpool/player-picks/${playerId}`,
    allPicks: () => '/api/v1/deadpool/picks',
    nextDrafter: () => '/api/v1/deadpool/draft-next',
    submitPick: () => '/api/v1/deadpool/draft',
  },
  leaderboard: {
    get: (year?: number) => `/api/v1/deadpool/leaderboard${year ? `?year=${year}` : ''}`,
  },
};
