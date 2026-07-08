"use client";

import Link from "next/link";

export default function CourseCards() {
  const specializedMocks = [
    {
      id: 1,
      title: "High-Tier Logical & Analytical Reasoning Mastery Series",
      subject: "Reasoning Ability",
      totalTests: "65 Premium Mocks",
      freeResources: "12 Free PDFs Available",
      rating: "4.9",
      features: ["Puzzles & Seating Arrangements", "Detailed Video Explanations", "Performance Cashback Eligible "]
    },
    {
      id: 2,
      title: "Advanced Quantitative Aptitude Core Drill Pack",
      subject: "Quantitative Aptitude",
      totalTests: "80 Chapter Tests",
      freeResources: "15 Formulas Modules",
      rating: "4.8",
      features: ["Data Interpretation Focus", "Speed Calculation Trick Mocks", "Performance Cashback Eligible "]
    },
    {
      id: 3,
      title: "Daily & Weekly Current Affairs Master Repository",
      subject: "Current Affairs & GA",
      totalTests: "120 Sectional Capsule Tests",
      freeResources: "Monthly Mega PDF Digests",
      rating: "4.9",
      features: ["Banking & Insurance Updates", "AI Performance Analytics ", "Real-Time Ranking Checks"]
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-white">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50/40 via-white to-brand/5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Specialized Mock Packs for Banking & Insurance
          </h2>
          <p className="text-xl sm:text-2xl text-slate-600">
            Target your weakest areas with real exam-level questions curated by elite faculty .
          </p>
        </div>

        {/* Testbook Inspired Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {specializedMocks.map((mock) => (
            <div 
              key={mock.id} 
              className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl overflow-hidden flex flex-col hover:border-brand/30 hover:shadow-2xl hover:shadow-brand/10 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="h-2 w-full bg-gradient-to-r from-brand to-orange-400 opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="p-7 flex-1 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wide text-brand mb-2 block">
                  {mock.subject}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mb-3 line-clamp-2 min-h-[56px] group-hover:text-brand transition-colors">
                  {mock.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-4 bg-slate-50 p-2 rounded-md w-fit">
                  <span className="text-amber-500">★</span>
                  <span className="text-slate-900 font-bold">{mock.rating}</span>
                </div>

                <div className="grid grid-cols-1 gap-2 py-3 my-2 border-y border-slate-100 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-brand">📄</span> {mock.totalTests}
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span> {mock.freeResources}
                  </div>
                </div>

                <ul className="space-y-2 my-4 text-xs font-medium text-slate-500 flex-1">
                  {mock.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-brand text-lg">•</span> {feature}
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/signup" 
                  className="w-full py-3 mt-2 rounded-xl bg-slate-50 hover:bg-gradient-to-r hover:from-brand hover:to-orange-500 text-slate-800 hover:text-white font-bold text-sm text-center border border-slate-200 group-hover:border-transparent transition-all duration-300 shadow-sm group-hover:shadow-md"
                >
                  Unlock Mock Test Pack
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Global Explore More CTA */}
        <div className="mt-14 text-center">
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-brand to-orange-500 hover:from-brand-hover hover:to-orange-600 text-white font-black rounded-xl text-base shadow-lg shadow-brand/20 hover:shadow-brand/40 transition-all group hover:-translate-y-0.5"
          >
            Explore More Test Series
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}