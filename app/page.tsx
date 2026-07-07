"use client";


import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/compnents/Navbar";
import Hero from "@/compnents/landingPage/hero";
import WhyChooseUs from "@/compnents/landingPage/WhyChooseUs";
import AboutUs from "@/compnents/landingPage/AboutUs";
import UpcomingMocks from "@/compnents/landingPage/UpcomingMocks";
import CourseCards from "@/compnents/landingPage/CourseCards";;
import Testimonials from "@/compnents/landingPage/Testimonials";
import Footer from "@/compnents/Footer";

export default function Home() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-[#D00113] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Navbar />
      <main>
        <Hero />
        <UpcomingMocks />
        <WhyChooseUs />
        <AboutUs />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}