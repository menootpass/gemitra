"use client";
import { useEventBySlug } from "../hooks/useEvents";
import LoadingSkeleton from "./LoadingSkeleton";

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

  // Ensure content is a string
  const getContent = (): string => {
    if (typeof event.content === 'string') {
      return event.content;
    }
    if (Array.isArray(event.content)) {
      return event.content.join('\n');
    }
    if (typeof event.description === 'string') {
      return event.description;
    }
    if (Array.isArray(event.description)) {
      return event.description.join('\n');
    }
    return '';
  };

  // Ensure image is a string
  const getImageSrc = (): string => {
    if (typeof event.image === 'string') {
      return event.image;
    }
    if (Array.isArray(event.image) && event.image.length > 0) {
      return event.image[0];
    }
    return '/images/event-placeholder.jpg';
  };

  const content: string = getContent();
  const imageSrc: string = getImageSrc();

  return (
    <div className="bg-glass rounded-xl overflow-hidden shadow-xl">
      <div className="relative h-64 sm:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-[#16A86E] text-white text-sm font-bold px-3 py-1 rounded-full">
            {event.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#213DFF] mb-4">
          {event.title}
        </h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{new Date(event.date).toLocaleDateString('id-ID')}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{event.totalPembaca || 0} pembaca</span>
          </div>
          <div className="flex items-center gap-1">
            <span>✍️</span>
            <span>{event.author}</span>
          </div>
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