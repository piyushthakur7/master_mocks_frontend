"use client";

import { useState, useEffect } from "react";
import Navbar from "@/compnents/Navbar";
import Footer from "@/compnents/Footer";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { categoryService } from "@/services/category.service";

interface CategoryListPageTemplateProps {
  title: string;
  description: string;
  basePath: string; // e.g. "/free-mocks"
}

export default function CategoryListPageTemplate({
  title,
  description,
  basePath,
}: CategoryListPageTemplateProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const catRes = await categoryService.getAll();
        const cats = Array.isArray(catRes.data?.data) ? catRes.data.data : [];
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-[#1A1A1A]">{title}</h1>
          <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#D00113]" />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">No Categories Found</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              We are currently updating our categories. Please check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link 
                href={`${basePath}/${category._id}`} 
                key={category._id}
                className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-[#D00113]/10 hover:border-[#D00113]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-[#D00113] group-hover:text-white text-[#D00113] transition-colors duration-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#D00113] transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
