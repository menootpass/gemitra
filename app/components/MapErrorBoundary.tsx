"use client";
import React from 'react';

interface MapErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface MapErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default class MapErrorBoundary extends React.Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  constructor(props: MapErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): MapErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-bold text-[#213DFF] mb-2">Peta Tidak Tersedia</h3>
            <p className="text-sm">Maaf, peta sedang mengalami masalah teknis.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 bg-[#16A86E] text-white px-4 py-2 rounded-lg hover:bg-[#213DFF] transition"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 