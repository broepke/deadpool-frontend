import { apiClient } from '../client';

export interface OverviewResponse {
  message: string;
  data: {
    total_players: number;
    total_picks: number;
    total_deceased: number;
    average_pick_age: number;
    most_popular_age_range: string;
    most_successful_age_range: string;
    pick_success_rate: number;
    age_distribution: {
      [age_range: string]: {
        count: number;
        deceased: number;
      };
    };
    updated_at: string;
    year: number;
  };
}

export interface TimeAnalyticsResponse {
  message: string;
  data: Array<{
    period: string;
    pick_count: number;
    death_count: number;
    success_rate: number;
    average_age: number;
    timestamp: string;
  }>;
  metadata: {
    total_periods: number;
    total_picks: number;
    total_deaths: number;
    overall_success_rate: number;
    average_picks_per_period: number;
    period_type: string;
    year: number;
  };
}

export interface DemographicsResponse {
  message: string;
  data: Array<{
    range: string;
    pick_count: number;
    death_count: number;
    success_rate: number;
    average_score: number;
  }>;
  metadata: {
    total_picks: number;
    total_deaths: number;
    overall_success_rate: number;
    most_popular_range: string;
    most_successful_range: string;
    year: number;
    updated_at: string;
  };
}

export interface PlayerAnalyticsResponse {
  message: string;
  data: Array<{
    player_id: string;
    player_name: string;
    preferred_age_ranges: string[];
    pick_timing_pattern: string;
    success_rate: number;
    score_progression: number[];
  }>;
  metadata: {
    year: number;
    total_players: number;
    total_picks: number;
    total_deaths: number;
    overall_success_rate: number;
    updated_at: string;
  };
}

export const getOverview = async (year?: number) => {
  return apiClient.get<OverviewResponse>('/api/v1/deadpool/reporting/overview', {
    year: year ? Number(year) : undefined
  });
};

export const getTimeAnalytics = async (year?: number, period: 'daily' | 'weekly' | 'monthly' = 'monthly') => {
  return apiClient.get<TimeAnalyticsResponse>('/api/v1/deadpool/reporting/trends/time', {
    year: year ? Number(year) : undefined,
    period
  });
};

export const getDemographics = async (year?: number) => {
  return apiClient.get<DemographicsResponse>('/api/v1/deadpool/reporting/trends/demographics', {
    year: year ? Number(year) : undefined
  });
};

export const getPlayerAnalytics = async (playerId?: string, year?: number) => {
  return apiClient.get<PlayerAnalyticsResponse>('/api/v1/deadpool/reporting/player-analytics', {
    player_id: playerId,
    year: year ? Number(year) : undefined
  });
};