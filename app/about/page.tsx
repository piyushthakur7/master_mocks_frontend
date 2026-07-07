import Navbar from "@/compnents/Navbar";
import Footer from "@/compnents/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-24 bg-white border-b border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
             <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-brand/5 blur-[100px] rounded-full" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Our Mission at <span className="text-brand">MASTER MOCKS</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We are revolutionizing the way students prepare for Banking and Insurance exams by introducing India's first performance-based cashback reward system.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg prose-slate max-w-none">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why We Started</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Millions of aspirants prepare for competitive exams every year, spending countless hours and money on mock tests that only provide a score. We realized that motivation is a crucial factor in long-term preparation. That's why we created MASTER MOCKS. 
              </p>
              <p className="text-slate-600 mb-12 leading-relaxed">
                By rewarding top performers with real cashback, we don't just simulate the pressure of the real exam—we simulate the reward of succeeding. It creates a highly competitive environment where you are pushed to give your absolute best.
              </p>

              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Philosophy</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center text-xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Practice Smart</h3>
                  <p className="text-sm text-slate-500">Mocks designed strictly on the latest exam patterns by expert faculty.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center text-xl mb-4">📈</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Score High</h3>
                  <p className="text-sm text-slate-500">Detailed analytics to identify weak areas and improve your overall score.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center text-xl mb-4">🏆</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Get Rewarded</h3>
                  <p className="text-sm text-slate-500">Perform well and earn your money back. A win-win for serious aspirants.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
