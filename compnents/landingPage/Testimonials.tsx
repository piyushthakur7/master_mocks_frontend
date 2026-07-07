"use client";

export default function Testimonials() {
  const studentReviews = [
    {
      name: "Rohit Yadav",
      tag: "Preparing for 2 Years  ",
      text: "Performance based rewards!!!!! Wow!!!!. Nice concept team Mastermocks. Till now I have got 10-12 times Rs 25 cashback. I have been preparing for the last 2 years, struggling in mains. Just one request, include MAINS level questions more. Rest, everything is good.  "
    },
    {
      name: "Deepak Meena",
      tag: "Daily Paid Mock User  ",
      text: "Nice bro. First time I am seeing this concept. Loving it. I give daily the paid mock. It is addictive in a positive way especially when you get the cashback. Good concept. Just one suggestion, increases the number of questions is possible.  "
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-red-50/40 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            What Serious Aspirants Say About Us 
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {studentReviews.map((t, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand/5 to-transparent rounded-bl-[100px]" />
              <p className="text-slate-700 italic text-sm sm:text-base leading-relaxed font-medium relative z-10">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4 pt-6 mt-6 border-t border-slate-50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-orange-400 flex items-center justify-center font-black text-white text-lg uppercase shadow-lg shadow-brand/20">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                  <p className="text-[11px] font-black tracking-wider uppercase text-brand/80">{t.tag}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}