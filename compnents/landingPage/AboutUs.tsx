"use client";

import Link from "next/link";

export default function AboutUs() {
  return (
    <section className="py-24 bg-gradient-to-tr from-brand/5 via-white to-orange-500/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
              About MASTER MOCKS
            </h2>
            <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
              <p>
                Welcome to <span className="font-bold text-slate-900">MASTER MOCKS</span>, your ultimate destination for conquering Banking and Insurance exams. We are more than just a test series platform; we are a dedicated channel and community focused on pushing your preparation to the highest level.
              </p>
              <p>
                Our philosophy is simple: <span className="font-bold text-brand">Practice Smart. Score High. Get Rewarded.</span> We believe that hard work should be instantly recognized. That is why we pioneered the concept of performance-based cashback. 
              </p>
              <p>
                Every mock test is meticulously crafted by top educators who understand the changing trends of the exams. Whether you are aiming for SBI PO, IBPS, or RBI, our analytics will show you exactly where you stand and how to improve.
              </p>
            </div>
            
            <div className="mt-8 flex gap-4">
              <Link 
                href="/signup" 
                className="px-6 py-3 bg-gradient-to-r from-brand to-orange-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5"
              >
                Join Our Community
              </Link>
            </div>
          </div>
          
          {/* Right side visuals */}
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand to-orange-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-3xl" />
            <div className="aspect-square rounded-3xl bg-white/80 backdrop-blur-xl flex items-center justify-center border border-white/50 shadow-2xl relative z-10 overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              <div className="text-center z-10 p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-brand to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-brand/30 mx-auto mb-6 transform group-hover:scale-110 transition-transform duration-500">
                  <span className="text-4xl font-black text-white">MM</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">MASTER MOCKS</h3>
                <p className="text-slate-500 font-medium">Elevating Exam Prep</p>
              </div>
            </div>
            {/* Floating stats */}
            <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-xl shadow-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Students</p>
              <p className="text-2xl font-black text-slate-900">10,000+</p>
            </div>
            <div className="absolute -top-6 -right-6 bg-white p-5 rounded-xl shadow-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cashback Given</p>
              <p className="text-2xl font-black text-green-600">₹5 Lakhs+</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
