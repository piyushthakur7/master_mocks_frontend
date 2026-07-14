import { apiClient } from "@/lib/api-client";
import { Resource } from "@/types/resource";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export const resourceService = {
  // v2.0: Get all resources (free for logged-in users), supports filtering
  getAll: (params?: { category?: string; resource_type?: string; access_type?: string }) =>
    apiClient.get<any, ApiResponse<Resource[]>>("/resources", { params }),
  
  // Backward compatible: Get resources by course
  getForCourse: (courseId: string) =>
    apiClient.get<any, PaginatedResponse<Resource>>(`/resources/course/${courseId}`),
  
  // v2.0: Download resource directly as Blob
  download: (id: string) =>
    apiClient.get(`/resources/${id}/download`, { responseType: 'blob' }),
  
  // Admin only
  create: (data: FormData) => apiClient.post<any, ApiResponse<Resource>>("/resources", data, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  
  delete: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/resources/${id}`),
};
