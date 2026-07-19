"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MockTest } from "@/types/mock-test";
import { toast } from "sonner";
import { Loader2, Clock, CheckCircle2, CalendarClock, X } from "lucide-react";
import { formatCurrency, getTestScheduleStatus, formatScheduleTime } from "@/lib/utils";
import { useAllMocks, usePurchasedMocks, useCompletedAttempts } from "@/hooks/queries/use-dashboard-queries";
import { useCategories } from "@/hooks/queries/use-public-queries";

function StudentPaidTestsContent() {
  const [activeTab, setActiveTab] = useState<"Available" | "Attempted">("Available");
  // Re-render every 30s so "coming soon" cards flip to live (and ended tests
  // disappear) without a page reload.
  const [, setClockTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setClockTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const { data: tests = [], isLoading: isMocksLoading } = useAllMocks(50);
  const { data: purchasedMocks = [], isLoading: isPurchasesLoading } = usePurchasedMocks();
  const { data: completedAttempts = [], isLoading: isAttemptsLoading } = useCompletedAttempts(100);

  // Sidebar category links land here as ?category=<id>.
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const { data: categories = [] } = useCategories();
  const activeCategory = categoryId
    ? categories.find((c: any) => c?._id === categoryId)
    : null;

  // Tests may carry their category as a populated object or a bare id, and
  // some legacy records store the name — match on any of them.
  const matchesCategory = (t: MockTest): boolean => {
    if (!categoryId) return true;
    const cat: any = (t as any).category;
    if (!cat) return false;
    if (typeof cat === "object") {
      return cat._id === categoryId || (!!activeCategory && cat.name === activeCategory.name);
    }
    return cat === categoryId || (!!activeCategory && cat === activeCategory.name);
  };

  const isLoading = isMocksLoading || isPurchasesLoading || isAttemptsLoading;

  const purchasedTestIds = purchasedMocks.map((t: any) => t._id);
  const completedTestIds = completedAttempts.map((a: any) =>
    typeof a.mock_test === 'object' ? a.mock_test._id : a.mock_test
  ).filter(Boolean);

  // Ended scheduled tests are filtered server-side too; this guard covers
  // cached data and the moment the window closes between refetches.
  // Note: schedule state is recomputed from the device clock here (cached
  // server status goes stale), so the 30s tick can flip cards live.
  const scheduleStatusOf = (t: MockTest) =>
    getTestScheduleStatus({ start_time: t.start_time, end_time: t.end_time });

  const filteredTests = (activeTab === "Available"
    ? tests.filter((t) => t.access_type === "paid" && !completedTestIds.includes(t._id) && scheduleStatusOf(t) !== "ended")
    : tests.filter((t) => t.access_type === "paid" && completedTestIds.includes(t._id))
  ).filter(matchesCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Upper Descriptive Column */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Paid Mock Assessments</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Select a premium testing matrix below to start practicing.</p>
        {categoryId && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-red-50 text-[#D00113] border border-red-100 rounded-md">
              Category: {activeCategory?.name || "Selected"}
            </span>
            <Link
              href="/paid-tests"
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-[#D00113] transition-colors"
            >
              <X className="w-3 h-3" /> Clear filter
            </Link>
          </div>
        )}
      </div>

      {/* Categorical Filtering Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
        {(["Available", "Attempted"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px ${activeTab === tab
                ? "border-[#D00113] text-[#D00113]"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      ) : filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <div key={test._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-slate-300 transition-all">
              <div className="space-y-4">

                {/* Badge row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md truncate max-w-[150px]">
                    {typeof test.category === 'object' && test.category?.name ? test.category.name : "General Assessment"}
                  </span>
                  {test.access_type === "paid" ? (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-red-50 text-[#D00113] border border-red-100 rounded-md">
                      💎 ₹{test.price}
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md">
                      🆓 Free
                    </span>
                  )}
                </div>

                {/* Title parameters */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#D00113] transition-colors line-clamp-2">
                    {test.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mt-2">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {test.durationMinutes || test.duration_minutes} Mins</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {test.total_questions || test.questions?.length || 0} MCQs</span>
                  </div>
                </div>

                {/* Schedule Box */}
                {test.start_time && test.end_time && (
                  scheduleStatusOf(test) === "upcoming" ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider flex items-center gap-1">
                        <CalendarClock className="w-3 h-3" /> Test Coming Soon
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        Live from {formatScheduleTime(test.start_time)} to {formatScheduleTime(test.end_time)}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1">
                        <CalendarClock className="w-3 h-3" /> Live Now
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        Closes at {formatScheduleTime(test.end_time)}
                      </span>
                    </div>
                  )
                )}

                {/* Target Reward Ledger Metric Box */}
                {test.rewardPool?.isActive && test.rewardPool.tiers && test.rewardPool.tiers.length > 0 && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Performance Wallet Prizes:</span>
                    <div className="flex flex-col gap-1">
                      {test.rewardPool.tiers.map((tier: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Rank {tier.minRank}-{tier.maxRank}</span>
                          <span className="font-bold text-emerald-600">{formatCurrency(tier.rewardAmount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Launch trigger action wire route */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                {scheduleStatusOf(test) === "upcoming" ? (
                  // No direct attempt before the window opens. Unpurchased paid
                  // tests still link to details so students can buy in advance.
                  !purchasedTestIds.includes(test._id) ? (
                    <Link
                      href={`/tests/${test._id}`}
                      className="w-full py-2.5 bg-[#1A1A1A] hover:bg-[#D00113] text-white text-center block text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                    >
                      View details — ₹{test.price}
                    </Link>
                  ) : (
                    <div className="w-full py-2.5 bg-slate-100 text-slate-400 text-center text-xs font-black uppercase tracking-wider rounded-xl cursor-not-allowed select-none">
                      Starts {test.start_time ? formatScheduleTime(test.start_time) : "soon"}
                    </div>
                  )
                ) : (
                  <Link
                    href={`/tests/${test._id}`}
                    onClick={(e) => {
                      if (scheduleStatusOf(test) === "ended") {
                        e.preventDefault();
                        toast.error("The window to attempt this mock is Closed.");
                      }
                    }}
                    className="w-full py-2.5 bg-[#1A1A1A] hover:bg-[#D00113] text-white text-center block text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                  >
                    {!purchasedTestIds.includes(test._id)
                      ? `View details — ₹${test.price}`
                      : "Attempt Now"}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
            <CheckCircle2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Tests Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">There are no paid mock tests available for the selected category at this moment.</p>
        </div>
      )}

    </div>
  );
}

// useSearchParams (read in StudentPaidTestsContent) requires a Suspense
// boundary so the rest of the route can still be prerendered.
export default function StudentPaidTestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      }
    >
      <StudentPaidTestsContent />
    </Suspense>
  );
}
