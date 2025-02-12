// Define the union type of all possible event names
export type AnalyticsEventName =
  | 'PAGE_VIEW'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'DRAFT_PICK'
  | 'DRAFT_PICK_SUBMIT'
  | 'DRAFT_PICK_ERROR'
  | 'DRAFT_COMPLETE'
  | 'LEADERBOARD_VIEW'
  | 'LEADERBOARD_FILTER'
  | 'LEADERBOARD_SORT'
  | 'PROFILE_UPDATE'
  | 'PROFILE_VIEW'
  | 'PLAYER_SELECT'
  | 'PLAYER_SEARCH'
  | 'PLAYER_FILTER'
  | 'PICKS_FILTER_CHANGED'
  | 'PICKS_ROW_CLICKED'
  | 'PICKS_LOAD_SUCCESS'
  | 'PICKS_LOAD_ERROR'
  | 'PICK_COUNTS_LOAD_SUCCESS'
  | 'PICK_COUNTS_LOAD_ERROR'
  | 'PEOPLE_FILTER_CHANGED'
  | 'PEOPLE_LOAD_SUCCESS'
  | 'PEOPLE_LOAD_ERROR'
  | 'PERSON_PICKS_LOAD_SUCCESS'
  | 'PERSON_PICKS_LOAD_ERROR'
  | 'FORM_SUBMIT'
  | 'FORM_ERROR'
  | 'ERROR_OCCURRED'
  | 'API_ERROR'
  | 'CLIENT_ERROR'
  | 'AUTH_ERROR'
  | 'PHONE_VERIFICATION_REQUESTED'
  | 'PHONE_VERIFICATION_COMPLETED'
  | 'PHONE_VERIFICATION_FAILED';

export const ANALYTICS_EVENTS: Record<AnalyticsEventName, string> = {
  // Page Views
  PAGE_VIEW: 'page_view',

  // User Events
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',

  // Draft Events
  DRAFT_PICK: 'draft_pick',
  DRAFT_PICK_SUBMIT: 'draft_pick_submit',
  DRAFT_PICK_ERROR: 'draft_pick_error',
  DRAFT_COMPLETE: 'draft_complete',

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
  PICK_COUNTS_LOAD_SUCCESS: 'pick_counts_load_success',
  PICK_COUNTS_LOAD_ERROR: 'pick_counts_load_error',

  // People Events
  PEOPLE_FILTER_CHANGED: 'people_filter_changed',
  PEOPLE_LOAD_SUCCESS: 'people_load_success',
  PEOPLE_LOAD_ERROR: 'people_load_error',
  PERSON_PICKS_LOAD_SUCCESS: 'person_picks_load_success',
  PERSON_PICKS_LOAD_ERROR: 'person_picks_load_error',

  // Form Events
  FORM_SUBMIT: 'form_submit',
  FORM_ERROR: 'form_error',

  // Error Events
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  CLIENT_ERROR: 'client_error',
  AUTH_ERROR: 'auth_error',

  // Phone Verification Events
  PHONE_VERIFICATION_REQUESTED: 'phone_verification_requested',
  PHONE_VERIFICATION_COMPLETED: 'phone_verification_completed',
  PHONE_VERIFICATION_FAILED: 'phone_verification_failed'
};

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

export interface PeopleEventProperties extends CommonEventProperties {
  total_people?: number;
  current_page_people?: number;
  deceased_count?: number;
  alive_count?: number;
  has_data?: boolean;
  filter_type?: string;
  value?: any;
  previous_value?: any;
  status_filter?: 'all' | 'deceased' | 'alive';
  page?: number;
  page_size?: number;
  previous_page?: number;
  new_page?: number;
}
