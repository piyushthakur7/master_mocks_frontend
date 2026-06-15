"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { mockTestService } from "@/services/mock-test.service";
import { MockTest } from "@/types/mock-test";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, CheckCircle2, Clock, Eye, EyeOff, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminTestsManagementPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await mockTestService.getAll();
      if (response.success) {
        setTests(Array.isArray(response.data) ? response.data : response.data?.data || []);
      }
    } catch (error) {
      toast.error("Failed to load mock tests");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTestStatus = async (test: MockTest) => {
    try {
      await mockTestService.update(test._id!, { is_active: !test.isActive });
      toast.success(`Test ${!test.isActive ? 'published' : 'unpublished'} successfully`);
      fetchTests();
    } catch (error: any) {
      toast.error(error.message || "Failed to update test status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mock test?")) return;
    try {
      await mockTestService.delete(id);
      toast.success("Test deleted successfully");
      fetchTests();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete test");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Directory Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Mock Assessment Repository</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Author new question parameters, audit completion parameters, or manipulate operational live states.</p>
        </div>
        <Link href="/admin/tests/create" className="px-5 py-2.5 bg-[#D00113] hover:bg-[#b0010f] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all text-center flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create New Mock
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      ) : tests.length > 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="py-3.5 px-6">Test Configuration Metadata</th>
                  <th className="py-3.5 px-6">Category / Course</th>
                  <th className="py-3.5 px-6">Boundaries Matrix</th>
                  <th className="py-3.5 px-6">Environment Status</th>
                  <th className="py-3.5 px-6 text-right">Actions Panel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {tests.map((test) => (
                  <tr key={test._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 text-sm leading-tight">{test.title}</p>
                      <p className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">ID Node: {test._id}</p>
                    </td>
                    <td className="py-4 px-6 space-y-1">
                      <span className="bg-slate-100 text-slate-700 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded mr-2">
                        {(test.category as any)?.name || "Uncategorized"}
                      </span>
                      {test.course && (
                        <span className="bg-blue-50 text-blue-700 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
                          {(test.course as any)?.title || "Course linked"}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {test.durationMinutes}m</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {test.questions?.length || 0} Qs</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                        test.isActive 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${test.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {test.isActive ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleTestStatus(test)}
                          title={test.isActive ? "Unpublish" : "Publish"}
                          className={`p-1.5 rounded transition-colors ${
                            test.isActive ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"
                          }`}
                        >
                          {test.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link 
                          href={`/admin/tests/${test._id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors block"
                          title="Edit Test Matrix"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(test._id!)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Test"
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
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Mock Tests Available</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">Create your first mock test to allow candidates to prepare effectively.</p>
          <Link href="/admin/tests/create" className="inline-block px-6 py-2.5 bg-[#D00113] hover:bg-[#b0010f] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all">
            Author New Test
          </Link>
        </div>
      )}

    </div>
  );
}