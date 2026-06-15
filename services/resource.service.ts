import { apiClient } from "@/lib/api-client";
import { Resource } from "@/types/resource";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export const resourceService = {
  getForCourse: (courseId: string) => apiClient.get<any, PaginatedResponse<Resource>>(`/resources/course/${courseId}`),
  
  download: (id: string) => apiClient.get<any, ApiResponse<{ downloadUrl: string }>>(`/resources/${id}/download`),
  
  // Admin only
  create: (data: FormData) => apiClient.post<any, ApiResponse<Resource>>("/resources", data, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  
  delete: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/resources/${id}`),
};
