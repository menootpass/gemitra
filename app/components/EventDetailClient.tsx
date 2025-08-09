"use client";
import { useEventBySlug } from "../hooks/useEvents";
import { useDestinations } from "../hooks/useDestinations";
import LoadingSkeleton from "./LoadingSkeleton";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import type { SyntheticEvent } from "react";
import type { Destination } from "../types";

export default function EventDetailClient({ slug }: { slug: string }) {
  const { event, loading, error } = useEventBySlug(slug);
  const { destinations } = useDestinations();

  // Increment totalPembaca once on mount when event is available
  // and id exists
  if (event && (event as any).id) {
    // Fire and forget; avoid blocking render
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      import('../services/api').then(({ eventsApiService }) => {
        eventsApiService.incrementEventReader(String((event as any).id));
      });
    } catch {}
  }

  // Find destinasi source from multiple possible keys (destinasiIds, destinasi, Destinasi)
  const rawDestinasiSource = useMemo(() => {
    const anyEvent: any = event as any;
    if (!anyEvent) return undefined;
    if (anyEvent.destinasiIds) return anyEvent.destinasiIds;
    if (anyEvent.destinasi) return anyEvent.destinasi;
    const key = Object.keys(anyEvent || {}).find(k => k.toLowerCase() === 'destinasi');
    return key ? anyEvent[key] : undefined;
  }, [event]);

  // Normalize related IDs using the discovered source
  const relatedIds = useMemo(() => {
    const src: any = rawDestinasiSource;
    if (Array.isArray(src)) return src.map((v: any) => String(v).trim()).filter(Boolean);
    if (typeof src === 'string') return src.split(',').map((s: string) => s.trim()).filter(Boolean);
    return [] as string[];
  }, [rawDestinasiSource]);

  const related: Destination[] = useMemo(() => {
    if (!destinations?.length || !relatedIds.length) return [];
    const byId = new Map(destinations.map(d => [String(d.id).trim(), d]));
    const byName = new Map(destinations.map(d => [String(d.nama).toLowerCase().trim(), d]));

    const primaryMatches = relatedIds
      .map(id => byId.get(String(id).trim()) || null)
      .filter((d): d is Destination => Boolean(d));

    if (primaryMatches.length > 0) {
      return primaryMatches.slice(0, 3);
    }

    // Fallback: match by destination name when IDs don't match (handles legacy data like "Merapi, Borobudur")
    const fallbackMatches = relatedIds
      .map(t => byName.get(String(t).toLowerCase().trim()) || null)
      .filter((d): d is Destination => Boolean(d));

    return fallbackMatches.slice(0, 3);
  }, [destinations, relatedIds]);

  const hasRelated = related.length > 0;
  const sectionTitle = "Destinasi Terkait";
  const displayDestinations: Destination[] = related as Destination[];

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

  // Debug: Log complete event data
  console.log('Complete event data:', event);
  console.log('Event data keys:', Object.keys(event));
  console.log('Event data values:', Object.values(event));
  console.log('Event.destinasiIds:', (event as any).destinasiIds);
  console.log('Raw destinasi source (for relatedIds):', rawDestinasiSource);
  
  // Check if destinasi exists in event object
  if (event.destinasi !== undefined) {
    console.log('✅ Event destinasi found:', event.destinasi);
  } else {
    console.log('❌ Event destinasi is undefined');
    console.log('🔍 Looking for destinasi in event object...');
    // Check if destinasi exists with different casing
    const eventKeys = Object.keys(event);
    const destinasiKey = eventKeys.find(key => 
      key.toLowerCase() === 'destinasi' || 
      key.toLowerCase() === 'destination' ||
      key.toLowerCase() === 'destinations'
    );
    if (destinasiKey) {
      console.log(`✅ Found destinasi with key: "${destinasiKey}" =`, (event as any)[destinasiKey]);
    } else {
      console.log('❌ No destinasi key found in event object');
    }
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
    let content = '';
    if (typeof event.content === 'string' && event.content.length > 0) {
      content = event.content;
    } else if (typeof event.description === 'string' && event.description.length > 0) {
      content = event.description;
    } else {
      return 'Konten event tidak tersedia';
    }

    // Convert plain text to HTML with basic formatting
    return content
      .replace(/\n/g, '<br>') // Convert line breaks to HTML
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold: **text**
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic: *text*
      .replace(/__(.*?)__/g, '<strong>$1</strong>') // Bold: __text__
      .replace(/_(.*?)_/g, '<em>$1</em>') // Italic: _text_
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>') // Code: `text`
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h3>') // H3: ### text
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>') // H2: ## text
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-4">$1</h1>') // H1: # text
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>') // List items: - text
      .replace(/(<li.*<\/li>)/g, '<ul class="list-disc list-inside space-y-2 my-4">$1</ul>') // Wrap lists
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>'); // Links: [text](url)
  };

  // Enhanced image handling for destinations
  const getImageSrc = (imageUrl?: string): string => {
    if (imageUrl && imageUrl.length > 0) {
      return imageUrl;
    }
    return 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80';
  };

  // Get event image source
  const getEventImageSrc = (): string => {
    const image = event.image as any;
    if (Array.isArray(image) && image.length > 0) {
      return image[0];
    }
    if (typeof image === 'string' && image.length > 0) {
      return image;
    }
    return 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80';
  };

  // Get related destinations
  const getRelatedDestinations = () => {
    console.log('=== RELATED DESTINATIONS DEBUG ===');
    console.log('Event destinasi:', event.destinasi);
    console.log('Event destinasi type:', typeof event.destinasi);
    console.log('Event destinasi is array:', Array.isArray(event.destinasi));
    console.log('All destinations:', destinations);
    console.log('All destinations length:', destinations?.length);
    
    // Normalize event destinasi into array of string IDs
    let eventDestIds: string[] = [];
    if (Array.isArray(event.destinasi)) {
      eventDestIds = event.destinasi.map((v: any) => v != null ? v.toString().trim() : '').filter(Boolean);
    } else if (typeof (event as any).destinasi === 'string') {
      const raw = (event as any).destinasi as string;
      eventDestIds = raw
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    console.log('Normalized event destinasi IDs:', eventDestIds);
    
    // Log all destination names and IDs for debugging
    if (destinations && destinations.length > 0) {
      console.log('📋 Available destinations:');
      destinations.forEach((dest, index) => {
        console.log(`  ${index + 1}. "${dest.nama}" (ID: ${dest.id})`);
      });
    }
    
    if (!eventDestIds || eventDestIds.length === 0) {
      console.log('❌ No event destinasi data or empty array');
      console.log('Event data keys:', Object.keys(event));
      console.log('💡 To show related destinations, add a "destinasi" column to the Event spreadsheet');
      console.log('💡 Example: "1, 2" (destination IDs from Destinations database)');
      return [];
    }

    if (!destinations || destinations.length === 0) {
      console.log('❌ No destinations data available');
      console.log('💡 Check if destinations API is working properly');
      return [];
    }

    console.log('✅ Event has destinasi:', eventDestIds);
    console.log('✅ Destinations available:', destinations.length);

    // Find destinations that match the event's destinasi IDs
    const relatedDestinations = destinations.filter(dest => {
      const destId = dest.id != null ? dest.id.toString().trim() : '';
      const isMatch = eventDestIds.includes(destId);
      console.log(`🔍 Checking: "${dest.nama}" (ID: ${dest.id}) vs list [${eventDestIds.join(', ')}] => ${isMatch}`);
      return isMatch;
    });

    console.log('✅ Related destinations found:', relatedDestinations.length);
    console.log('Related destinations:', relatedDestinations);
    
    if (relatedDestinations.length === 0) {
      console.log('⚠️ No matching destinations found');
      console.log('💡 Make sure destination IDs in the Event spreadsheet match destination IDs in the Destinations spreadsheet');
      console.log('💡 Example: If event has "1, 2", make sure there are destinations with IDs "1" and "2" in Destinations database');
      console.log('💡 Available destination IDs:', destinations.map(d => d.id));
      console.log('💡 Event destinasi IDs:', eventDestIds);
    }
    
    return relatedDestinations.slice(0, 3); // Limit to 3 destinations
  };

  // const relatedDestinations = getRelatedDestinations();
  // const hasRelatedDestinations = relatedDestinations.length > 0;
  // const displayDestinations = relatedDestinations;
  // const sectionTitle = "Destinasi Terkait";

  return (
    <div className="space-y-6">
      {/* Main Event Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Event Image */}
        {event.image && event.image.length > 0 && (
          <div className="relative h-64 md:h-80">
            <Image
              src={getEventImageSrc()}
              alt={event.title || "Event Image"}
              fill
              className="object-cover"
              priority
              onError={(e: SyntheticEvent<HTMLImageElement>) => {
                console.log('Image load error:', e);
                e.currentTarget.src = '/images/brandman-transparant.png';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-4 left-4">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {event.category || "Event"}
          </span>
        </div>
      </div>
        )}
      
        {/* Event Details */}
      <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {event.title || "Event Title"}
        </h1>
        
          {/* Event Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            {event.date && (
              <div className="flex items-center gap-2">
            <span>📅</span>
                <span>{formatDate(event.date)}</span>
          </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
            )}
            <div className="flex items-center gap-2">
            <span>👥</span>
            <span>{event.totalPembaca || 0} pembaca</span>
          </div>
            {event.author && (
              <div className="flex items-center gap-2">
                <span>🔥</span>
            <span>{event.author}</span>
          </div>
            )}
        </div>
        
          {/* Event Content */}
          {getContent() && (
          <div 
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: getContent() }}
          />
          )}
        </div>
      </div>

      {/* Related Destinations Section - Only show if there are related destinations */}
      {hasRelated && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">📍</span>
            {sectionTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayDestinations.map((dest: Destination) => (
              <Link 
                key={dest.id} 
                href={`/wisata/${dest.slug}`}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Destination Image */}
                <div className="relative h-48">
                  {dest.img && dest.img.length > 0 ? (
                    <Image
                      src={getImageSrc(Array.isArray(dest.img) ? dest.img[0] : dest.img)}
                      alt={dest.nama || "Destination Image"}
                      fill
                      className="object-cover"
                      onError={(e: SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = '/images/brandman-transparant.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-4xl mb-2">🏔️</div>
                        <div className="text-sm font-medium">No Image</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                {/* Destination Info */}
                <div className="p-4 border-t border-gray-100">
                  {/* Title and Rating */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-blue-600 flex-1 mr-2">
                      {dest.nama || "Destination Name"}
                    </h3>
                    <span className="text-green-500 text-sm font-medium flex-shrink-0">
                      {dest.rating || 0}★
                    </span>
                  </div>
                  
                  {/* Location and Category */}
                  <p className="text-gray-600 text-sm mb-3">
                    {dest.lokasi || "Location"} · {dest.kategori || "Category"}
                  </p>
                  
                  {/* Price */}
                  <p className="text-green-600 font-semibold text-lg mb-4">
                    Rp {dest.harga?.toLocaleString() || "0"}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    <button className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
                      Detail
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      
    </div>
  );
} 