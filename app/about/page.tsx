import Navbar from "@/compnents/Navbar";
import Footer from "@/compnents/Footer";
import AboutUs from "@/compnents/landingPage/AboutUs";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <AboutUs />
      </main>
      <Footer />
    </div>
  );
}
