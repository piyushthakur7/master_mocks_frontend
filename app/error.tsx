"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8">
        <Logo />
      </div>
      
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200/80 max-w-md w-full animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-[#D00113]" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          System Interruption
        </h2>
        
        <p className="text-sm text-slate-500 font-medium mb-5">
          A critical exception occurred while processing this request. Our telemetry systems have logged the failure.
        </p>
        
        {(error.digest || error.message) && (
          <div className="mb-8 text-left bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
            {error.digest && (
              <p className="text-[11px] font-mono text-slate-500 break-all">
                Reference: {error.digest}
              </p>
            )}
            {error.message && (
              <p className="text-[11px] font-mono text-slate-400 break-all line-clamp-4">
                {error.message}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-md"
          >
            <RefreshCcw className="w-4 h-4" />
            Reload Interface
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
