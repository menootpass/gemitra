"use client";
import { useState, useEffect } from "react";

interface PDFViewerProps {
  pdfPath: string;
  className?: string;
}

export default function PDFViewer({ pdfPath, className = "" }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setShowFallback(false);
  }, [pdfPath]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Gagal memuat dokumen PDF");
    setShowFallback(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = 'syarat-ketentuan.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewInNewTab = () => {
    window.open(pdfPath, '_blank');
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A86E] mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Memuat dokumen...</p>
          </div>
        </div>
      )}
      
      {error && showFallback && (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg p-6">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">📄</div>
            <p className="text-red-600 font-medium mb-2">Gagal memuat dokumen PDF</p>
            <p className="text-sm text-gray-500 mb-4">Browser Anda mungkin tidak mendukung tampilan PDF langsung</p>
            
            <div className="space-y-2">
              <button
                onClick={handleViewInNewTab}
                className="w-full bg-[#16A86E] text-white px-4 py-2 rounded-lg hover:bg-[#213DFF] transition-colors text-sm font-medium"
              >
                📖 Buka di Tab Baru
              </button>
              <button
                onClick={handleDownload}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                💾 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {!showFallback && (
        <div className="w-full h-full">
          {/* Primary: Direct PDF iframe */}
          <iframe
            src={`${pdfPath}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
            className="w-full h-full border-0 rounded-lg"
            onLoad={handleLoad}
            onError={handleError}
            title="Syarat dan Ketentuan"
            style={{ minHeight: '500px' }}
          />
          
          {/* Alternative: Object tag as backup */}
          <object
            data={pdfPath}
            type="application/pdf"
            className="w-full h-full border-0 rounded-lg hidden"
            style={{ minHeight: '500px' }}
          >
            <p className="text-center text-gray-500 p-4">
              PDF tidak dapat ditampilkan. 
              <a href={pdfPath} target="_blank" className="text-blue-500 underline ml-1">
                Klik di sini untuk membuka PDF
              </a>
            </p>
          </object>
          
          {/* Fallback buttons always visible */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleViewInNewTab}
              className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              📖 Buka di Tab Baru
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              💾 Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
