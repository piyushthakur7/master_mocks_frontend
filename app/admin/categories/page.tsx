"use client";

import { useState } from "react";
import { categoryService } from "@/services/category.service";
import { toast } from "sonner";
import { useAdminCategories } from "@/hooks/queries/use-admin-queries";
import { Loader2, Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading, refetch } = useAdminCategories() as {
    data: any[];
    isLoading: boolean;
    refetch: () => void;
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", description: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.id) {
        await categoryService.update(formData.id, { name: formData.name, description: formData.description });
        toast.success("Category updated");
      } else {
        await categoryService.create({ name: formData.name, description: formData.description });
        toast.success("Category created");
      }
      setIsFormOpen(false);
      setFormData({ id: "", name: "", description: "" });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cat: any) => {
    setFormData({ id: cat._id, name: cat.name, description: cat.description || "" });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoryService.delete(id);
      toast.success("Category deleted");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage course classifications and tagging.</p>
        </div>
        <button 
          onClick={() => { setFormData({ id: "", name: "", description: "" }); setIsFormOpen(!isFormOpen); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm max-w-xl">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 mb-4">
            {formData.id ? "Edit Category" : "Create Category"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
              <input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113]"
                placeholder="e.g. Banking, SSC, Railway"
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113]"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
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
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      ) : categories.length > 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Created On</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-slate-400" />
                      {cat.name}
                    </div>
                  </td>
                  <td className="py-4 px-6 max-w-xs truncate" title={cat.description}>{cat.description || "-"}</td>
                  <td className="py-4 px-6 text-slate-500">{formatDate(cat.createdAt)}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat._id)}
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
          <p className="text-sm text-slate-500">No categories found. Create your first category to get started.</p>
        </div>
      )}

    </div>
  );
}
