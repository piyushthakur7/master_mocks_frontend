"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import "./globals.css";

/**
 * Catches errors thrown in the root layout (providers, fonts, etc.) — the one
 * place `app/error.tsx` cannot reach. Replaces the root layout entirely when
 * active, so it must render its own <html>/<body> and import global styles.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <title>Something went wrong | Master Mocks</title>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-8 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D00113] flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <span className="font-black tracking-tight text-xl text-slate-900">
              Master<span className="text-[#D00113]">Mocks</span>
            </span>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200/80 max-w-md w-full">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Something went wrong
            </h2>

            <p className="text-sm text-slate-500 font-medium mb-8">
              The application failed to start. Please try again — if this keeps
              happening, contact support with the reference below.
            </p>

            {error.digest && (
              <p className="text-xs font-mono text-slate-400 mb-6 break-all">
                Reference: {error.digest}
              </p>
            )}

            <div className="space-y-3">
              <button
                onClick={() => unstable_retry()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-md"
              >
                <RefreshCcw className="w-4 h-4" />
                Try again
              </button>

              <a
                href="/"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-sm"
              >
                Back to home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
