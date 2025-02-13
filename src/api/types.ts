// Pagination Types
export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Base Response Types
export interface ApiResponse<T> {
  message: string;
  data: T;
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

// API Parameter Types
export interface PaginationParams {
  page?: number;
  page_size?: number;
  limit?: number;
  player_id?: string;  // Optional filter by player
  year?: number;       // Optional filter by year
}

// Player Types
export interface Player {
  id: string;
  name: string;
  draft_order: number;
  year: number;
  phone_number?: string;
  phone_verified?: boolean;
  sms_notifications_enabled?: boolean;
  phone_verification_id?: string;
  phone_verification_expires_at?: string;
  sns_subscription_status?: 'unsubscribed' | 'pending' | 'subscribed';
  sns_subscription_arn?: string;
  metadata?: Record<string, any>;
}

export interface PlayerUpdate {
  first_name?: string;
  last_name?: string;
  draft_order?: number;
  year?: number;
  phone_number?: string;
  phone_verified?: boolean;
  sms_notifications_enabled?: boolean;
  phone_verification_id?: string;
  phone_verification_expires_at?: string;
  sns_subscription_status?: 'unsubscribed' | 'pending' | 'subscribed';
  sns_subscription_arn?: string;
  metadata?: Record<string, any>;
}

// Phone Verification Types
export interface PhoneVerificationRequest {
  phone_number: string;
}

// SNS Types
export interface SnsSubscriptionRequest {
  phone_number: string;
}

export interface SnsSubscriptionResponse {
  subscription_status: 'pending' | 'subscribed';
  requires_confirmation: boolean;
  subscription_arn?: string;
}

export interface SnsConfirmationRequest {
  confirmation_code: string;
}

export interface SnsConfirmationResponse {
  subscription_status: 'subscribed';
  subscription_arn: string;
}

export interface PhoneVerificationResponse {
  verification_id: string;
  message_id: string;
  expires_at: string;
  phone_number: string;
  sns_subscription_status: 'unsubscribed' | 'pending' | 'subscribed';
  requires_subscription: boolean;
}

export interface PhoneCodeVerificationRequest {
  code: string;
}

export interface PhoneCodeVerificationResponse {
  verified: boolean;
  sns_subscription_status: 'unsubscribed' | 'pending' | 'subscribed';
  sns_subscription_arn: string;
}

// Person Types
export interface PersonMetadata {
  BirthDate: string;
  DeathDate?: string;
  WikiID: string;
  WikiPage: string;
  Age: number;
}

export interface Person {
  id: string;
  name: string;
  status: 'deceased' | 'alive';
  metadata?: PersonMetadata;
}

export interface PersonUpdate {
  name?: string;
  status?: 'deceased' | 'alive';
  death_date?: string;
  metadata?: Record<string, any>;
}

export interface PeopleQueryParams extends PaginationParams {
  status?: 'deceased' | 'alive';
}

export interface PaginatedPeopleResponse {
  data: Person[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Draft Order Types
export interface DraftOrder {
  player_id: string;
  draft_order: number;
  year: number;
}

// Player Pick Types
export interface PlayerPickUpdate {
  person_id: string;
  year: number;
}

// Pick Detail Types
export interface PickDetail {
  player_id: string;
  player_name: string;
  draft_order: number;
  pick_person_id: string | null;
  pick_person_name: string | null;
  pick_person_age: number | null;
  pick_person_birth_date: string | null;
  pick_person_death_date: string | null;
  pick_timestamp: string | null;
  year: number;
}

// Draft Types
export interface DraftRequest {
  name: string;
  player_id: string;
}

// Pick Count Types
export interface PickCount {
  player_id: string;
  player_name: string;
  draft_order: number;
  pick_count: number;
  year: number;
}

// Leaderboard Types
export interface LeaderboardEntry {
  player_id: string;
  player_name: string;
  score: number;
}

// Route Types
export interface RouteInfo {
  path: string;
  name: string;
}

// Error Types
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}
