import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import WisataDetailClient from './WisataDetailClient';
import { robustApiService } from '../../services/robustApi';
import { Destination } from '../../types';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate static params for popular destinations
export async function generateStaticParams() {
  try {
    // Get all destinations to generate static pages for
    const destinations = await robustApiService.fetchDestinations();
    
    // Generate static params for first 10 most popular destinations
    // This will pre-generate the most visited pages
    const popularDestinations = destinations
      .filter((destination: any) => destination.dikunjungi && destination.dikunjungi > 0)
      .sort((a: any, b: any) => (b.dikunjungi || 0) - (a.dikunjungi || 0))
      .slice(0, 10);
    
    return popularDestinations.map((destination: any) => ({
      id: destination.slug || destination.id.toString(),
    }));
  } catch (error) {
    console.warn('Failed to fetch destinations for static params, using test data:', error);
    // Fallback to test data during build
    try {
      const { testDestinations } = await import('../../data/testDestinations');
      return testDestinations
        .filter((destination: any) => destination.dikunjungi && destination.dikunjungi > 0)
        .slice(0, 10)
        .map((destination: any) => ({
          id: destination.slug || destination.id.toString(),
        }));
    } catch (testError) {
      console.error('Failed to load test data:', testError);
      return [];
    }
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const destination = await robustApiService.fetchDestinationBySlug(resolvedParams.id);
    
    if (!destination) {
      // Fallback to test data for metadata
      try {
        const { testDestinations } = await import('../../data/testDestinations');
        const testDestination = testDestinations.find(dest => 
          dest.slug === resolvedParams.id || dest.id.toString() === resolvedParams.id
        );
        
        if (testDestination) {
          return {
            title: `${testDestination.nama} | Gemitra Jogja`,
            description: testDestination.deskripsi?.substring(0, 160) || `Visit ${testDestination.nama} in ${testDestination.lokasi}. Book your tour with Gemitra Jogja.`,
          };
        }
      } catch (testError) {
        console.warn('Failed to load test data for metadata:', testError);
      }
      
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
        canonical: `https://gemitra.vercel.app/wisata/${resolvedParams.id}`,
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
    const resolvedParams = await params;
    const destination = await robustApiService.fetchDestinationBySlug(resolvedParams.id);
    
    if (!destination) {
      // Fallback to test data
      try {
        const { testDestinations } = await import('../../data/testDestinations');
        const testDestination = testDestinations.find(dest => 
          dest.slug === resolvedParams.id || dest.id.toString() === resolvedParams.id
        );
        
        if (testDestination) {
          // Ensure posisi is properly typed as [number, number]
          const destination = {
            ...testDestination,
            posisi: testDestination.posisi as [number, number]
          };
          return <WisataDetailClient destination={destination} />;
        }
      } catch (testError) {
        console.warn('Failed to load test data:', testError);
      }
      
      notFound();
    }

    // Pass data to client component
    return <WisataDetailClient destination={destination} />;
  } catch (error) {
    console.error('Error fetching destination:', error);
    
    // Fallback to test data on error
    try {
      const resolvedParams = await params;
      const { testDestinations } = await import('../../data/testDestinations');
      const testDestination = testDestinations.find(dest => 
        dest.slug === resolvedParams.id || dest.id.toString() === resolvedParams.id
      );
      
      if (testDestination) {
        // Ensure posisi is properly typed as [number, number]
        const destination = {
          ...testDestination,
          posisi: testDestination.posisi as [number, number]
        };
        return <WisataDetailClient destination={destination} />;
      }
    } catch (testError) {
      console.warn('Failed to load test data on error:', testError);
    }
    
    notFound();
  }
}

// Enable ISR with revalidation every hour
export const revalidate = 3600; // 1 hour 