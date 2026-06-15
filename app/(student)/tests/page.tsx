"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { mockTestService } from "@/services/mock-test.service";
import { MockTest } from "@/types/mock-test";
import { toast } from "sonner";
import { Loader2, Clock, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function StudentTestsPage() {
  const [activeTab, setActiveTab] = useState<"All" | "Available" | "Completed">("All");
  const [tests, setTests] = useState<MockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await mockTestService.getAll({ limit: 50, status: "PUBLISHED" });
        if (response.success) {
          setTests(Array.isArray(response.data) ? response.data : response.data?.data || []);
        }
      } catch (error) {
        toast.error("Failed to load mock tests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, []);

  const filteredTests = activeTab === "All" 
    ? tests 
    : activeTab === "Available"
      ? tests // Replace with logic if there's a way to know if completed
      : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Upper Descriptive Column */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Available Mock Assessments</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Select a testing matrix below. Premium modules allocate payouts directly to your student ledger upon achieving rank tiers.</p>
      </div>

      {/* Categorical Filtering Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
        {(["All", "Available", "Completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px ${
              activeTab === tab
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
                  {test.rewardPool?.isActive ? (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-red-50 text-[#D00113] border border-red-100 rounded-md">
                      💎 Premium
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
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {test.durationMinutes} Mins</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {test.questions?.length || 0} MCQs</span>
                  </div>
                </div>

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
                <Link 
                  href={`/tests/${test._id}`} 
                  className="w-full py-2.5 bg-[#1A1A1A] hover:bg-[#D00113] text-white text-center block text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                >
                  Configure Test Environment
                </Link>
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
          <p className="text-sm text-slate-500 max-w-md mx-auto">There are no mock tests available for the selected category at this moment.</p>
        </div>
      )}

    </div>
  );
}