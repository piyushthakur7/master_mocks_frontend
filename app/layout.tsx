import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Master Mocks | India's 1st Performance-Based Mock Platform",
  description: "Boost your Banking & Insurance exam prep with exam-level mocks and earn cashback rewards.",
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
  openGraph: {
    title: "Master Mocks | India's 1st Performance-Based Mock Platform",
    description: "Boost your Banking & Insurance exam prep with exam-level mocks and earn cashback rewards.",
    url: "https://master-mocks-frontend-yant.vercel.app",
    siteName: "Master Mocks",
    images: [
      {
        url: "/logo.jpeg",
        width: 800,
        height: 800,
        alt: "Master Mocks Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Master Mocks | India's 1st Performance-Based Mock Platform",
    description: "Boost your Banking & Insurance exam prep with exam-level mocks and earn cashback rewards.",
    images: ["/logo.jpeg"],
  },
};

import { QueryProvider } from "@/lib/query-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}