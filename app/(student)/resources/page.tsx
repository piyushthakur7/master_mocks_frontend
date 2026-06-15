"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { resourceService } from "@/services/resource.service";
import { courseService } from "@/services/course.service";
import { Course } from "@/types/course";
import { Resource } from "@/types/resource";
import { toast } from "sonner";
import { Loader2, Download, FileText, Video, Link as LinkIcon, BookOpen, Database } from "lucide-react";

export default function StudentResourcesVaultPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [standaloneToBuy, setStandaloneToBuy] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseService.getMyEnrolled();
        let enrolled: Course[] = [];
        if (response.success && response.data) {
          enrolled = response.data.data || response.data;
          setCourses(enrolled);
        }
        // Extract unique categories from enrolled courses
        const uniqueCats = Array.from(new Set(enrolled.map(c => {
          if (typeof c.category === 'object' && c.category?.name) return c.category.name;
          return null;
        }).filter(Boolean))) as string[];
        
        // Fetch all courses to find standalone resources available for purchase
        const allRes = await courseService.getAll();
        if (allRes.success) {
          const allCourses: Course[] = Array.isArray(allRes.data) ? allRes.data : allRes.data?.data || [];
          const standalone = allCourses.filter(c => 
            (c.title?.includes("[Standalone Resource]") || c.features?.includes("Standalone PDF Resource") || c.title?.includes("[Resource]")) &&
            !enrolled.some(e => e._id === c._id)
          );
          setStandaloneToBuy(standalone);
          
          // Add categories from standalone resources too
          standalone.forEach(c => {
            if (typeof c.category === 'object' && c.category?.name && !uniqueCats.includes(c.category.name)) {
              uniqueCats.push(c.category.name);
            }
          });
        }
        setCategories(uniqueCats);
      } catch (error) {
        toast.error("Failed to load enrolled courses");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoadingResources(true);
      try {
        // Filter courses by selected category
        let matchedCourses = courses;
        if (selectedCategory !== "ALL") {
          matchedCourses = courses.filter(c => {
            const catName = typeof c.category === 'object' ? c.category?.name : null;
            return catName === selectedCategory;
          });
        }

        if (matchedCourses.length === 0) {
          setResources([]);
          setIsLoadingResources(false);
          return;
        }

        // Fetch resources for all matched courses in parallel
        const promises = matchedCourses.map(c => resourceService.getForCourse(c._id!));
        const results = await Promise.all(promises);
        
        const allResources: Resource[] = [];
        results.forEach(res => {
          if (res.success && res.data) {
            const resArray = Array.isArray(res.data) ? res.data : res.data.data;
            if (Array.isArray(resArray)) {
              allResources.push(...resArray);
            }
          }
        });
        
        setResources(allResources);
      } catch (error) {
        toast.error("Failed to load resources");
      } finally {
        setIsLoadingResources(false);
      }
    };
    if (courses.length > 0) {
      fetchResources();
    }
  }, [selectedCategory, courses]);

  const handleDownload = async (resourceId: string, title: string) => {
    try {
      const response = await resourceService.download(resourceId);
      if (response.success && response.data) {
        toast.success(`Downloading ${title}...`);
        window.open(response.data.downloadUrl, "_blank");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to download resource");
    }
  };

  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'video': return <Video className="w-5 h-5 text-blue-500" />;
      case 'notes': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      default: return <LinkIcon className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Banner Deck Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-sm">
        <span className="text-[10px] font-black bg-[#D00113] text-white px-2.5 py-1 rounded-md uppercase tracking-wider">
          Knowledge Base
        </span>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-2">Study Materials & Assets</h1>
        <p className="text-xs text-slate-400 font-medium mt-1 max-w-xl">
          Access course-specific study materials, PDFs, videos, and toolkits provided by your instructors.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
            <Database className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Enrolled Material Suites</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">You have not enrolled in any courses or standalone resources yet. Browse the catalog below to unlock study materials.</p>
        </div>
      ) : (
        <>
          {/* Segmented Category Filter Toggles */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                selectedCategory === "ALL"
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              All Categories
            </button>
            {categories.map((catName) => (
              <button
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                  selectedCategory === catName
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {catName}
              </button>
            ))}
          </div>

          {isLoadingResources ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
            </div>
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((item) => (
                <div 
                  key={item._id} 
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                        {getResourceIcon(item.type)}
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-800 group-hover:text-[#D00113] transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="pt-4 mt-5">
                    <button
                      onClick={() => handleDownload(item._id!, item.title)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 group-hover:bg-[#1A1A1A] group-hover:text-white text-slate-700 rounded-xl transition-all text-xs font-black uppercase tracking-wider"
                    >
                      <Download className="w-3.5 h-3.5" /> Download / View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-12">
              <p className="text-sm font-medium text-slate-500">No resources available for this course yet.</p>
            </div>
          )}
        </>
      )}

      {/* Discovery Section for Standalone Resources */}
      {!isLoading && standaloneToBuy.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200/60">
          <h2 className="text-lg font-black text-slate-900 tracking-tight mb-6">Discover Independent Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {standaloneToBuy
              .filter(c => {
                if (selectedCategory === "ALL") return true;
                const catName = typeof c.category === 'object' ? c.category?.name : null;
                return catName === selectedCategory;
              })
              .map(course => (
              <div key={course._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-[#D00113]" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{course.title.replace("[Standalone Resource]", "").replace("[Resource]", "").trim()}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{course.description}</p>
                  
                  <div className="pt-2">
                    {course.accessType === "free" ? (
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded">Free Resource</span>
                    ) : (
                      <span className="text-lg font-black text-[#D00113]">₹{course.price}</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link 
                    href={`/courses/${course._id}`}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-center block text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                  >
                    Unlock & Download
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}