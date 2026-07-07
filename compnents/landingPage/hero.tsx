"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Hero() {
  const highlights = [
    "Full-length mock tests based on the latest Banking & Insurance exam pattern.",
    "Compete with aspirants across India and see where you stand.",
    "Earn cashback by finishing among the top performers in Reward Mocks.",
    "Detailed analytics to improve your speed, accuracy, and overall score.",
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % highlights.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50 border-b border-slate-200">
      {/* Background Decorations */}
      <div className="absolute -top-32 -left-32 h-[30rem] w-[30rem] rounded-full bg-brand/10 blur-[100px]" />
      <div className="absolute top-1/2 right-1/4 h-72 w-72 rounded-full bg-orange-400/10 blur-[80px]" />
      <div className="absolute -bottom-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-blue-400/10 blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">

        <div className="grid lg:grid-cols-12 gap-16 items-center">

          {/* LEFT */}
          <div className="lg:col-span-7">

            <span className="inline-flex items-center rounded-full bg-brand-light border border-red-200 px-4 py-2 text-sm font-semibold text-brand mb-6">
              🚀 About Test Mithra
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              Practice Like the
              <span className="text-brand"> Real Exam.</span>
              <br />
              Get Rewarded for Your Performance.
            </h1>

            <p className="mt-8 text-lg text-slate-600 leading-8 max-w-2xl transition-all duration-500">
              {highlights[active]} Every mock test is carefully designed to
              match the latest exam pattern while giving you detailed insights
              to improve your preparation.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10">

              <Link
                href="/signup"
                className="bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-1"
              >
                Start Practicing
              </Link>

              <Link
                href="/mocks"
                className="border border-slate-300 hover:bg-slate-50 px-8 py-4 rounded-xl font-semibold text-slate-700 transition"
              >
                Explore Mock Tests
              </Link>

            </div>

            {/* Stats */}

            <div className="flex flex-wrap gap-10 mt-14">

              <div>
                <h3 className="text-3xl font-bold text-slate-900">50+</h3>
                <p className="text-slate-500 mt-1">Premium Mock Tests</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-slate-900">10K+</h3>
                <p className="text-slate-500 mt-1">Practice Questions</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-slate-900">₹25</h3>
                <p className="text-slate-500 mt-1">Maximum Cashback</p>
              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="lg:col-span-5 relative flex justify-center">

            {/* Floating Card */}
            <div className="absolute -top-6 -left-6 bg-white shadow-xl shadow-brand/5 rounded-2xl px-5 py-4 border border-brand/10 hidden lg:block z-10 backdrop-blur-sm">
              <p className="text-xs text-slate-500 font-medium">
                Average Accuracy
              </p>
              <h3 className="text-3xl font-black text-brand bg-clip-text text-transparent bg-gradient-to-r from-brand to-orange-500">
                84%
              </h3>
            </div>

            <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 p-7 relative z-0">

              {/* Header */}

              <div className="flex justify-between items-center mb-6">

                <div>
                  <p className="text-sm text-slate-500">
                    Live Reward Mock
                  </p>

                  <h3 className="font-bold text-xl text-slate-900">
                    SBI PO Full Mock
                  </h3>
                </div>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  LIVE
                </span>

              </div>

              {/* Details */}

              <div className="space-y-5">

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Questions
                  </span>

                  <span className="font-semibold">
                    100
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Duration
                  </span>

                  <span className="font-semibold">
                    60 Minutes
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Difficulty
                  </span>

                  <span className="font-semibold">
                    ★★★★☆
                  </span>
                </div>

                <div>

                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-slate-500">
                      Progress
                    </span>

                    <span className="font-semibold">
                      68%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="bg-brand h-full w-2/3 rounded-full"></div>
                  </div>

                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">

                  <div className="flex justify-between mb-3">
                    <span className="text-slate-500">
                      Current Rank
                    </span>

                    <span className="font-bold text-brand">
                      #18 / 752
                    </span>
                  </div>

                  <div className="flex justify-between">

                    <span className="text-slate-500">
                      Cashback Reward
                    </span>

                    <span className="font-bold text-green-600">
                      ₹25
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* Floating Reward */}

            <div className="absolute -bottom-5 right-0 bg-brand text-white rounded-2xl shadow-xl px-6 py-4 hidden lg:block">

              <p className="text-xs uppercase tracking-wider opacity-80">
                Top Performer
              </p>

              <h3 className="text-3xl font-bold">
                ₹25
              </h3>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
