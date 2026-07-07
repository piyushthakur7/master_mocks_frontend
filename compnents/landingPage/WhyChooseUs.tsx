"use client";

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background glow for dark theme */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            How Are We Different? 
          </h2>
          <p className="text-lg text-slate-300">
            Just like any other platform, we also provide FREE mocks, FREE PDFs and PAID mocks. The difference here is that if you perform good in PAID mocks, you can earn cashback rewards .
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-3xl p-6 sm:p-10 shadow-2xl">
          <h4 className="font-bold text-xl mb-3 text-white">Reward Split Distribution Example (Per 100 Students) </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <div className="bg-white/5 hover:bg-white/10 transition-colors p-6 rounded-2xl border border-white/10 shadow-inner">
              <p className="text-xs uppercase tracking-wider text-slate-300 font-bold mb-2">Top 5% of Students </p>
              <p className="text-2xl font-black text-green-400 drop-shadow-sm">Gets ₹25 Cashback</p>
            </div>
            <div className="bg-white/5 hover:bg-white/10 transition-colors p-6 rounded-2xl border border-white/10 shadow-inner">
              <p className="text-xs uppercase tracking-wider text-slate-300 font-bold mb-2">Next 5% of Students </p>
              <p className="text-2xl font-black text-green-400 drop-shadow-sm">Gets ₹20 Cashback</p>
            </div>
            <div className="bg-white/5 hover:bg-white/10 transition-colors p-6 rounded-2xl border border-white/10 shadow-inner">
              <p className="text-xs uppercase tracking-wider text-slate-300 font-bold mb-2">Following 5% of Students </p>
              <p className="text-2xl font-black text-green-400 drop-shadow-sm">Gets ₹15 Cashback</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}