"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    // Outer page viewport backdrop frame
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10 antialiased font-sans">
      
      {/* Centered Main Layout Card matching layout proportions of images.jpg */}
      <div className="w-full max-w-5xl min-h-[600px] md:h-[650px] bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden relative flex">
        
        {/* ─── LEFT SIDE ARTISTIC BG LAYER ─── */}
        <div className="hidden md:flex md:w-1/2 bg-[#1A1A1A] relative items-center p-12 overflow-hidden select-none">
          {/* Wave/Fluid shape simulation using stylized absolute divs */}
          <div className="absolute top-0 bottom-0 -right-12 w-32 bg-white rounded-l-[100px] transform scale-y-110 translate-x-4" />
          <div className="absolute top-1/4 bottom-1/4 -right-16 w-16 bg-[#D00113]/10 rounded-l-full blur-xl" />
          
          {/* Abstract Geometric elements replacing the illustration theme with Exam/Mock theme */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#D00113]/20 rounded-full blur-2xl" />
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-[#D00113]/10 rounded-full border border-[#D00113]/20 rotate-45" />

          {/* Core Content Layer inside the artistic area */}
          <div className="relative z-10 space-y-6 max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2 group mb-4">
              <div className="relative w-8 h-8 overflow-hidden rounded-md bg-white p-0.5">
                <Image src="/logo.jpeg" alt="Master Mocks Logo" fill sizes="32px" className="object-cover" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                MASTER<span className="text-[#D00113]">MOCKS</span>
              </span>
            </Link>
            
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
              India&apos;s 1st Performance-Based Mock Platform
            </h2>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Execute test modules at real exam-level rigor, secure target percentage thresholds, and claim your cashback rewards.
            </p>
          </div>
        </div>

        {/* ─── RIGHT SIDE CONTENT VIEWPORT (FORMS CONTAINER) ─── */}
        <div className="w-full md:w-1/2 flex flex-col justify-center py-10 px-8 sm:px-12 md:px-16 relative bg-white overflow-y-auto">
          
          {/* Mobile-only branding layer (Hidden on desktop layout) */}
          <div className="md:hidden flex justify-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="relative w-6 h-6 overflow-hidden rounded-md">
                <Image src="/logo.jpeg" alt="Master Mocks Logo" fill sizes="24px" className="object-cover" />
              </div>
              <span className="text-base font-black tracking-tight">
                <span className="text-[#1A1A1A]">MASTER</span><span className="text-[#D00113]">MOCKS</span>
              </span>
            </Link>
          </div>

          {/* Form Content Mount Point matching inputs positioning from images.jpg */}
          <div className="w-full max-w-sm mx-auto my-auto">
            {children}
          </div>

          {/* Card Base System Verification Stamp Footer */}
          <div className="w-full text-center text-[10px] font-mono text-slate-400 tracking-wider mt-6 uppercase">
            Secured Connection Node // MM_{new Date().getFullYear()}
          </div>

        </div>

      </div>
    </div>
  );
}