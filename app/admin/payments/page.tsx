"use client";

import React from "react";
import { useAdminPayments } from "@/hooks/queries/use-admin-queries";
import { Loader2, IndianRupee, CreditCard, ArrowUpRight, TrendingUp } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const { data: purchases = [], isLoading } = useAdminPayments() as {
    data: any[];
    isLoading: boolean;
  };

  const totalRevenue = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
  const successfulPurchases = purchases.filter(p => p.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Banner Hub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Track revenue, course purchases, and payment statuses across the platform.</p>
        </div>
      </div>

      {/* Grid Quick Indicators Summary Track */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Gross Revenue</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Completed Transactions</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{successfulPurchases} Orders</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main Matrix Grid Table Layout */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      ) : purchases.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="py-4 px-6">Transaction ID</th>
                  <th className="py-4 px-6">Candidate</th>
                  <th className="py-4 px-6">Course Purchased</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {purchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        <span className="font-mono text-slate-500">{purchase._id.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {purchase.user?.fullName || "Unknown User"}
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5 font-medium">{purchase.user?.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-700 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
                        {purchase.course?.title || "Unknown Course"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {formatCurrency(purchase.amount)}
                    </td>
                    <td className="py-4 px-6 text-slate-500">{formatDate(purchase.createdAt)}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${
                        purchase.status === 'COMPLETED' 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : purchase.status === 'FAILED'
                          ? "bg-red-50 text-[#D00113] border-red-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {purchase.status}
                      </span>
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
            <IndianRupee className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Transactions Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">There are no payment records or course purchases available yet.</p>
        </div>
      )}

    </div>
  );
}
