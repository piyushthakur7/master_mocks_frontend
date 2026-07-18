"use client";


import Navbar from "@/compnents/Navbar";
import Hero from "@/compnents/landingPage/hero";
import WhyChooseUs from "@/compnents/landingPage/WhyChooseUs";
import AboutUs from "@/compnents/landingPage/AboutUs";
import UpcomingMocks from "@/compnents/landingPage/UpcomingMocks";
import Testimonials from "@/compnents/landingPage/Testimonials";
import Footer from "@/compnents/Footer";

export default function Home() {
  // Deliberately NOT gated on auth isLoading: the landing content is public,
  // and gating it made the prerendered HTML an empty spinner — any JS failure
  // then showed a blank page. Navbar/Hero handle auth state themselves.
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