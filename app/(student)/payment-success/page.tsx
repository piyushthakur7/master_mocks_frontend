"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm flex flex-col items-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Payment Successful!</h1>
        <p className="text-slate-500 font-medium max-w-md mx-auto mb-10">
          Your payment has been successfully verified. You can now access your purchased mock tests and courses.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/purchases"
            className="px-8 py-3.5 bg-[#D00113] hover:bg-[#b0010f] text-white text-sm font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-600/10 text-center"
          >
            View My Purchases
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-black uppercase tracking-wider rounded-xl transition-all text-center"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
