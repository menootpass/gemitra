"use client";
import { useEventBySlug } from "../hooks/useEvents";
import LoadingSkeleton from "./LoadingSkeleton";
import Image from "next/image";

export default function EventDetailClient({ slug }: { slug: string }) {
  const { event, loading, error } = useEventBySlug(slug);

  if (loading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (error || !event) {
    return (
      <div className="text-center text-red-500">
        <h1 className="text-2xl font-bold mb-4">Event tidak ditemukan</h1>
        <p>{error || "Event yang Anda cari tidak ditemukan"}</p>
      </div>
    );
  }

  // Enhanced date handling
  const formatDate = (dateString: any): string => {
    if (!dateString) return 'Tanggal tidak tersedia';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Tanggal tidak valid';
      }
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  // Enhanced content handling
  const getContent = (): string => {
    if (typeof event.content === 'string' && event.content.length > 0) {
      return event.content;
    }
    if (typeof event.description === 'string' && event.description.length > 0) {
      return event.description;
    }
    return 'Konten event tidak tersedia';
  };

  // Enhanced image handling
  const getImageSrc = (): string => {
    const image = event.image as any;
    if (Array.isArray(image) && image.length > 0) {
      return image[0];
    }
    if (typeof image === 'string' && image.length > 0) {
      return image;
    }
    return 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80';
  };

  const content: string = getContent();
  const imageSrc: string = getImageSrc();
  const formattedDate: string = formatDate(event.date);
  const readerCount: number = event.totalPembaca || 0;

  return (
    <div className="bg-glass rounded-xl overflow-hidden shadow-xl">
      <div className="relative h-64 sm:h-80">
        <Image
          src={imageSrc}
          alt={event.title || 'Event Image'}
          width={800}
          height={400}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute top-4 left-4">
          <span className="bg-[#16A86E] text-white text-sm font-bold px-3 py-1 rounded-full">
            {event.category || 'Event'}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#213DFF] mb-4">
          {event.title || 'Judul Event Tidak Tersedia'}
        </h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{formattedDate}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{readerCount} pembaca</span>
          </div>
          {event.author && (
            <div className="flex items-center gap-1">
              <span>✍️</span>
              <span>{event.author}</span>
            </div>
          )}
        </div>
        
        <div className="prose prose-sm max-w-none">
          <div 
            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
} 