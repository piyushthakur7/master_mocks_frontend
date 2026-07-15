"use client";

import React, { useState, useEffect } from "react";
import { resourceService } from "@/services/resource.service";
import { courseService } from "@/services/course.service";
import { categoryService } from "@/services/category.service";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, FileText, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminResourcesUploadPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newResource, setNewResource] = useState({
    title: "",
    course: "",
    category: "",
    access_type: "paid",
    price: 0,
    discount_price: 0,
    file: null as File | null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [courseResponse, catResponse] = await Promise.all([
        courseService.getAll(),
        categoryService.getAll()
      ]);
      
      let fetchedCourses: any[] = [];
      if (courseResponse.success) {
        fetchedCourses = Array.isArray(courseResponse.data) ? courseResponse.data : courseResponse.data?.data || [];
        setCourses(fetchedCourses);
      }

      if (catResponse.success) {
        setCategories(Array.isArray(catResponse.data) ? catResponse.data : catResponse.data?.data || []);
      }

      // Fetch resources for all available courses sequentially or in parallel
      const allResources: any[] = [];
      if (fetchedCourses.length > 0) {
        const resourcePromises = fetchedCourses.map(c => resourceService.getForCourse(c._id).catch(() => null));
        const resourcesResponses = await Promise.all(resourcePromises);
        
        resourcesResponses.forEach(res => {
          if (res && res.success) {
            const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
            allResources.push(...arr);
          }
        });
      }
      setResources(allResources);
    } catch (error: any) {
      if (error?.status !== 404) {
        toast.error("Failed to load data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewResource({ ...newResource, file: e.target.files[0] });
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.title || !newResource.file) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", newResource.title);
      if (newResource.course) formData.append("course", newResource.course);
      formData.append("file", newResource.file);
      formData.append("resource_type", "pdf");

      await resourceService.create(formData);
      toast.success("Resource uploaded successfully");
      
      setNewResource({ title: "", course: "", category: "", access_type: "paid", price: 0, discount_price: 0, file: null });
      setIsFormVisible(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await resourceService.delete(id);
      toast.success("Resource deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete resource");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Banner Hub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">PDF Material Distribution Desk</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Stage educational document capsules, map access barriers, and track download metric sheets.</p>
        </div>
        
        <button 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className={`px-5 py-2.5 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all text-center flex items-center gap-2 ${
            isFormVisible ? "bg-slate-700 hover:bg-slate-800" : "bg-[#D00113] hover:bg-[#b0010f]"
          }`}
        >
          {isFormVisible ? "❌ Cancel Staging" : "➕ Add New Resource"}
        </button>
      </div>

      {/* Conditional Staging Input Drawer */}
      {isFormVisible && (
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Configure New Resource</h3>
            <p className="text-[11px] text-slate-400 font-medium">Assign access rules to deploy this resource to students.</p>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Document Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Union Budget 2026 Critical Takeaways Capsule" 
                  value={newResource.title}
                  onChange={e => setNewResource({...newResource, title: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D00113]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Target Course Link</label>
                <select 
                  value={newResource.course}
                  onChange={e => setNewResource({...newResource, course: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#D00113]"
                >
                  <option value="">None (Standalone Resource)</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {!newResource.course && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-red-50/50 border border-red-100 rounded-xl">
                <div className="md:col-span-3 pb-2 border-b border-red-100">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Standalone Configuration</h3>
                  <p className="text-xs text-slate-500 font-medium">Configure this independent resource to be sold individually.</p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Category</label>
                  <select 
                    value={newResource.category}
                    onChange={e => setNewResource({...newResource, category: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#D00113]"
                  >
                    <option value="">None</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Access Type</label>
                  <select 
                    value={newResource.access_type}
                    onChange={e => setNewResource({...newResource, access_type: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#D00113]"
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {newResource.access_type === 'paid' && (
                  <div className="space-y-1.5 md:col-span-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Price (₹)</label>
                      <input 
                        type="number" 
                        value={newResource.price}
                        onChange={e => setNewResource({...newResource, price: Number(e.target.value)})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#D00113]"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Discount (₹)</label>
                      <input 
                        type="number" 
                        value={newResource.discount_price}
                        onChange={e => setNewResource({...newResource, discount_price: Number(e.target.value)})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#D00113]"
                        min={0}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">File Payload (.pdf)</label>
              <input 
                type="file" 
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-xs file:font-black file:uppercase file:tracking-wider
                  file:bg-slate-50 file:text-slate-700
                  hover:file:bg-slate-100 cursor-pointer"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#D00113] hover:bg-[#b0010f] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                🚀 Save Resource
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Live Content Manifest Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      ) : resources.length > 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-6">Document Details</th>
                  <th className="py-3 px-6">Linked Course</th>
                  <th className="py-3 px-6">Upload Date</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {resources.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-[#D00113]" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">{res.title}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        {res.course?.title || "Unknown Course"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{formatDate(res.createdAt)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => deleteResource(res._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
            <Download className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Resources Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">There are no PDF resources uploaded yet.</p>
        </div>
      )}

    </div>
  );
}