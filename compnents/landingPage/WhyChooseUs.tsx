"use client";
import { motion } from "framer-motion";

export default function WhyChooseUs() {
  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Background glow for dark theme */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
            How Are We Different? 
          </h2>
          <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed font-medium">
            Just like any other platform, we also provide FREE mocks, FREE PDFs and PAID mocks. The difference here is that if you perform good in PAID mocks, you can earn <span className="text-brand font-bold">cashback rewards</span>.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 text-white rounded-[2rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* subtle inner glow */}
          <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />
          
          <h4 className="font-bold text-3xl mb-8 text-white tracking-tight">Reward Split Distribution Example <span className="text-slate-400 text-xl font-medium ml-2">(Per 100 Students)</span></h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { top: "Top 5%", reward: "₹25" },
              { top: "Next 5%", reward: "₹20" },
              { top: "Following 5%", reward: "₹15" }
            ].map((tier, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
                transition={{ duration: 0.2 }}
                className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-inner group"
              >
                <p className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-3">{tier.top} of Students</p>
                <p className="text-3xl font-black text-emerald-400 drop-shadow-sm group-hover:text-emerald-300 transition-colors">Gets {tier.reward} Cashback</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-10 text-lg text-slate-300 bg-brand/10 border border-brand/20 p-8 rounded-3xl leading-relaxed flex items-start gap-4">
            <span className="text-brand text-2xl">💡</span>
            <div>
              <span className="font-bold text-white uppercase tracking-wide text-sm mr-2 bg-brand/20 px-2 py-1 rounded">NOTE</span> 
              The window to attempt any mock will be 15 minutes. For example, if a mock goes live at 9:00 AM, you can start that mock between 9:00 AM and 9:15 AM.
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}