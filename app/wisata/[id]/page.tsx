import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import WisataDetailClient from './WisataDetailClient';
import { robustApiService } from '../../services/robustApi';

// Types
interface Destination {
  id: number;
  nama: string;
  lokasi: string;
  kategori: string;
  deskripsi: string;
  img: string | string[];
  harga?: number;
  rating: number;
  pengunjung?: number;
  fasilitas?: string | string[];
  komentar?: any[];
  slug?: string;
}

interface PageProps {
  params: { id: string };
}

// Generate static params for popular destinations
export async function generateStaticParams() {
  try {
    // Get all destinations to generate static pages for
    const destinations = await robustApiService.fetchDestinations();
    
    // Generate static params for first 50 most popular destinations
    // This will pre-generate the most visited pages
    const popularDestinations = destinations
      .sort((a: any, b: any) => (b.pengunjung || 0) - (a.pengunjung || 0))
      .slice(0, 50);
    
    return popularDestinations.map((destination: any) => ({
      id: destination.slug || destination.id.toString(),
    }));
        } catch (error) {
    console.error('Error generating static params:', error);
    // Return empty array if API fails during build
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const destination = await robustApiService.fetchDestinationBySlug(params.id);
    
    if (!destination) {
      return {
        title: 'Destination Not Found | Gemitra Jogja',
        description: 'The requested destination could not be found.',
      };
    }

    const images = Array.isArray(destination.img) 
      ? destination.img 
      : typeof destination.img === 'string' 
        ? [destination.img] 
        : [];

    return {
      title: `${destination.nama} | Gemitra Jogja`,
      description: destination.deskripsi?.substring(0, 160) || `Visit ${destination.nama} in ${destination.lokasi}. Book your tour with Gemitra Jogja.`,
      keywords: [
        destination.nama,
        destination.lokasi,
        destination.kategori,
        'Gemitra Jogja',
        'Yogyakarta tourism',
        'hidden gems',
        'tour package'
      ],
      openGraph: {
        title: `${destination.nama} | Gemitra Jogja`,
        description: destination.deskripsi?.substring(0, 160) || `Visit ${destination.nama} in ${destination.lokasi}.`,
        images: images.length > 0 ? [
          {
            url: images[0],
            width: 1200,
            height: 630,
            alt: destination.nama,
          }
        ] : [],
        type: 'website',
        locale: 'id_ID',
        siteName: 'Gemitra Jogja',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${destination.nama} | Gemitra Jogja`,
        description: destination.deskripsi?.substring(0, 160) || `Visit ${destination.nama} in ${destination.lokasi}.`,
        images: images.length > 0 ? [images[0]] : [],
      },
      alternates: {
        canonical: `https://gemitra.vercel.app/wisata/${params.id}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Destination | Gemitra Jogja',
      description: 'Discover amazing destinations in Yogyakarta with Gemitra Jogja.',
    };
  }
}

// Main page component with SSG
export default async function WisataDetailPage({ params }: PageProps) {
  try {
    // Fetch destination data at build time
    const destination = await robustApiService.fetchDestinationBySlug(params.id);
    
    if (!destination) {
      notFound();
    }

    // Pass data to client component
    return <WisataDetailClient destination={destination} />;
  } catch (error) {
    console.error('Error fetching destination:', error);
    notFound();
  }
}

// Enable ISR with revalidation every hour
export const revalidate = 3600; // 1 hour 