"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { leaderboardService } from "@/services/leaderboard.service";
import { LeaderboardEntry, MyRankResponse } from "@/types/leaderboard";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Trophy, Medal, RefreshCw } from "lucide-react";

interface PageProps {
  params: Promise<{ testId: string }>;
}

export default function LeaderboardPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<MyRankResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const [lbRes, rankRes] = await Promise.all([
        leaderboardService.getLeaderboard(unwrappedParams.testId, { page, limit: 100 }),
        leaderboardService.getMyRank(unwrappedParams.testId).catch(() => null)
      ]);

      // Extract leaderboard data — handle both { data: { entries } } and { data: { data: { entries } } }
      const lbData = (lbRes as any)?.data?.data || (lbRes as any)?.data || lbRes;
      if (lbData) {
        setEntries(Array.isArray(lbData.entries) ? lbData.entries : []);
        setTotalPages(lbData.total_pages || 1);
      }

      // Extract rank data
      if (rankRes) {
        const rankData = (rankRes as any)?.data?.data || (rankRes as any)?.data || rankRes;
        if (rankData && rankData.rank != null) {
          setMyRank(rankData);
        }
      }
    } catch (error) {
      setHasError(true);
      toast.error("Failed to load leaderboard");
    } finally {
      setIsLoading(false);
    }
  }, [unwrappedParams.testId, page]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Global Leaderboard</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Compare your performance with top aspirants.</p>
        </div>
        <Link href="/tests" className="text-xs font-black uppercase tracking-wider text-slate-400 hover:text-[#D00113] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Tests
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-8">
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
      ) : hasError ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-12 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Couldn't Load Leaderboard</h3>
          <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">There was a problem loading the rankings. Please check your connection and try again.</p>
          <button onClick={fetchLeaderboard} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D00113] text-white text-xs font-bold rounded-lg hover:bg-[#B00010] transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      ) : (
        <>
          {/* My Rank Card */}
          {myRank && myRank.rank && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 text-white shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Current Standing</span>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-4xl font-black text-emerald-400">#{myRank.rank}</span>
                  <span className="text-sm font-bold text-slate-300 mb-1">of {myRank.total_participants}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Best Score</span>
                <p className="text-2xl font-black">{myRank.best_score?.toFixed(2)}</p>
                <p className="text-xs text-emerald-400 font-bold">{myRank.best_percentage}% Accuracy</p>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-4 px-6 font-bold w-20 text-center">Rank</th>
                  <th className="py-4 px-6 font-bold">Aspirant</th>
                  <th className="py-4 px-6 font-bold text-right">Best Score</th>
                  <th className="py-4 px-6 font-bold text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {entries.length > 0 ? entries.map((entry, idx) => (
                  <tr key={entry?.user?._id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 text-center">
                      {entry.rank === 1 ? <Trophy className="w-5 h-5 text-amber-500 mx-auto" /> :
                       entry.rank === 2 ? <Medal className="w-5 h-5 text-slate-400 mx-auto" /> :
                       entry.rank === 3 ? <Medal className="w-5 h-5 text-amber-700 mx-auto" /> :
                       <span className="font-black text-slate-400">#{entry.rank}</span>}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {entry.user?.full_name || "Anonymous"}
                    </td>
                    <td className="py-4 px-6 font-black text-slate-700 text-right">
                      {(entry.best_score ?? 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold">
                        {entry.best_percentage ?? 0}%
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">No participants yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-all"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-500">Page {page} of {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
