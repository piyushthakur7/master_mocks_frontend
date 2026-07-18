import { apiClient } from "@/lib/api-client";
import { User } from "@/types/user";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export const userService = {
  getMe: (config?: Record<string, unknown>) =>
    apiClient.get<any, ApiResponse<User>>("/users/me", config),
  
  updateAccount: (data: any) => apiClient.patch<any, ApiResponse<User>>("/users/update-account", data),
  
  updateAvatar: (data: { profile_picture: string }) => apiClient.patch<any, ApiResponse<User>>("/users/avatar", data),
  
  // Admin only
  getAllUsers: (params?: any) => apiClient.get<any, PaginatedResponse<User>>("/users", { params }),
  
  getUserById: (id: string) => apiClient.get<any, ApiResponse<User>>(`/users/${id}`),
  
  updateUserStatus: (id: string, data: any) => apiClient.patch<any, ApiResponse<User>>(`/users/${id}/status`, data),
  
  deleteUser: (id: string) => apiClient.delete<any, ApiResponse<null>>(`/users/${id}`),
};
