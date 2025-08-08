"use client";
import { useEventBySlug } from "../hooks/useEvents";
import { useDestinations } from "../hooks/useDestinations";
import LoadingSkeleton from "./LoadingSkeleton";
import Image from "next/image";
import Link from "next/link";

export default function EventDetailClient({ slug }: { slug: string }) {
  const { event, loading, error } = useEventBySlug(slug);
  const { destinations } = useDestinations();

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
    if (typeof event.content === 'string' && event.content.length > 0) {
      return event.content;
    }
    if (typeof event.description === 'string' && event.description.length > 0) {
      return event.description;
    }
    return 'Konten event tidak tersedia';
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
    
    // Log all destination names and IDs for debugging
    if (destinations && destinations.length > 0) {
      console.log('📋 Available destinations:');
      destinations.forEach((dest, index) => {
        console.log(`  ${index + 1}. "${dest.nama}" (ID: ${dest.id})`);
      });
    }
    
    if (!event.destinasi || !Array.isArray(event.destinasi) || event.destinasi.length === 0) {
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

    console.log('✅ Event has destinasi:', event.destinasi);
    console.log('✅ Destinations available:', destinations.length);

    // Find destinations that match the event's destinasi IDs
    const relatedDestinations = destinations.filter(dest => {
      const isMatch = event.destinasi!.some((eventDestId: string) => {
        // Convert both to strings and trim whitespace
        const destId = dest.id.toString();
        const eventDestIdStr = eventDestId.toString().trim();
        
        // Exact ID match
        const idMatch = destId === eventDestIdStr;
        
        console.log(`🔍 Checking: "${dest.nama}" (ID: ${dest.id}) vs "${eventDestId}"`);
        console.log(`   - Dest ID: "${destId}"`);
        console.log(`   - Event dest ID: "${eventDestIdStr}"`);
        console.log(`   - ID match: ${idMatch}`);
        console.log(`   - Final result: ${idMatch}`);
        
        return idMatch;
      });
      return isMatch;
    });

    console.log('✅ Related destinations found:', relatedDestinations.length);
    console.log('Related destinations:', relatedDestinations);
    
    if (relatedDestinations.length === 0) {
      console.log('⚠️ No matching destinations found');
      console.log('💡 Make sure destination IDs in the Event spreadsheet match destination IDs in the Destinations spreadsheet');
      console.log('💡 Example: If event has "1, 2", make sure there are destinations with IDs "1" and "2" in Destinations database');
      console.log('💡 Available destination IDs:', destinations.map(d => d.id));
      console.log('💡 Event destinasi IDs:', event.destinasi);
    }
    
    return relatedDestinations.slice(0, 3); // Limit to 3 destinations
  };

  const relatedDestinations = getRelatedDestinations();
  const hasRelatedDestinations = relatedDestinations.length > 0;

  // Only show related destinations if they exist
  const displayDestinations = relatedDestinations;
  const sectionTitle = "Destinasi Terkait";

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
              onError={(e) => {
                console.log('Image load error:', e);
                const target = e.target as HTMLImageElement;
                target.src = '/images/brandman-transparant.png';
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
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: getContent() }}
            />
          )}
        </div>
      </div>

      {/* Related Destinations Section - Only show if there are related destinations */}
      {hasRelatedDestinations && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">📍</span>
            {sectionTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayDestinations.map((dest) => (
              <Link 
                key={dest.id} 
                href={`/wisata/${dest.id}`}
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
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/brandman-transparant.png';
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
                    <button className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                      <span className="text-white font-bold">+</span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Info - Destinasi Terkait:</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>Event destinasi:</strong> {JSON.stringify(event.destinasi)}</p>
            <p><strong>Destinations count:</strong> {destinations?.length || 0}</p>
            <p><strong>Related destinations:</strong> {relatedDestinations.length}</p>
            <p><strong>Has related destinations:</strong> {hasRelatedDestinations ? 'Yes' : 'No'}</p>
            {destinations && destinations.length > 0 && (
              <div className="mt-2">
                <p><strong>Available destination IDs:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  {destinations.map(dest => (
                    <li key={dest.id}>ID {dest.id}: {dest.nama}</li>
                  ))}
                </ul>
              </div>
            )}
            {!hasRelatedDestinations && (
              <div className="mt-2 p-2 bg-yellow-100 rounded">
                <p className="font-medium">💡 Cara menampilkan Destinasi Terkait:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Tambah kolom <code>destinasi</code> di spreadsheet Event</li>
                  <li>Isi dengan ID destinasi dari database Destinations, contoh: <code>1</code>, <code>2</code></li>
                  <li>Pastikan ID di Event cocok dengan ID di spreadsheet Destinations</li>
                  <li>Format: <code>1</code> untuk satu destinasi, <code>1, 2</code> untuk multiple destinasi</li>
                  <li><strong>Tanpa tanda petik</strong> di dalam kolom, hanya angka dipisahkan koma</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Destinasi Terkait */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-2">📍</span>
          Destinasi Terkait
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDestinations.map((dest) => (
            <Link 
              key={dest.id} 
              href={`/wisata/${dest.id}`}
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
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/brandman-transparant.png';
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
                  <button className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <span className="text-white font-bold">+</span>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 