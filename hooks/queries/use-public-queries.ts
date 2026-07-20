import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import { mockTestService } from "@/services/mock-test.service";
import { resourceService } from "@/services/resource.service";
import { courseService } from "@/services/course.service";
import { MockTest } from "@/types/mock-test";
import { Course } from "@/types/course";

/**
 * Queries for the public navigation pages (navbar destinations, landing
 * sections). They inherit the global QueryClient defaults — staleTime 5 min,
 * no refetch on mount/focus — so hopping between navbar items reuses cached
 * data instead of refiring requests (the host 429s bursts from one IP).
 */

export const useCategories = () => {
  return useQuery<any[]>({
    queryKey: ["categories"],
    // Mounted by the sidebar on every student page — categories change only
    // when the admin edits them, so treat them as fresh for 6 hours.
    staleTime: 6 * 60 * 60 * 1000,
    queryFn: async () => {
      const res = await categoryService.getAll();
      return Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : Array.isArray(res)
            ? (res as any)
            : [];
    },
  });
};

export const useCategoryItems = (
  accessType: "free" | "paid",
  resourceType: "mock" | "pdf",
  categoryId: string | undefined
) => {
  return useQuery<any[]>({
    queryKey: ["category-items", accessType, resourceType, categoryId],
    // Dependent query: waits for the category id from useCategories, so the
    // two never race and a missing category fires no request at all.
    enabled: !!categoryId,
    queryFn: async () => {
      if (resourceType === "mock") {
        const res: any = await mockTestService.getAll({
          access_type: accessType,
          category: categoryId,
        });
        return Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : [];
      }
      const res: any = await resourceService.getAll({
        access_type: accessType,
        category: categoryId,
        resource_type: "pdf",
      });
      const resData: any = res.data;
      return Array.isArray(resData?.data)
        ? resData.data
        : Array.isArray(resData)
          ? resData
          : Array.isArray(res)
            ? res
            : [];
    },
  });
};

export const useUpcomingPaidMocks = (limit = 3) => {
  return useQuery<MockTest[]>({
    queryKey: ["upcoming-paid-mocks", limit],
    queryFn: async () => {
      const response = await mockTestService.getAll({
        access_type: "paid",
        limit,
      });
      if (response?.data) {
        return Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
      }
      return Array.isArray(response) ? (response as any) : [];
    },
  });
};

export const usePublishedCourses = () => {
  return useQuery<Course[]>({
    queryKey: ["published-courses"],
    queryFn: async () => {
      const response = await courseService.getAll({ status: "PUBLISHED" });
      if (!response.success) throw new Error(response.message);
      const courseList = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      return courseList.filter(
        (c: Course) =>
          !c.description?.includes("Utility course automatically generated")
      );
    },
  });
};
