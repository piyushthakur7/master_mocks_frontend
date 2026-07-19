"use client";

import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <section className="py-32 bg-gradient-to-tr from-brand/5 via-white to-orange-500/5 relative overflow-hidden border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-10 text-center">
              Hi Learners,
            </h2>
            
            <div className="space-y-8 text-xl sm:text-2xl text-slate-600 leading-relaxed text-center md:text-left font-medium">
              <p>
                Mastermocks is India’s 1st Performance-Based competitive mock test platform which gives you rewards. We help you to earn while you are still preparing for the competitive exams. With the amount collected over a period of time, you can buy test series, video course etc. from any platform and boost your preparation.
              </p>
              <p>
                Mastermocks is a next-generation mock test platform designed for serious aspirants preparing for Banking and Insurance exams. We combine high-quality exam-level questions with smart analytics, AI-powered performance insights, and real exam simulation to help students maximize their scores and improve consistently.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 pt-16 border-t border-slate-200/60"
          >
            <h3 className="text-3xl font-black text-slate-900 mb-8 text-center">How are we DIFFERENT?</h3>
            <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed text-center md:text-left font-medium max-w-4xl mx-auto">
              Just like any other platform, we also provide FREE mocks, FREE Pdf’s and PAID mocks. The difference here is that if you perform good in PAID mocks, you can earn cashback rewards up-to Rs25/20/15 per mock. Top 5% of the students giving any paid mock gets Rs 25 cashback, next 5% gets Rs 20 cashback and next 5% gets Rs 15 cashback.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/60 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] p-10 mt-16 shadow-2xl shadow-slate-200/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <h4 className="font-bold text-slate-900 mb-4 text-center text-3xl tracking-tight">For reference:</h4>
              <p className="text-center mb-12 font-semibold text-slate-500 text-xl">If 100 students gave a particular PAID mock, then:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 p-8 rounded-3xl border border-green-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-sm font-bold uppercase tracking-widest mb-3 text-green-600/80">Top 5 Students</div>
                  <div className="font-black text-5xl mb-1 flex items-baseline justify-center gap-2">
                    <span className="drop-shadow-sm">₹25</span>
                    <span className="text-xl font-bold text-green-600/60">each</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 p-8 rounded-3xl border border-blue-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-sm font-bold uppercase tracking-widest mb-3 text-blue-600/80">Next 5 Students</div>
                  <div className="font-black text-5xl mb-1 flex items-baseline justify-center gap-2">
                    <span className="drop-shadow-sm">₹20</span>
                    <span className="text-xl font-bold text-blue-600/60">each</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 text-orange-700 p-8 rounded-3xl border border-orange-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-sm font-bold uppercase tracking-widest mb-3 text-orange-600/80">Next 5 Students</div>
                  <div className="font-black text-5xl mb-1 flex items-baseline justify-center gap-2">
                    <span className="drop-shadow-sm">₹15</span>
                    <span className="text-xl font-bold text-orange-600/60">each</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
