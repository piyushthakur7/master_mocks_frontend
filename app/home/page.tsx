"use client";

import Navbar from "@/compnents/Navbar";
import Hero from "@/compnents/landingPage/hero";
import WhyChooseUs from "@/compnents/landingPage/WhyChooseUs";
import AboutUs from "@/compnents/landingPage/AboutUs";
import UpcomingMocks from "@/compnents/landingPage/UpcomingMocks";
import CourseCards from "@/compnents/landingPage/CourseCards";
import Testimonials from "@/compnents/landingPage/Testimonials";

export default function HomePreview() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Navbar />
      <main>
        <Hero />
        <WhyChooseUs />
        <AboutUs />
        <UpcomingMocks />
        <CourseCards />
        <Testimonials />
      </main>
      <footer className="bg-slate-900 text-slate-500 text-center py-8 text-xs border-t border-slate-800">
        &copy; {new Date().getFullYear()} MASTER MOCKS. Practice Smart. Score High. 
      </footer>
    </div>
  );
}
