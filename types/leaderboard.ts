// ─── v2.0 Leaderboard Types ───

export interface LeaderboardUser {
  _id: string;
  full_name: string;
  email: string;
  profile_picture?: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user: LeaderboardUser;
  best_score: number;
  best_percentage: number;
  total_attempts: number;
  last_attempt_at: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total_participants: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface MyRankResponse {
  rank: number | null;
  best_score?: number;
  best_percentage?: number;
  total_attempts?: number;
  total_participants?: number;
  message?: string;
}
