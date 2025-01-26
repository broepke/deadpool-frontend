// Base Response Types
export interface ApiResponse<T> {
  message: string;
  data: T;
}

// Player Types
export interface Player {
  id: string;
  name: string;
  draft_order: number;
  year: number;
  metadata?: Record<string, any>;
}

export interface PlayerUpdate {
  name?: string;
  draft_order?: number;
  year?: number;
  metadata?: Record<string, any>;
}

// Person Types
export interface Person {
  id: string;
  name: string;
  status: string;
  metadata?: Record<string, any>;
}

export interface PersonUpdate {
  name?: string;
  status?: string;
  metadata?: Record<string, any>;
}

// Draft Order Types
export interface DraftOrder {
  player_id: string;
  draft_order: number;
  year: number;
}

// Player Pick Types
export interface PlayerPick {
  person_id: string;
  year: number;
  timestamp: string;
}

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