export const ANALYTICS_EVENTS = {
  // Page Views
  PAGE_VIEW: 'page_view',

  // User Events
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',

  // Draft Events
  DRAFT_PICK: 'draft_pick',
  DRAFT_PICK_SUBMIT: 'draft_pick_submit',
  DRAFT_PICK_ERROR: 'draft_pick_error',

  // Leaderboard Events
  LEADERBOARD_VIEW: 'leaderboard_view',
  LEADERBOARD_FILTER: 'leaderboard_filter',
  LEADERBOARD_SORT: 'leaderboard_sort',

  // Profile Events
  PROFILE_UPDATE: 'profile_update',
  PROFILE_VIEW: 'profile_view',

  // Player Events
  PLAYER_SELECT: 'player_select',
  PLAYER_SEARCH: 'player_search',
  PLAYER_FILTER: 'player_filter',

  // Picks Events
  PICKS_FILTER_CHANGED: 'picks_filter_changed',
  PICKS_ROW_CLICKED: 'picks_row_clicked',
  PICKS_LOAD_SUCCESS: 'picks_load_success',
  PICKS_LOAD_ERROR: 'picks_load_error',

  // Form Events
  FORM_SUBMIT: 'form_submit',
  FORM_ERROR: 'form_error',

  // Error Events
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  CLIENT_ERROR: 'client_error',
  AUTH_ERROR: 'auth_error'
} as const;

// Type for event names
export type AnalyticsEventName = keyof typeof ANALYTICS_EVENTS;

// Common property types
export interface CommonEventProperties {
  timestamp?: string;
  userId?: string;
  page_path?: string;
  environment?: string;
}

// Event-specific property interfaces
export interface DraftPickEventProperties extends CommonEventProperties {
  player_id: string;
  round: number;
  position: string;
  draft_status: string;
}

export interface LeaderboardEventProperties extends CommonEventProperties {
  filters_applied?: Record<string, any>;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface PicksEventProperties extends CommonEventProperties {
  year: number;
  total_picks?: number;
  deceased_picks?: number;
  alive_picks?: number;
  average_age?: number;
  has_data?: boolean;
  filter_type?: string;
  value?: any;
  previous_value?: any;
  player_id?: string;
  pick_person_id?: string;
  pick_status?: 'alive' | 'deceased';
}

export interface ErrorEventProperties extends CommonEventProperties {
  error_type: string;
  error_message: string;
  error_code?: number | string;
  error_stack?: string;
}