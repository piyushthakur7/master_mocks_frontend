import Navbar from "@/compnents/Navbar";
import Footer from "@/compnents/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-24">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">About Us</h1>
          <p className="text-lg text-slate-600">This page is currently under construction.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
