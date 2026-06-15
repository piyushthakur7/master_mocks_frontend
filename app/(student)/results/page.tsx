"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { attemptService } from "@/services/attempt.service";
import { TestAttempt } from "@/types/attempt";
import { toast } from "sonner";
import { Loader2, Activity, Target, CheckCircle, ArrowRight, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentResultsPage() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await attemptService.getMyAttempts({ limit: 50 });
        if (response.success && response.data) {
          setAttempts(response.data?.data || []);
        }
      } catch (error) {
        console.error("Failed to load attempt history:", error);
        setAttempts([]); // Fallback to empty state which UI handles gracefully
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Performance History</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Review your past test attempts and detailed analytics.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      ) : attempts.length > 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-4 px-6 font-bold">Assessment</th>
                  <th className="py-4 px-6 font-bold">Date</th>
                  <th className="py-4 px-6 font-bold">Score</th>
                  <th className="py-4 px-6 font-bold">Accuracy</th>
                  <th className="py-4 px-6 font-bold">Reward</th>
                  <th className="py-4 px-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {attempts.map((attempt) => {
                  const totalAttempted = attempt.totalAttempted || 0;
                  const correctAnswers = attempt.correctAnswers || 0;
                  const accuracy = totalAttempted > 0 
                    ? ((correctAnswers / totalAttempted) * 100).toFixed(1) 
                    : "0.0";
                    
                  return (
                    <tr key={attempt._id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-[#D00113] transition-colors line-clamp-1">
                            {(attempt.test as any)?.title || "Unknown Test"}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400">
                            {(attempt.test as any)?.course?.title || "General"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {formatDate(attempt.startTime)}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-700">
                        {(attempt.score || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-slate-400" />
                          <span>{accuracy}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold">
                        {(attempt.rewardEarned || 0) > 0 ? (
                          <span className="text-emerald-600">{formatCurrency(attempt.rewardEarned || 0)}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link 
                          href={`/results/${attempt._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-[#D00113] hover:text-white text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all"
                        >
                          View Report <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No History Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">You haven't attempted any mock tests yet. Your performance history will appear here.</p>
          <Link href="/tests" className="inline-block px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#D00113] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all">
            Browse Available Tests
          </Link>
        </div>
      )}

    </div>
  );
}
