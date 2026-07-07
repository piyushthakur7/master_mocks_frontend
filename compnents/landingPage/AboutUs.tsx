"use client";

import Link from "next/link";

export default function AboutUs() {
  return (
    <section className="py-24 bg-gradient-to-tr from-brand/5 via-white to-orange-500/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">
            About MASTER MOCKS
          </h2>
          <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
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
        </div>
      </div>
    </section>
  );
}
