"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { courseService } from "@/services/course.service";
import { Course } from "@/types/course";
import { toast } from "sonner";
import { Loader2, BookOpen, Clock, Users, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseService.getAll({ status: "PUBLISHED" });
        if (response.success) {
          setCourses(Array.isArray(response.data) ? response.data : response.data?.data || []);
        }
      } catch (error) {
        toast.error("Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Available Courses</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Browse and enroll in high-quality mock test courses.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-slate-300 transition-all">
              <div className="space-y-4">
                
                {/* Badge row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                    {(course.category as any)?.name || "General"}
                  </span>
                  {course.accessType === "free" || course.price === 0 ? (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md">
                      Free Course
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-md">
                      Premium
                    </span>
                  )}
                </div>

                {/* Thumbnail placeholder */}
                <div className="w-full h-32 bg-slate-100 rounded-xl overflow-hidden relative">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <BookOpen className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Title & Info */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#D00113] transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mt-3">
                    <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Course</span>
                  </div>
                </div>

                {/* Pricing Box */}
                {course.accessType !== "free" && course.price > 0 && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between mt-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Course Fee</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(course.price)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link 
                  href={`/courses/${course._id}`} 
                  className="w-full py-2.5 bg-slate-900 hover:bg-[#D00113] text-white text-center flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Courses Available</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">There are currently no active courses available for enrollment.</p>
        </div>
      )}

    </div>
  );
}
