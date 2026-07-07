"use client";

import Link from "next/link";

export default function AboutUs() {
  return (
    <section className="py-24 bg-gradient-to-tr from-brand/5 via-white to-orange-500/5 relative overflow-hidden border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-8 text-center">
            Hi Learners,
          </h2>
          <div className="space-y-6 text-lg text-slate-600 leading-relaxed text-center md:text-left">
            <p>
              Mastermocks is India’s 1st Performance-Based competitive mock test platform which gives you rewards. We help you to earn while you are still preparing for the competitive exams. With the amount collected over a period of time, you can buy test series, video course etc. from any platform and boost your preparation.
            </p>
            <p>
              Mastermocks is a next-generation mock test platform designed for serious aspirants preparing for Banking and Insurance exams. We combine high-quality exam-level questions with smart analytics, AI-powered performance insights, and real exam simulation to help students maximize their scores and improve consistently.
            </p>
            
            <div className="pt-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">How are we DIFFERENT?</h3>
              <p>
                Just like any other platform, we also provide FREE mocks, FREE Pdf’s and PAID mocks. The difference here is that if you perform good in PAID mocks, you can earn cashback rewards up-to Rs25/20/15 per mock. Top 5% of the students giving any paid mock gets Rs 25 cashback, next 5% gets Rs 20 cashback and next 5% gets Rs 15 cashback.
              </p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-3xl p-8 mt-10 shadow-xl shadow-slate-200/50">
              <h4 className="font-bold text-slate-900 mb-2 text-center text-xl">For reference:</h4>
              <p className="text-center mb-8 font-medium text-slate-500">If 100 students gave a particular PAID mock, then:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-green-50 text-green-700 p-6 rounded-2xl border border-green-100 shadow-inner">
                  <div className="text-xs font-bold uppercase tracking-wider mb-2 text-green-600/80">Top 5 Students</div>
                  <div className="font-black text-3xl mb-1 flex items-baseline justify-center gap-1">
                    <span>₹25</span>
                    <span className="text-sm font-bold text-green-600/60">each</span>
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-700 p-6 rounded-2xl border border-blue-100 shadow-inner">
                  <div className="text-xs font-bold uppercase tracking-wider mb-2 text-blue-600/80">Next 5 Students</div>
                  <div className="font-black text-3xl mb-1 flex items-baseline justify-center gap-1">
                    <span>₹20</span>
                    <span className="text-sm font-bold text-blue-600/60">each</span>
                  </div>
                </div>
                <div className="bg-orange-50 text-orange-700 p-6 rounded-2xl border border-orange-100 shadow-inner">
                  <div className="text-xs font-bold uppercase tracking-wider mb-2 text-orange-600/80">Next 5 Students</div>
                  <div className="font-black text-3xl mb-1 flex items-baseline justify-center gap-1">
                    <span>₹15</span>
                    <span className="text-sm font-bold text-orange-600/60">each</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
