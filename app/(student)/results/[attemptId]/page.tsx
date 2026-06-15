"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { attemptService } from "@/services/attempt.service";
import { TestAttempt } from "@/types/attempt";
import { toast } from "sonner";
import { Loader2, CheckCircle, Clock, Target, Trophy } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default function PostExamPerformanceAnalyticsPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await attemptService.getById(unwrappedParams.attemptId);
        if (response.success && response.data) {
          setAttempt(response.data);
        } else {
          toast.error("Failed to load attempt details");
        }
      } catch (error) {
        toast.error("Error loading attempt report");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [unwrappedParams.attemptId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Report Not Found</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">We couldn't locate the performance analytics for this attempt.</p>
        <Link href="/dashboard" className="inline-block px-6 py-2.5 bg-[#D00113] text-white text-xs font-bold rounded-lg transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isCompleted = attempt.status === "COMPLETED";
  const rewardEarned = attempt.rewardEarned || 0;
  const hasReward = rewardEarned > 0;
  
  const totalAttempted = attempt.totalAttempted || 0;
  const correctAnswers = attempt.correctAnswers || 0;
  const score = attempt.score || 0;

  const accuracy = totalAttempted > 0 
    ? ((correctAnswers / totalAttempted) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Upper Success Payout Status Header */}
      {isCompleted && (
        <div className={`p-6 sm:p-8 rounded-2xl text-white border shadow-lg relative overflow-hidden ${hasReward ? 'bg-gradient-to-r from-emerald-900 to-slate-950 border-emerald-800' : 'bg-gradient-to-r from-slate-800 to-slate-950 border-slate-700'}`}>
          <div className="absolute top-0 bottom-0 right-0 w-1/3 bg-[linear-gradient(to_right,transparent,#ffffff05)] pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <span className={`text-[10px] font-black uppercase tracking-widest border px-3 py-1 rounded-full inline-block ${hasReward ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-slate-500/20 border-slate-500/30 text-slate-300'}`}>
              {hasReward ? '✓ Performance Verified Ledger Checked' : '✓ Evaluation Completed'}
            </span>
            <h1 className="text-2xl font-black tracking-tight">
              {hasReward ? 'Congratulations! Payout Triggered Successfully' : 'Assessment Result Processed'}
            </h1>
            <p className="text-xs text-slate-300 font-medium max-w-xl">
              {hasReward 
                ? `Your performance tracking module cleared the target threshold. A compensation credit value of ${formatCurrency(rewardEarned)} has been dispatched to your dashboard student wallet.`
                : 'Your mock test submission has been processed. Review your performance metrics below to identify areas of improvement.'}
            </p>
          </div>
        </div>
      )}

      {/* ─── SCORES DATA METRIC SECTION ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-1 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 group-hover:scale-110 transition-transform"><Target className="w-24 h-24" /></div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider relative z-10">Your Compiled Score</p>
          <p className="text-3xl font-black text-[#D00113] relative z-10">{score.toFixed(2)}</p>
          <p className="text-xs text-slate-400 font-medium relative z-10">Out of {(attempt.test as any)?.questions?.length || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-1 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 group-hover:scale-110 transition-transform"><CheckCircle className="w-24 h-24" /></div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider relative z-10">Accuracy Rating</p>
          <p className="text-3xl font-black text-slate-900 relative z-10">{accuracy}%</p>
          <p className="text-xs text-slate-400 font-medium relative z-10">{correctAnswers} correct / {totalAttempted} attempted</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-1 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 group-hover:scale-110 transition-transform"><Clock className="w-24 h-24" /></div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider relative z-10">Time Invested</p>
          <p className="text-3xl font-black text-slate-900 relative z-10">
            {attempt.timeSpent ? `${Math.floor(attempt.timeSpent / 60)}m ${attempt.timeSpent % 60}s` : 'N/A'}
          </p>
          <p className="text-xs text-slate-400 font-medium relative z-10">Duration of assessment</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-1 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 group-hover:scale-110 transition-transform"><Trophy className="w-24 h-24" /></div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider relative z-10">Reward Earned</p>
          <p className={`text-3xl font-black relative z-10 ${hasReward ? 'text-emerald-600' : 'text-slate-900'}`}>{formatCurrency(rewardEarned)}</p>
          <p className="text-xs text-slate-400 font-medium relative z-10">Added to wallet</p>
        </div>
      </div>

      {/* ─── REVIEW SECTION ─── */}
      {attempt.answers && attempt.answers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-8">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Question Analysis</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Review your answers and identify knowledge gaps.</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {attempt.answers.map((ans, idx) => (
              <div key={idx} className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex gap-4">
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 font-bold rounded-lg text-sm">
                      {idx + 1}
                    </span>
                    {ans.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold">X</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="text-sm font-medium text-slate-800" dangerouslySetInnerHTML={{ __html: (ans.question as any)?.questionText || "Question text not available" }} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className={`p-3 rounded-lg border ${ans.isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                        <span className="font-bold block mb-1">Your Answer:</span>
                        <span dangerouslySetInnerHTML={{ __html: (ans.selectedOption as any)?.text || "Selected option text" }} />
                      </div>
                      {!ans.isCorrect && (
                        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800">
                          <span className="font-bold block mb-1">Correct Answer:</span>
                          <span>Please check solution logic</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom return navigation actions track button link layout */}
      <div className="text-center pt-4">
        <Link href="/dashboard" className="inline-block px-6 py-3 bg-[#1A1A1A] hover:bg-[#D00113] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all">
          ← Terminate Review & Go To Dashboard
        </Link>
      </div>

    </div>
  );
}