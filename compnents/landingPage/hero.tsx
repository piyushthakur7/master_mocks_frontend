"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Hero() {
  const animatingTexts = [
    "India's 1st Performance-Based Competitive Mock Test Platform!",
    "Earn cashback rewards up-to ₹25/20/15 per mock test.",
    "Top 5% gets ₹25 cashback • Next 5% gets ₹20 • Next 5% gets ₹15",
    "Boost your preparation & earn while you learn!"
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % animatingTexts.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [animatingTexts.length]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 py-16 lg:py-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side Content */}
        <div className="lg:col-span-7 flex flex-col text-left">
          <div className="inline-flex items-center min-h-[40px] mb-6">
            <span className="bg-brand-light text-brand text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full border border-red-200/60 shadow-sm uppercase tracking-wider animate-pulse">
               About Us
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
            We are India&apos;s 1st <span className="text-brand">Performance-Based</span> Mock Test Platform
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 max-w-2xl">
            {animatingTexts[index]} We combine high-quality exam-level questions with smart analytics, AI-powered performance insights, and real exam simulations designed specifically for serious Banking & Insurance aspirant.
          </p>

          {/* <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link 
              href="/signup" 
              className="px-8 py-4 rounded-lg bg-[#D00113] hover:bg-[#b0010f] text-white font-bold text-center text-base transition-all transform hover:-translate-y-0.5 shadow-lg shadow-red-600/20"
            >
              Explore Paid Mocks & Earn
            </Link>
          </div> */}
        </div>

        {/* Right Side Mockup Graphic */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative transform rotate-1">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">Live Exam Simulation </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
              <span className="text-xs font-bold text-white bg-green-600 px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">LIVE REWARD MOCK </span>
              <h4 className="font-bold text-slate-800 text-sm sm:text-base mb-2">SBI PO — Full Reasoning & Quant Mock</h4>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand h-full w-2/3" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <span className="font-semibold text-amber-900">Rank 01 - 05 (Top 5%) </span>
              <span className="font-bold text-amber-700 bg-white px-2 py-0.5 rounded shadow-sm">₹25 Cashback </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}