"use client";

import React, { useState, useEffect } from "react";
import { attemptService } from "@/services/attempt.service";
import { TestAttempt } from "@/types/attempt";
import { toast } from "sonner";
import { Loader2, FileBarChart, Activity, Award, UserCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminReportsPage() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const response = await attemptService.getAllAttempts();
      let data: TestAttempt[] = [];
      if (response && response.success) {
        const resData = response.data as any;
        data = resData?.data || resData?.reports || (Array.isArray(resData) ? resData : []);
      }
      setAttempts(data);
    } catch (error: any) {
      if (error?.status === 404) {
        setAttempts([]);
      } else if (!error?._silent) {
        toast.error("Failed to load attempt reports");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const completedAttempts = attempts.filter(a => a.status === 'COMPLETED').length;
  const avgScore = attempts.length > 0 
    ? attempts.reduce((acc, a) => acc + (a.score || 0), 0) / attempts.length 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Upper Section Header */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">System Performance & Evaluation Reports</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Audit student attempts, track scoring metrics, and analyze test completions.</p>
        </div>
      </div>

      {/* Aggregate Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Evaluated</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{attempts.length} Scripts</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-slate-400" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Completed Matrix</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{completedAttempts} Cleared</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Average System Score</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{avgScore.toFixed(1)} Points</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Core Claims Data Log Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      ) : attempts.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="py-3.5 px-6">Attempt Token</th>
                  <th className="py-3.5 px-6">Candidate Profile</th>
                  <th className="py-3.5 px-6">Mock Test Name</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {attempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-mono font-bold text-slate-900">{attempt._id?.substring(0, 8)}...</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{formatDate(attempt.createdAt!)}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-900 font-bold">
                      {(attempt.user as any)?.fullName || "Unknown"}
                      <p className="font-mono text-slate-400 text-[10px] mt-0.5">{(attempt.user as any)?.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded text-[10px]">
                        {(attempt.test as any)?.title || "Unknown Test"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded ${
                        attempt.status === "COMPLETED" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {attempt.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {attempt.status === "COMPLETED" ? (
                        <span className="font-black text-slate-900 text-sm">
                          {attempt.score?.toFixed(1)} / {(attempt.test as any)?.totalMarks || 100}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                          Pending
                        </span>
                      )}
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
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Reports Available</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">There are no test attempts recorded on the platform yet.</p>
        </div>
      )}

    </div>
  );
}