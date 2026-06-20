"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { leaderboardService } from "@/services/leaderboard.service";
import { LeaderboardEntry, MyRankResponse } from "@/types/leaderboard";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Trophy, Medal } from "lucide-react";

interface PageProps {
  params: Promise<{ testId: string }>;
}

export default function LeaderboardPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<MyRankResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const [lbRes, rankRes] = await Promise.all([
          leaderboardService.getLeaderboard(unwrappedParams.testId, { page, limit: 100 }),
          leaderboardService.getMyRank(unwrappedParams.testId)
        ]);

        if (lbRes.success && lbRes.data) {
          setEntries(lbRes.data.entries);
          setTotalPages(lbRes.data.total_pages);
        }
        
        if (rankRes.success && rankRes.data) {
          setMyRank(rankRes.data);
        }
      } catch (error) {
        toast.error("Failed to load leaderboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [unwrappedParams.testId, page]);

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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
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
                {entries.length > 0 ? entries.map((entry) => (
                  <tr key={entry.user._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 text-center">
                      {entry.rank === 1 ? <Trophy className="w-5 h-5 text-amber-500 mx-auto" /> :
                       entry.rank === 2 ? <Medal className="w-5 h-5 text-slate-400 mx-auto" /> :
                       entry.rank === 3 ? <Medal className="w-5 h-5 text-amber-700 mx-auto" /> :
                       <span className="font-black text-slate-400">#{entry.rank}</span>}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {entry.user.full_name}
                    </td>
                    <td className="py-4 px-6 font-black text-slate-700 text-right">
                      {entry.best_score.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold">
                        {entry.best_percentage}%
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
