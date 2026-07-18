"use client";

import Navbar from "@/compnents/Navbar";
import Footer from "@/compnents/Footer";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useCategories, useCategoryItems } from "@/hooks/queries/use-public-queries";

interface CategoryPageTemplateProps {
  title: string;
  accessType: 'free' | 'paid';
  resourceType: 'mock' | 'pdf';
  categoryName: string;
}

export default function CategoryPageTemplate({
  title,
  accessType,
  resourceType,
  categoryName,
}: CategoryPageTemplateProps) {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const category = categories.find((c: any) => c.name === categoryName);
  const { data: items = [], isLoading: itemsLoading } = useCategoryItems(
    accessType,
    resourceType,
    category?._id
  );

  const loading = categoriesLoading || (!!category && itemsLoading);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1A1A1A]">{title}</h1>
          <p className="text-slate-500 mt-2">
            Explore {accessType} {resourceType === 'mock' ? 'mock tests' : 'PDF materials'} for {categoryName}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#D00113]" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">No Materials Found</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Educational material, mock tests, and PDFs for this section will be uploaded here soon. Stay tuned!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((item) => (
              <div 
                key={item._id} 
                className="bg-white rounded-3xl p-1 relative overflow-hidden group border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-[#D00113]/20 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#D00113] via-red-600 to-red-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="bg-white rounded-[1.4rem] p-7 relative h-full flex flex-col z-10">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded">
                        {resourceType === 'mock' ? (item.difficulty || 'Medium') : 'PDF'}
                      </span>
                      {resourceType === 'mock' && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded">
                          {item.duration_minutes} Mins
                        </span>
                      )}
                    </div>
                    {accessType === 'paid' ? (
                      <span className="font-black text-[#D00113] text-xl">₹{item.price || 0}</span>
                    ) : (
                      <span className="font-black text-green-600 text-xl">FREE</span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6 mt-auto pt-4">
                    <span className="text-[#D00113]">📅</span> Available Now
                  </div>
                  
                  <Link 
                    href={resourceType === 'mock' ? `/mocks/${item._id}` : `/dashboard`} 
                    className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-gradient-to-r hover:from-[#D00113] hover:to-red-600 text-white font-bold text-sm text-center transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-red-500/30 block"
                  >
                    {resourceType === 'mock' ? 'Attempt Mock' : 'Download PDF'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
