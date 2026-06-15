"use client";

import { useState, useEffect } from "react";
import { courseService } from "@/services/course.service";
import { categoryService } from "@/services/category.service";
import { Course } from "@/types/course";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, BookOpen, Eye, EyeOff } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    price: 0,
    access_type: "free",
    category: "",
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, catsRes] = await Promise.all([
        courseService.getAll(),
        categoryService.getAll()
      ]);
      if (coursesRes.success) setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : coursesRes.data?.data || []);
      if (catsRes.success) setCategories(Array.isArray(catsRes.data) ? catsRes.data : catsRes.data?.data || []);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        access_type: formData.access_type,
        category: formData.category
      };

      if (formData.id) {
        await courseService.update(formData.id, payload);
        toast.success("Course updated");
      } else {
        await courseService.create(payload);
        toast.success("Course created");
      }
      setIsFormOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ id: "", title: "", description: "", price: 0, access_type: "free", category: "", is_active: true });
  };

  const handleEdit = (course: Course) => {
    setFormData({
      id: course._id!,
      title: course.title,
      description: course.description || "",
      price: course.price || 0,
      access_type: course.accessType === "free" ? "free" : "paid",
      category: typeof course.category === 'string' ? course.category : course.category?._id || "",
      is_active: course.isActive
    });
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (course: Course) => {
    try {
      if (course.isActive) {
        await courseService.unpublish(course._id!);
        toast.success("Course unpublished");
      } else {
        await courseService.publish(course._id!);
        toast.success("Course published");
      }
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await courseService.delete(id);
      toast.success("Course deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete course");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Course Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Create and manage courses and their access levels.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Course
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 mb-4">
            {formData.id ? "Edit Course" : "Create New Course"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Title</label>
                <input 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113]"
                  required minLength={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113]"
                  required minLength={10}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113]"
                  required
                >
                  <option value="">Select Category...</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Access Type</label>
                <select 
                  value={formData.access_type}
                  onChange={(e) => setFormData({ ...formData, access_type: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113]"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              {formData.access_type === "paid" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113]"
                    min="0" required
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#D00113] hover:bg-[#b0010f] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                Save Course
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      ) : courses.length > 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-4 px-6">Course</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Pricing</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{course.title}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(course.createdAt!)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                      {(typeof course.category !== 'string' && course.category?.name) ? course.category.name : "None"}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800">
                    {course.accessType === "free" ? "Free" : formatCurrency(course.price || 0)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      course.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}>
                      {course.isActive ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleToggleStatus(course)}
                        title={course.isActive ? "Unpublish" : "Publish"}
                        className={`p-1.5 rounded transition-colors ${
                          course.isActive ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"
                        }`}
                      >
                        {course.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleEdit(course)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(course._id!)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Courses Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">Create your first course to start adding mock tests.</p>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="inline-block px-6 py-2.5 bg-[#D00113] hover:bg-[#b0010f] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
          >
            Create Course
          </button>
        </div>
      )}

    </div>
  );
}
