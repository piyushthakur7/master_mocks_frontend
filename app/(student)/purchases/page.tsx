"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Receipt, ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useMyPurchases, useMyHistory } from "@/hooks/queries/use-dashboard-queries";

export default function StudentPurchasesPage() {
  const [activeTab, setActiveTab] = useState<"purchases" | "history">("purchases");
  
  const { data: purchases = [], isLoading: isPurchasesLoading } = useMyPurchases();
  const { data: history = [], isLoading: isHistoryLoading } = useMyHistory();

  const isLoading = isPurchasesLoading || isHistoryLoading;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Purchases</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Manage your active unlocks and payment history.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab("purchases")}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === "purchases"
              ? "border-[#D00113] text-[#D00113]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Active Purchases
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === "history"
              ? "border-[#D00113] text-[#D00113]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Payment History
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      ) : activeTab === "purchases" ? (
        purchases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase) => (
              <div key={purchase._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md">
                      {purchase.status}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{formatDate(purchase.purchase_date)}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">
                    {(purchase.item_id as any)?.title || "Premium Content"}
                  </h3>
                  <p className="text-xs text-slate-500">{purchase.item_type}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-black text-[#D00113]">{formatCurrency(purchase.amount)}</span>
                  <Link href="/tests" className="text-xs font-black uppercase text-[#1A1A1A] hover:text-[#D00113] flex items-center gap-1 transition-colors">
                    Access <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Purchases</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">You haven't unlocked any premium tests or courses yet.</p>
          </div>
        )
      ) : (
        history.length > 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-4 px-6 font-bold">Transaction</th>
                  <th className="py-4 px-6 font-bold">Date</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {history.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {payment.razorpay_order_id || payment.razorpayOrderId || "Order"}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      {payment.status === "SUCCESS" ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Success</span>
                      ) : payment.status === "FAILED" ? (
                        <span className="flex items-center gap-1 text-[#D00113] font-bold"><XCircle className="w-3.5 h-3.5" /> Failed</span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 font-bold"><Clock className="w-3.5 h-3.5" /> Pending</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-black text-slate-700 text-right">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm">No payment history found.</div>
        )
      )}
    </div>
  );
}
