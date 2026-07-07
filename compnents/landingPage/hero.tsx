"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function Hero() {
  const { isAuthenticated, user } = useAuth();
  
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

        <div className="flex flex-col items-center text-center">

          <div className="w-full max-w-4xl mx-auto flex flex-col items-center">


            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              Practice Like the
              <span className="text-brand"> Real Exam.</span>
              <br />
              Get Rewarded for Your Performance.
            </h1>

            <p className="mt-8 text-lg text-slate-600 leading-8 max-w-2xl mx-auto transition-all duration-500">
              {highlights[active]} Every mock test is carefully designed to
              match the latest exam pattern while giving you detailed insights
              to improve your preparation.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">

              <Link
                href={isAuthenticated ? (user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard") : "/register"}
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

            <div className="flex flex-wrap justify-center gap-10 mt-14">

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

        </div>

      </div>
    </section>
  );
}
