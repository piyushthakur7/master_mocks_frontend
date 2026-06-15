import { apiClient } from "@/lib/api-client";
import { MockTest } from "@/types/mock-test";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export const mockTestService = {
  getAll: (params?: any) => apiClient.get<any, PaginatedResponse<MockTest>>("/mock-tests", { params }),
  
  getById: (id: string) => apiClient.get<any, ApiResponse<MockTest>>(`/mock-tests/${id}`),
  
  // Admin only
  create: (data: any) => apiClient.post<any, ApiResponse<MockTest>>("/mock-tests", data),
  
  update: (id: string, data: any) => apiClient.put<any, ApiResponse<MockTest>>(`/mock-tests/${id}`, data),
  
  delete: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/mock-tests/${id}`),
  
  publish: (id: string) => apiClient.patch<any, ApiResponse<MockTest>>(`/mock-tests/${id}/publish`),
  
  unpublish: (id: string) => apiClient.patch<any, ApiResponse<MockTest>>(`/mock-tests/${id}/unpublish`),
  
  addQuestionsBulk: (id: string, data: any) => apiClient.post<any, ApiResponse<MockTest>>(`/mock-tests/${id}/questions/bulk`, data),
  
  addQuestion: (id: string, data: any) => apiClient.post<any, ApiResponse<MockTest>>(`/mock-tests/${id}/questions`, data),
  
  updateQuestion: (testId: string, questionId: string, data: any) => apiClient.put<any, ApiResponse<MockTest>>(`/mock-tests/${testId}/questions/${questionId}`, data),
  
  removeQuestion: (testId: string, questionId: string) => apiClient.delete<any, ApiResponse<MockTest>>(`/mock-tests/${testId}/questions/${questionId}`),
};
