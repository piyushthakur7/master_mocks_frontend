import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { mockTestService } from "@/services/mock-test.service";
import { attemptService } from "@/services/attempt.service";
import { paymentService } from "@/services/payment.service";
import { resourceService } from "@/services/resource.service";
import { userService } from "@/services/user.service";
import { MockTest } from "@/types/mock-test";
import { TestAttempt } from "@/types/attempt";
import { Purchase, Payment } from "@/types/payment";
import { Resource } from "@/types/resource";

export const useStudentDashboard = () => {
  return useQuery({
    queryKey: ["student-dashboard"],
    queryFn: async () => {
      const res = await dashboardService.getStudentDashboard();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
};

export const useAllMocks = (limit?: number) => {
  return useQuery<MockTest[]>({
    queryKey: ["all-mocks", limit],
    queryFn: async () => {
      const res = await mockTestService.getAll({ limit, status: "PUBLISHED" });
      if (!res.success) throw new Error(res.message);
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });
};

export const usePurchasedMocks = () => {
  return useQuery<MockTest[]>({
    queryKey: ["purchased-mocks"],
    queryFn: async () => {
      const res = await mockTestService.getMyPurchased();
      if (!res.success) throw new Error(res.message);
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    },
  });
};

export const useCompletedAttempts = (limit?: number) => {
  return useQuery<TestAttempt[]>({
    queryKey: ["completed-attempts", limit],
    queryFn: async () => {
      const res = await attemptService.getMyAttempts({ status: "COMPLETED", limit });
      if (!res.success) throw new Error(res.message);
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });
};

export const useResources = () => {
  return useQuery<Resource[]>({
    queryKey: ["student-resources"],
    queryFn: async () => {
      const res = await resourceService.getAll({});
      if (!res.success) throw new Error(res.message);
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    },
  });
};

export const useMyPurchases = () => {
  return useQuery<Purchase[]>({
    queryKey: ["my-purchases"],
    queryFn: async () => {
      const res = await paymentService.getMyPurchases();
      if (!res.success) throw new Error(res.message);
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    },
  });
};

export const useMyHistory = () => {
  return useQuery<Payment[]>({
    queryKey: ["payment-history"],
    queryFn: async () => {
      const res = await paymentService.getMyHistory();
      if (!res.success) throw new Error(res.message);
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => {
      const res = await userService.getMe();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
};
