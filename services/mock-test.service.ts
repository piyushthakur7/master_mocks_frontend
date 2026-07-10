import { apiClient } from "@/lib/api-client";
import { MockTest } from "@/types/mock-test";
import { AccessCheckResponse } from "@/types/payment";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export const mockTestService = {
  getAll: (params?: any) => apiClient.get<any, PaginatedResponse<MockTest>>("/hacks", { params }),
  
  getById: (id: string) => apiClient.get<any, ApiResponse<MockTest>>(`/hacks/${id}`),
  
  // v2.0: Check if user can start this test (free access or purchased)
  checkAccess: (id: string) => apiClient.get<any, ApiResponse<AccessCheckResponse>>(`/hacks/${id}/check-access?_t=${Date.now()}`),
  
  // v2.0: Get tests the user has purchased
  getMyPurchased: () => apiClient.get<any, ApiResponse<MockTest[]>>("/hacks/my/purchased"),
  
  // Admin only
  create: (data: any) => apiClient.post<any, ApiResponse<MockTest>>("/hacks", data),
  
  update: (id: string, data: any) => apiClient.put<any, ApiResponse<MockTest>>(`/hacks/${id}`, data),
  
  delete: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/hacks/${id}`),
  
  publish: (id: string) => apiClient.patch<any, ApiResponse<MockTest>>(`/hacks/${id}/publish`),
  
  unpublish: (id: string) => apiClient.patch<any, ApiResponse<MockTest>>(`/hacks/${id}/unpublish`),
  
  addQuestionsBulk: (id: string, data: any) => apiClient.post<any, ApiResponse<MockTest>>(`/hacks/${id}/questions/bulk`, data),
  
  addQuestion: (id: string, data: any) => apiClient.post<any, ApiResponse<MockTest>>(`/hacks/${id}/questions`, data),
  
  updateQuestion: (testId: string, questionId: string, data: any) => apiClient.put<any, ApiResponse<MockTest>>(`/hacks/${testId}/questions/${questionId}`, data),
  
  removeQuestion: (testId: string, questionId: string) => apiClient.delete<any, ApiResponse<MockTest>>(`/hacks/${testId}/questions/${questionId}`),
};
