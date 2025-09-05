"use client";
import { useState, useEffect } from "react";

interface PDFViewerProps {
  pdfPath: string;
  className?: string;
}

export default function PDFViewer({ pdfPath, className = "" }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [pdfPath]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Gagal memuat dokumen PDF");
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A86E] mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Memuat dokumen...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-2">📄</div>
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-sm text-gray-500 mt-1">Silakan coba lagi atau hubungi admin</p>
          </div>
        </div>
      )}

      <iframe
        src={`${pdfPath}#toolbar=0&navpanes=0&scrollbar=1`}
        className="w-full h-full border-0 rounded-lg"
        onLoad={handleLoad}
        onError={handleError}
        title="Syarat dan Ketentuan"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
}
