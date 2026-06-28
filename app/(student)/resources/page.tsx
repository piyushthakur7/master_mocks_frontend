"use client";

import { useState, useEffect } from "react";
import { resourceService } from "@/services/resource.service";
import { Resource } from "@/types/resource";
import { toast } from "sonner";
import { Loader2, Download, FileText, Video, Link as LinkIcon, BookOpen, Database } from "lucide-react";

export default function StudentResourcesVaultPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const response = await resourceService.getAll({ 
          ...(selectedCategory !== "ALL" && { category: selectedCategory })
        });
        
        if (response.success && response.data) {
          const resArray = Array.isArray(response.data) ? response.data : [];
          setResources(resArray);
          
          // Extract unique categories if "ALL" is selected
          if (selectedCategory === "ALL") {
            const uniqueCats = Array.from(new Set(resArray.map((r: any) => {
              if (typeof r.category === 'object' && r.category?.name) return r.category.name;
              if (typeof r.category === 'string') return r.category;
              return null;
            }).filter(Boolean))) as string[];
            setCategories(uniqueCats);
          }
        }
      } catch (error) {
        toast.error("Failed to load resources");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, [selectedCategory]);

  const handleDownload = async (resourceId: string, title: string) => {
    try {
      const response = await resourceService.download(resourceId);
      if (response.success && response.data) {
        toast.success(`Downloading ${title}...`);
        window.open(response.data.downloadUrl, "_blank");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to download resource");
    }
  };

  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'video': return <Video className="w-5 h-5 text-blue-500" />;
      case 'notes': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      default: return <LinkIcon className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Banner Deck Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-sm">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">Free Pdf's</h1>
      </div>

      {isLoading && selectedCategory === "ALL" ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      ) : (
        <>
          {/* Segmented Category Filter Toggles */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                  selectedCategory === "ALL"
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                All Categories
              </button>
              {categories.map((catName) => (
                <button
                  key={catName}
                  onClick={() => setSelectedCategory(catName)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                    selectedCategory === catName
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {catName}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
            </div>
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((item) => (
                <div 
                  key={item._id} 
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                        {getResourceIcon(item.resource_type || item.type || "pdf")}
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                        {item.resource_type || item.type}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-800 group-hover:text-[#D00113] transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  <div className="pt-4 mt-5">
                    <button
                      onClick={() => handleDownload(item._id!, item.title)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 group-hover:bg-[#1A1A1A] group-hover:text-white text-slate-700 rounded-xl transition-all text-xs font-black uppercase tracking-wider"
                    >
                      <Download className="w-3.5 h-3.5" /> Download / View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                <Database className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Resources Found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">There are no study materials available for the selected category at this moment.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}