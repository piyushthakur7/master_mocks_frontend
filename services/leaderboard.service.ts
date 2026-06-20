import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { LeaderboardResponse, MyRankResponse } from "@/types/leaderboard";

export const leaderboardService = {
  // v2.0: Paginated leaderboard with best-score-per-user ranking
  getLeaderboard: (testId: string, params?: { limit?: number; page?: number }) =>
    apiClient.get<any, ApiResponse<LeaderboardResponse>>(`/leaderboard/${testId}`, { params }),
  
  // v2.0: Get current user's rank for a specific test
  getMyRank: (testId: string) =>
    apiClient.get<any, ApiResponse<MyRankResponse>>(`/leaderboard/${testId}/my-rank`),
};
