import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-black text-white mb-4">
              <span className="text-brand">MASTER</span> MOCKS
            </h3>
            <p className="text-slate-400 max-w-sm mb-6 leading-relaxed">
              Practice Smart. Score High. Get Rewarded. Join the revolution in mock testing and elevate your exam preparation with performance-based cashback.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="hover:text-brand transition-colors">Home</Link></li>
              <li><Link href="/mocks" className="hover:text-brand transition-colors">Mock Tests</Link></li>
              <li><Link href="/pricing" className="hover:text-brand transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-brand transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="hover:text-brand transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-brand transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-brand transition-colors">Refund Policy</Link></li>
              <li><Link href="/contact" className="hover:text-brand transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} MASTER MOCKS. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-brand transition-colors font-medium">YouTube</a>
            <a href="#" className="hover:text-brand transition-colors font-medium">Telegram</a>
            <a href="#" className="hover:text-brand transition-colors font-medium">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
