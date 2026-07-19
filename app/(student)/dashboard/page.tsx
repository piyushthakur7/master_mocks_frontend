"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MockTest } from "@/types/mock-test";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2, Wallet, Target, Flag, BookOpen, Clock, Activity, ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  useStudentDashboard,
  useAllMocks,
  useCompletedAttempts,
  useResources
} from "@/hooks/queries/use-dashboard-queries";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  
  const { data: dashboardData, isLoading: isDashboardLoading, isError: isDashboardError } = useStudentDashboard();
  // Same limit as the tests pages so all three share ONE cache entry —
  // useAllMocks(10) here created a second, near-duplicate request.
  const { data: allMocks = [], isLoading: isMocksLoading } = useAllMocks(50);
  const { data: completedAttempts = [], isLoading: isAttemptsLoading } = useCompletedAttempts(100);
  const { data: allResources = [], isLoading: isResourcesLoading } = useResources();

  const isLoading = isDashboardLoading || isMocksLoading || isAttemptsLoading || isResourcesLoading;

  // Toasting straight from the render body fired a fresh toast on every
  // re-render and mutated external state during render. Keep it in an effect,
  // with a fixed id so repeated renders update one toast instead of stacking.
  useEffect(() => {
    if (isDashboardError) {
      toast.error("Failed to load dashboard data", { id: "dashboard-load-error" });
    }
  }, [isDashboardError]);

  const pdfResources = allResources.filter((r: any) => r.resource_type === 'pdf' || r.type === 'pdf').slice(0, 3);

  const completedIds = completedAttempts.map((a: any) => typeof a.mock_test === 'object' ? a.mock_test._id : a.mock_test).filter(Boolean);
  const paidMocks = allMocks
    .filter((m: any) => m.access_type === "paid" && !completedIds.includes(m._id))
    .slice(0, 10);

  // Fallback data if API returns empty
  const d = dashboardData || {
    totalAttempts: 0,
    avgScore: "0",
    recentActivity: [],
    upcomingTests: []
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
      </div>
    );
  }

  const metrics = [
    { title: "Average Score", value: `${parseFloat(d.avgScore || "0").toFixed(1)}%`, sub: "Across all attempts", icon: <Target className="w-6 h-6" />, statusColor: "text-[#D00113]" },
    { title: "Tests Attempted", value: d.totalAttempts?.toString() || "0", sub: "Total mocks completed", icon: <Flag className="w-6 h-6" />, statusColor: "text-slate-800" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Upper Welcoming Title Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Candidate Workspace</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Welcome back, {user?.full_name?.split(' ')[0] || 'Aspirant'}. Complete targeted performance test blocks to improve your score.</p>
        </div>
        <div>
          <Link href="/tests" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D00113] hover:bg-[#b0010f] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all text-center">
            <Activity className="w-4 h-4" /> Start Mock Test
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── UPCOMING MOCKS ─── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Upcoming Mocks</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Mocks available in your assessments.</p>
            </div>
            <Link href="/tests" className="text-xs font-bold text-[#D00113] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(d.upcomingTests && d.upcomingTests.length > 0) ? d.upcomingTests.map((test, idx) => (
              <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm group hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-red-50 text-[#D00113] p-2 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {test.courseName && test.courseName !== 'General' ? test.courseName : 'Assessment'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#D00113] transition-colors line-clamp-2">{test.title}</h3>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-3">
                  <Clock className="w-3.5 h-3.5" /> Available: {test.availableFrom ? formatDate(test.availableFrom) : 'Now'}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link 
                    href={`/tests/${test._id}`}
                    onClick={(e) => {
                      const now = new Date();
                      if (test.start_time && now < new Date(test.start_time)) {
                        e.preventDefault();
                        toast.error("Test Not Started Yet.");
                      } else if (test.end_time && now > new Date(test.end_time)) {
                        e.preventDefault();
                        toast.error("The window to attempt this mock is Closed.");
                      }
                    }}
                    className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-[#D00113] hover:text-white hover:border-[#D00113] text-center block text-xs font-bold rounded-lg transition-all"
                  >
                    Prepare Now
                  </Link>
                </div>
              </div>
            )) : (
              <div className="col-span-full bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-sm">
                <p className="text-sm text-slate-500 font-medium mb-4">No upcoming tests found in your catalog.</p>
                <Link href="/tests" className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">
                  Browse Mock Tests
                </Link>
              </div>
            )}
          </div>

          {/* ─── PAID MOCKS SECTION ─── */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Available Paid Mocks</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Premium mocks available for purchase.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paidMocks.length > 0 ? paidMocks.map((test, idx) => (
                <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm group hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-red-50 text-[#D00113] p-2 rounded-lg">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="bg-red-50 text-[#D00113] text-[10px] font-black px-2.5 py-1 border border-red-100 rounded-md uppercase tracking-wider">
                      💎 ₹{test.price}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#D00113] transition-colors line-clamp-2">{test.title}</h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-3">
                    <Clock className="w-3.5 h-3.5" /> {test.durationMinutes || test.duration_minutes || 60} Mins
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <Link 
                      href={`/tests/${test._id}`}
                      onClick={(e) => {
                        // Upcoming tests still open the details page (coming-soon
                        // gate + pre-purchase live there); only ended is a dead end.
                        if (test.end_time && new Date() > new Date(test.end_time)) {
                          e.preventDefault();
                          toast.error("The window to attempt this mock is Closed.");
                        }
                      }}
                      className="w-full py-2 bg-[#1A1A1A] hover:bg-[#D00113] text-white text-center block text-xs font-black uppercase tracking-wider rounded-lg transition-all"
                    >
                      Attempt Now
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="col-span-full bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center text-slate-500 text-sm font-medium">
                  No premium mocks available right now.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── RECENT ACTIVITY ─── */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Your latest interactions.</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            {(d.recentActivity && d.recentActivity.length > 0) ? (
              <div className="divide-y divide-slate-100">
                {d.recentActivity.map((activity, idx) => (
                  <div key={idx} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex gap-3">
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        activity.type === 'TEST_ATTEMPT' ? 'bg-blue-50 text-blue-600' :
                        activity.type === 'REWARD_EARNED' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-purple-50 text-purple-600'
                      }`}>
                        {activity.type === 'TEST_ATTEMPT' ? <Activity className="w-4 h-4" /> :
                         activity.type === 'REWARD_EARNED' ? <Wallet className="w-4 h-4" /> :
                         <BookOpen className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-2">{activity.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wider">{activity.date ? formatDate(activity.date) : "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-500 font-medium">No recent activity.</p>
              </div>
            )}
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
              <Link href="/results" className="text-xs font-bold text-slate-600 hover:text-[#D00113] transition-colors">
                View Full History
              </Link>
            </div>
          </div>

          {/* ─── FREE PDFS ─── */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Free PDFs</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Study materials for you.</p>
              </div>
              <Link href="/resources" className="text-xs font-bold text-[#D00113] hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              {pdfResources.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {pdfResources.map((pdf: any, idx: number) => (
                    <Link key={pdf._id || idx} href="/resources" className="block p-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-red-50 text-red-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 line-clamp-2">{pdf.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{pdf.category?.name || pdf.category || 'General'}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500 font-medium">No PDFs available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}