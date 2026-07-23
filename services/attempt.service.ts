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
  // The answer endpoint upserts on question_id; sending an empty
  // selected_option_id unsets the stored choice server-side.
  clearAnswer: (attemptId: string, questionId: string) =>
    apiClient.put<any, ApiResponse<TestAttempt>>(`/attempts/${attemptId}/answer`, {
      question_id: questionId,
      selected_option_id: "",
    }),

  submit: (attemptId: string) =>
    apiClient.post<any, ApiResponse<TestAttempt>>(`/attempts/${attemptId}/submit`),
  
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
