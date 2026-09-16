import { apiClient } from "@/lib/api-client";
import { TestAttempt } from "@/types/attempt";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export const attemptService = {
  // v2.0: Uses mock_test_id instead of testId
  start: (mockTestId: string) =>
    apiClient.post<any, ApiResponse<TestAttempt>>("/attempts/start", { mock_test_id: mockTestId }),
  
  // v2.0: Uses snake_case field names
  answer: (attemptId: string, data: {
    question_id: string;
    selected_option_id: string;
    is_marked_for_review?: boolean;
  }) => apiClient.put<any, ApiResponse<TestAttempt>>(`/attempts/${attemptId}/answer`, data),

  // Clear a previously saved answer so the question counts as unattempted.
  // The answer endpoint upserts on question_id; sending null unsets the stored
  // choice. (An empty string "" is NOT valid here — it fails the ObjectId cast
  // on the selected_option_id field and the whole request is rejected.)
  clearAnswer: (attemptId: string, questionId: string) =>
    apiClient.put<any, ApiResponse<TestAttempt>>(`/attempts/${attemptId}/answer`, {
      question_id: questionId,
      selected_option_id: null,
    }),

  // Carries the full answer sheet as shown on screen. Each click is also saved
  // on its own, but a save that fails (dropped connection, throttling, or the
  // last answer still in flight when Submit is pressed) used to be lost and
  // scored as unattempted. The server scores from this sheet instead.
  submit: (
    attemptId: string,
    answers?: { question_id: string; selected_option_id: string | null }[]
  ) =>
    apiClient.post<any, ApiResponse<TestAttempt>>(
      `/attempts/${attemptId}/submit`,
      answers ? { answers } : {}
    ),
  
  evaluate: (attemptId: string) =>
    apiClient.post<any, ApiResponse<TestAttempt>>(`/attempts/${attemptId}/evaluate`),
  
  getMyAttempts: (params?: any) =>
    apiClient.get<any, PaginatedResponse<TestAttempt>>("/attempts/my", { params }),
  
  getById: (id: string) =>
    apiClient.get<any, ApiResponse<TestAttempt>>(`/attempts/${id}`),
  
  // Admin only
  getAllAttempts: (params?: any) =>
    apiClient.get<any, PaginatedResponse<TestAttempt>>("/attempts", { params }),
};
