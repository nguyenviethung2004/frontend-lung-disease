"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock Data
const MOCK_DATASET_DETAIL = {
  id: "DS-001",
  name: "Chest X-Ray v2",
  type: "Classification",
  count: 10000,
  created: "2026-03-01",
  uploader: "Admin User",
  version: "v2.0",
  desc: "A comprehensive dataset of 10,000 chest X-ray images, categorized into Normal and Pneumonia to facilitate medical image classification tasks.",
  classes: [
    { name: "Normal", count: 4200 },
    { name: "Pneumonia", count: 5800 },
  ],
  images: [
    "https://placehold.co/400x400/1e293b/ffffff?text=XRay+1",
    "https://placehold.co/400x400/1e293b/ffffff?text=XRay+2",
    "https://placehold.co/400x400/1e293b/ffffff?text=XRay+3",
    "https://placehold.co/400x400/1e293b/ffffff?text=XRay+4",
    "https://placehold.co/400x400/1e293b/ffffff?text=XRay+5",
    "https://placehold.co/400x400/1e293b/ffffff?text=XRay+6",
  ],
  history: [
    { version: "v2.0", date: "2026-03-01", changes: "Added 2,000 new Pneumonia images. Cleaned up noisy labels." },
    { version: "v1.1", date: "2026-02-15", changes: "Fixed broken image links in validation set." },
    { version: "v1.0", date: "2026-01-10", changes: "Initial upload with 8,000 baseline images." },
  ]
};

export default function DatasetDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

  // In a real app we'd fetch this based on ID
  const data = MOCK_DATASET_DETAIL;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/dataset" className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-gray-600 bg-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {data.name}
              <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">{data.version}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">Dataset ID: {id}</p>
          </div>
        </div>
        <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-md transition-colors shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Info Widget */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold border-b border-gray-100 pb-2 mb-4">Metadata</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-900">{data.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Images</span>
                <span className="font-medium text-gray-900">{data.count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created Date</span>
                <span className="font-medium text-gray-900">{data.created}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Uploader</span>
                <span className="font-medium text-gray-900">{data.uploader}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-500 block mb-1">Description</span>
                <p className="text-gray-800 leading-relaxed text-xs">{data.desc}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold border-b border-gray-100 pb-2 mb-4">Class Distribution</h2>
            <div className="space-y-3">
              {data.classes.map((cls, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{cls.name}</span>
                    <span className="text-gray-500 text-xs">{cls.count.toLocaleString()} ({Math.round(cls.count / data.count * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(cls.count / data.count) * 100}%` }}></div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button 
              onClick={() => setActiveTab("overview")} 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "overview" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Data Preview
            </button>
            <button 
              onClick={() => setActiveTab("history")} 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "history" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Version History
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[400px]">
            {activeTab === "overview" ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="font-semibold text-gray-900">Image Previews (Random Sample)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {data.images.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group relative cursor-pointer">
                      <img src={img} alt={`Sample ${idx}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      {/* Fake BBox mapping overlay logic if type === detection goes here */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                         <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded-md">View Box</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center pt-4">
                  <button className="text-sm font-medium text-blue-600 hover:underline">Load more samples...</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="font-semibold text-gray-900">Dataset Version History</h3>
                
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                  {data.history.map((hist, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold text-gray-900">{hist.version}</span>
                        <span className="text-xs font-medium text-gray-500">{hist.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                        {hist.changes}
                      </p>
                      <button className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">Download this version</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
