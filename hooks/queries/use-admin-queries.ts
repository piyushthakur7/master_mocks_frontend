import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { mockTestService } from "@/services/mock-test.service";
import { userService } from "@/services/user.service";
import { courseService } from "@/services/course.service";
import { categoryService } from "@/services/category.service";
import { resourceService } from "@/services/resource.service";
import { paymentService } from "@/services/payment.service";
import { inquiryService } from "@/services/inquiry.service";
import { attemptService } from "@/services/attempt.service";
import { AdminDashboard } from "@/types/dashboard";

// Normalizes the various backend envelope shapes into a plain array.
const toArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  return data?.data || data?.reports || [];
};

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
      return toArray(res.data);
    },
  });
};

export const useAdminTests = (params?: any) => {
  return useQuery({
    queryKey: ["admin-tests", params],
    queryFn: async () => {
      const res = await mockTestService.getAll(params);
      if (!res.success) throw new Error(res.message);
      return toArray(res.data);
    },
  });
};

export const useAdminCourses = (params?: any) => {
  return useQuery({
    queryKey: ["admin-courses", params],
    queryFn: async () => {
      const res = await courseService.getAll(params);
      if (!res.success) throw new Error(res.message);
      return toArray(res.data);
    },
  });
};

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await categoryService.getAll();
      if (!res.success) throw new Error(res.message);
      return toArray(res.data);
    },
  });
};

export const useAdminPayments = (params?: any) => {
  return useQuery({
    queryKey: ["admin-payments", params],
    queryFn: async () => {
      const res = await paymentService.getAllPurchases(params);
      if (!res.success) throw new Error(res.message);
      return toArray(res.data);
    },
  });
};

export const useAdminInquiries = (params?: any) => {
  return useQuery({
    queryKey: ["admin-inquiries", params],
    queryFn: async () => {
      const res = await inquiryService.getAll(params);
      if (!res.success) throw new Error(res.message);
      return toArray(res.data);
    },
  });
};

export const useAdminAttempts = (params?: any) => {
  return useQuery({
    queryKey: ["admin-attempts", params],
    queryFn: async () => {
      const res = await attemptService.getAllAttempts(params);
      if (!res.success) throw new Error(res.message);
      return toArray(res.data);
    },
  });
};

// Courses + categories are shared metadata used by several admin screens.
// Folding them into a single cached query means rapid navigation between
// Courses / Resources / Tests reuses one result instead of refetching.
export const useAdminCourseOptions = () => {
  return useQuery({
    queryKey: ["admin-course-options"],
    queryFn: async () => {
      const [coursesRes, catsRes] = await Promise.all([
        courseService.getAll(),
        categoryService.getAll(),
      ]);
      return {
        courses: coursesRes.success ? toArray(coursesRes.data) : [],
        categories: catsRes.success ? toArray(catsRes.data) : [],
      };
    },
  });
};

// The Resources screen needs the full resource list plus the course/category
// option lists. Previously this fired 2 + N (one per course) requests on every
// mount; wrapping it in a single cached query stops the refetch-per-navigation
// storm while preserving the exact same data shape.
export const useAdminResourceManager = () => {
  return useQuery({
    queryKey: ["admin-resource-manager"],
    queryFn: async () => {
      // Each request fails independently: one rejection (a 429 from the
      // shared-IP bucket is routine here) must not blank out the whole form.
      // Previously an unguarded reject left BOTH dropdowns silently empty.
      // Categories deliberately are NOT fetched here — the page reads them
      // from useCategories(), whose 6h cache usually costs zero requests.
      const [coursesRes, allResourcesRes] = await Promise.all([
        courseService.getAll().catch(() => null),
        resourceService.getAll().catch(() => null),
      ]);

      const courses = coursesRes?.success ? toArray(coursesRes.data) : [];

      const resourceMap = new Map<string, any>();
      if (allResourcesRes?.success) {
        toArray(allResourcesRes.data).forEach((r: any) => resourceMap.set(r._id, r));
      }
      // Only fall back to the per-course fan-out when the flat listing gave us
      // nothing — firing one request per course on every load is what pushes
      // this page into rate limiting in the first place.
      if (resourceMap.size === 0 && courses.length > 0) {
        const responses = await Promise.all(
          courses.map((c: any) => resourceService.getForCourse(c._id).catch(() => null))
        );
        responses.forEach((res: any) => {
          if (res && res.success) {
            toArray(res.data).forEach((r: any) => resourceMap.set(r._id, r));
          }
        });
      }

      return {
        resources: Array.from(resourceMap.values()),
        courses,
        // Let the UI distinguish "fetch failed" from "genuinely empty".
        coursesFailed: !coursesRes?.success,
      };
    },
    // This page is navigated back to often; refetching the whole fan-out on
    // every mount is what pushes the shared-IP bucket into a 429 lockout.
    staleTime: 5 * 60 * 1000,
    // A cooldown rejection is transient — back off past it instead of
    // stranding the admin on an error until they manually reload.
    retry: 2,
    retryDelay: (attempt) => Math.min(4000 * 2 ** attempt, 30000),
  });
};
