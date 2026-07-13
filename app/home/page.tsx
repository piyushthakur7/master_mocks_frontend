"use client";

import Navbar from "@/compnents/Navbar";
import Hero from "@/compnents/landingPage/hero";
import WhyChooseUs from "@/compnents/landingPage/WhyChooseUs";
import AboutUs from "@/compnents/landingPage/AboutUs";
import UpcomingMocks from "@/compnents/landingPage/UpcomingMocks";
import Testimonials from "@/compnents/landingPage/Testimonials";
import Footer from "@/compnents/Footer";

export default function HomePreview() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Navbar />
      <main>
        <Hero />
        <WhyChooseUs />
        <AboutUs />
        <UpcomingMocks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
