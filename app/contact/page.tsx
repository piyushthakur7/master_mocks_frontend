import Navbar from "@/compnents/Navbar";
import Footer from "@/compnents/Footer";

export const metadata = {
  title: "Contact Us | Master Mocks",
  description: "Get in touch with the Master Mocks team by phone or email.",
};

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased flex flex-col">
      <Navbar />
      <main className="flex-grow py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Contact Us</h1>
            <p className="text-lg text-slate-600">
              Have a question about a mock test, payment or your account? Reach out and we&apos;ll get back to you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Phone */}
            <a
              href="tel:+919769292109"
              className="block rounded-2xl border border-slate-200 p-8 hover:border-brand hover:shadow-lg transition-all"
            >
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Call Us</h2>
              <p className="text-2xl font-black text-slate-900">+91 97692 92109</p>
              <p className="text-sm text-slate-500 mt-3">Mon–Sat, 10:00 AM – 7:00 PM IST</p>
            </a>

            {/* Email */}
            <a
              href="mailto:support@mastermocks.com"
              className="block rounded-2xl border border-slate-200 p-8 hover:border-brand hover:shadow-lg transition-all"
            >
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Email Us</h2>
              <p className="text-xl font-black text-slate-900 break-all">support@mastermocks.com</p>
              <p className="text-sm text-slate-500 mt-3">We usually reply within 24 hours</p>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
