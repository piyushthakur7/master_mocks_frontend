"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

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
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-50/80 via-white to-orange-50/50 border-b border-slate-200/50">
      {/* Background Decorations */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute -top-[20rem] -left-[10rem] h-[50rem] w-[50rem] rounded-full bg-brand/5 blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 h-[30rem] w-[30rem] rounded-full bg-orange-400/5 blur-[100px]" />
        <div className="absolute -bottom-[20rem] -right-[10rem] h-[50rem] w-[50rem] rounded-full bg-blue-400/5 blur-[120px]" />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="flex flex-col items-center text-center">
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black tracking-tighter text-slate-900 leading-[1.1]">
                Practice Like the
                <span className="text-brand relative inline-block ml-3">
                  Real Exam.
                  <motion.span 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="absolute -bottom-2 left-0 w-full h-2 bg-brand/20 origin-left rounded-full"
                  />
                </span>
                <br />
                Get Rewarded for Your Performance.
              </h1>
            </motion.div>

            <div className="h-28 sm:h-24 mt-8 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl sm:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-medium"
                >
                  {highlights[active]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="flex flex-col sm:flex-row justify-center gap-6 mt-12 w-full sm:w-auto"
            >
              <Link
                href={isAuthenticated ? (user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard") : "/register"}
                className="group relative flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white text-lg sm:text-xl px-10 py-5 rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-1 overflow-hidden"
              >
                <span className="relative z-10">Start Practicing</span>
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shine_1.5s_ease-in-out_infinite] z-0" />
              </Link>

              <Link
                href="/mocks"
                className="flex items-center justify-center border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-lg sm:text-xl px-10 py-5 rounded-2xl font-bold text-slate-700 transition-all duration-300 hover:-translate-y-1"
              >
                Explore Mock Tests
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex flex-wrap justify-center gap-16 mt-20"
            >
              {[
                { label: "Premium Mock Tests", value: "50+" },
                { label: "Practice Questions", value: "10K+" },
                { label: "Maximum Cashback", value: "₹25" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <h3 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                  <p className="text-lg font-semibold text-slate-500 mt-2">{stat.label}</p>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
