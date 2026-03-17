"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock Data
const MOCK_DATASETS = [
  { id: "DS-001", name: "Chest X-Ray v2", type: "Classification", count: "10,000", created: "2026-03-01", uploader: "Admin User", version: "v2.0" },
  { id: "DS-002", name: "MRI Brain Scans", type: "Detection", count: "5,500", created: "2026-03-10", uploader: "Dr. Smith", version: "v1.1" },
  { id: "DS-003", name: "Skin Lesions", type: "Segmentation", count: "12,000", created: "2026-03-15", uploader: "Admin User", version: "v1.0" },
  { id: "DS-004", name: "CT Lung Nodules", type: "Detection", count: "3,200", created: "2026-02-28", uploader: "Dr. Alice", version: "v1.5" },
];

export default function DatasetManagementPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState("Classification");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Filter logic
  const filteredData = MOCK_DATASETS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterType === "All" || item.type === filterType)
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert("Vui lòng chọn file dataset!");
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload progress
    await new Promise(resolve => setTimeout(resolve, 2000));

    showToast("Dataset uploaded and extracting successfully!");
    setIsUploading(false);
    setIsUploadOpen(false);
    
    // Reset form
    setUploadName("");
    setUploadDesc("");
    setUploadFile(null);
  };

  return (
    <div className="space-y-6 relative pb-10">
      {/* Toast Overlay */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[100] bg-gray-900 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <svg className="w-5 h-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dataset Management</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý kho dữ liệu huấn luyện AI của hệ thống</p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm flex items-center gap-2 max-w-max"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Upload Dataset
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={filterType} 
            onChange={(e) => {setFilterType(e.target.value); setCurrentPage(1);}}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none bg-white min-w-[150px]"
          >
            <option value="All">All Types</option>
            <option value="Classification">Classification</option>
            <option value="Detection">Detection</option>
            <option value="Segmentation">Segmentation</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="text" 
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            placeholder="Search dataset name..." 
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Dataset ID</th>
                <th scope="col" className="px-6 py-4 font-semibold">Name</th>
                <th scope="col" className="px-6 py-4 font-semibold">Type</th>
                <th scope="col" className="px-6 py-4 font-semibold">Images</th>
                <th scope="col" className="px-6 py-4 font-semibold">Version</th>
                <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                <th scope="col" className="px-6 py-4 font-semibold">Uploader</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr 
                    key={row.id} 
                    onClick={() => router.push(`/admin/dataset/${row.id}`)}
                    className="bg-white hover:bg-gray-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap">
                        {row.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{row.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 mt-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{row.version}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row.created}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row.uploader}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <p>No dataset found matching criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50/50">
            <span className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-semibold text-gray-900">{filteredData.length}</span> Datasets
            </span>
            <div className="inline-flex space-x-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">Upload Dataset</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Dataset Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={uploadName} 
                  onChange={e => setUploadName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  placeholder="Ex: COVID-19 X-Ray Scans"
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Dataset Type <span className="text-red-500">*</span></label>
                <select 
                  value={uploadType}
                  onChange={e => setUploadType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="Classification">Image Classification</option>
                  <option value="Detection">Object Detection (BBox)</option>
                  <option value="Segmentation">Image Segmentation (Masks)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea 
                  value={uploadDesc} 
                  onChange={e => setUploadDesc(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" 
                  placeholder="Describe your dataset content..."
                />
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-sm font-medium text-gray-700">Archive File (.zip, .tar.gz) <span className="text-red-500">*</span></label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".zip,.tar,.gz" onChange={e => { if(e.target.files) setUploadFile(e.target.files[0]) }} required={!uploadFile} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      ZIP, TAR, GZIP up to 2GB
                    </p>
                    {uploadFile && <p className="text-xs font-semibold text-blue-600 pt-2 block truncate max-w-xs">{uploadFile.name}</p>}
                  </div>
                  {/* Absolute layer to catch clicks */}
                  <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer"></label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 mt-4 border-t border-gray-100 pt-5">
                <button type="button" onClick={() => setIsUploadOpen(false)} disabled={isUploading} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors flex items-center gap-2 min-w-[120px] justify-center disabled:opacity-70 disabled:cursor-not-allowed">
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : "Submit Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
