import { Suspense } from "react";
import { Metadata } from "next";
import WisataListClient from "./WisataListClient";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { Destination } from "../types";

export const metadata: Metadata = {
  title: "Destinasi Wisata Yogyakarta | Gemitra Jogja",
  description: "Jelajahi destinasi wisata tersembunyi di Yogyakarta dan sekitarnya. Temukan pengalaman liburan yang tak terlupakan dengan Gemitra Jogja.",
  keywords: "wisata yogyakarta, destinasi wisata, liburan yogyakarta, gemitra Jogja",
  openGraph: {
    title: "Destinasi Wisata Yogyakarta | Gemitra Jogja",
    description: "Jelajahi destinasi wisata tersembunyi di Yogyakarta dan sekitarnya.",
    type: "website",
  },
};

// Enable ISR with revalidation every 10 minutes
export const revalidate = 600;

async function fetchDestinations(): Promise<Destination[]> {
  try {
    // Use internal API route - Next.js will handle this correctly in server components
    // In production, this will use the same origin, avoiding external network calls
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/destinations`
      : 'http://localhost:3000/api/destinations';
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 600, tags: ['destinations'] },
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const data = await response.json();
    // Handle both array and object with data property
    const destinations = Array.isArray(data) ? data : (data?.data || []);
    return destinations || [];
  } catch (error) {
    console.error('Error fetching destinations in server component:', error);
    // Return empty array on error - client will handle retry
    return [];
  }
}

export default async function WisataPage() {
  // Fetch data on server for better TTFB and FCP
  const destinations = await fetchDestinations();

  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10 pt-24">
        <LoadingSkeleton type="list" count={6} />
      </div>
    }>
      <WisataListClient initialDestinations={destinations} />
    </Suspense>
  );
}
