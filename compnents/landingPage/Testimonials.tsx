"use client";

export default function Testimonials() {
  const studentReviews = [
    {
      name: "Ekta Sharma",
      tag: "Regular User",
      text: "Nice Platform. Paid mocks pushes you to perform good and ofcourse you get cashback in return. Nice concept. Good job Mastermocks team.",
      image: "/images_student/Ekta Sharma.png"
    },
    {
      name: "Ruchi Singh",
      tag: "Bank Exam Aspirant",
      text: "Initially I was not sure of this platform. But now after using it for a while, I can say it is 100% helpful for Bank exams preparation and also you get cashback. Nice concept.",
      image: "/images_student/ruchisingh.png"
    },
    {
      name: "Deepak Meena",
      tag: "Daily Paid Mock User",
      text: "Nice bro. First time I am seeing this concept. Loving it. I give daily the paid mock. It is addictive in a positive way especially when you get the cashback. Good concept. Just one suggestion, increases the number of questions is possible.",
      image: "/images_student/deepak meena.png"
    },
    {
      name: "Manish Maholia",
      tag: "Weekend Mock Taker",
      text: "Pehle bharosa nahi ho raha tha, now I can say, it is a very nice concept. You are helping students to earn while they prepare for the exams. You should try to give full length mocks on weekends, that will be great help, you can price them accordingly. Good luck guys.",
      image: "/images_student/manish.png"
    },
    {
      name: "Abhishek Kaushik",
      tag: "Daily Active User",
      text: "One of my friend recommended me this platform. Since then daily I am giving paid mocks. I have not won 25 Rs yet, but have won 20 Rs plenty of times. I don’t know why but now it has become my habit to give here mocks. It is nice concept.",
      image: "/images_student/abhshihek.png"
    },
    {
      name: "Rizul Thakur",
      tag: "Consistent Performer",
      text: "Good concept bro. Learn and Earn….nice!! I got 25Rs twice and 15RS multiple times. Nice way of engaging students while helping them in there preparation. Nice!!",
      image: "/images_student/thakur.png"
    },
    {
      name: "Tej Pratap",
      tag: "Ex-Serviceman",
      text: "I am an ex-serviceman. I have seen many platforms, but this one is different. My friend told me about this. Questions are good. And the concept is too good. It forces you to prepare well to get maximum marks. Nice work team.",
      image: "/images_student/tejpratap.png"
    },
    {
      name: "Rohit Yadav",
      tag: "Preparing for 2 Years",
      text: "Performance based rewards!!!!! Wow!!!!. Nice concept team Mastermocks. Till now I have got 10-12 times Rs 25 cashback. I have been preparing for the last 2 years, struggling in mains. Just one request, include MAINS level questions more. Rest, everything is good.",
      image: "/images_student/rohit.png"
    },
    {
      name: "Avantika",
      tag: "Active Participant",
      text: "I am enjoying using this platform. Can’t believe aisa bhi kuch ho sakta hai. Sad part is, I haven’t received rs25 yet. I am trying. But overall the platform is nice, questions are good. Ek baar try to banta hai. Good luck team mastermocks.",
      image: "/images_student/avantika.png"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {studentReviews.map((t, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand/5 to-transparent rounded-bl-[100px]" />
              <p className="text-slate-700 italic text-sm sm:text-base leading-relaxed font-medium relative z-10">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4 pt-6 mt-6 border-t border-slate-50">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shadow-lg shadow-brand/20 shrink-0 relative">
                  {t.image ? (
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand to-orange-400 flex items-center justify-center font-black text-white text-lg uppercase">
                      {t.name[0]}
                    </div>
                  )}
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