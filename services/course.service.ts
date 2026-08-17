import { apiClient } from "@/lib/api-client";
import { Course } from "@/types/course";
import { EnrollmentRow } from "@/types/enrollment";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export const courseService = {
  getAll: (params?: any) => apiClient.get<any, PaginatedResponse<Course>>("/courses", { params }),
  
  getById: (id: string) => apiClient.get<any, ApiResponse<Course>>(`/courses/${id}`),
  
  getMyEnrolled: (params?: any) => apiClient.get<any, PaginatedResponse<Course>>("/courses/my/enrolled", { params }),
  
  enroll: (id: string) => apiClient.post<any, ApiResponse<any>>(`/courses/${id}/enroll`),
  
  // Admin only
  getAllEnrollments: (params?: any) =>
    apiClient.get<any, ApiResponse<EnrollmentRow[]>>("/courses/enrollments/all", { params }),
  
  create: (data: any) => apiClient.post<any, ApiResponse<Course>>("/courses", data),
  
  update: (id: string, data: any) => apiClient.put<any, ApiResponse<Course>>(`/courses/${id}`, data),
  
  delete: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/courses/${id}`),
  
  publish: (id: string) => apiClient.patch<any, ApiResponse<Course>>(`/courses/${id}/publish`),
  
  unpublish: (id: string) => apiClient.patch<any, ApiResponse<Course>>(`/courses/${id}/unpublish`),
};
