import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { mockTestService } from "@/services/mock-test.service";
import { userService } from "@/services/user.service";
import { courseService } from "@/services/course.service";
import { categoryService } from "@/services/category.service";
import { resourceService } from "@/services/resource.service";
import { paymentService } from "@/services/payment.service";
import { inquiryService } from "@/services/inquiry.service";
import { AdminDashboard } from "@/types/dashboard";

export const useAdminDashboard = () => {
  return useQuery<AdminDashboard>({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await dashboardService.getAdminDashboard();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
};

export const useAdminUsers = (params?: any) => {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: async () => {
      const res = await userService.getAllUsers(params);
      if (!res.success) throw new Error(res.message);
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    },
  });
};

export const useAdminTests = (params?: any) => {
  return useQuery({
    queryKey: ["admin-tests", params],
    queryFn: async () => {
      const res = await mockTestService.getAll(params);
      if (!res.success) throw new Error(res.message);
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    },
  });
};

export const useAdminCourses = (params?: any) => {
  return useQuery({
    queryKey: ["admin-courses", params],
    queryFn: async () => {
      const res = await courseService.getAll(params);
      if (!res.success) throw new Error(res.message);
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    },
  });
};

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await categoryService.getAll();
      if (!res.success) throw new Error(res.message);
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    },
  });
};

export const useAdminResources = (params?: any) => {
  return useQuery({
    queryKey: ["admin-resources", params],
    queryFn: async () => {
      const res = await resourceService.getAll(params);
      if (!res.success) throw new Error(res.message);
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    },
  });
};

export const useAdminPayments = (params?: any) => {
  return useQuery({
    queryKey: ["admin-payments", params],
    queryFn: async () => {
      const res = await paymentService.getAll(params);
      if (!res.success) throw new Error(res.message);
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    },
  });
};

export const useAdminInquiries = (params?: any) => {
  return useQuery({
    queryKey: ["admin-inquiries", params],
    queryFn: async () => {
      const res = await inquiryService.getAll(params);
      if (!res.success) throw new Error(res.message);
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    },
  });
};
