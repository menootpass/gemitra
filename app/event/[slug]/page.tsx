'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '../../types';
import { useEventBySlug } from '../../hooks/useEvents';
import HeaderNavigation from '../../components/HeaderNavigation';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const { event, loading, error } = useEventBySlug(slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <HeaderNavigation />
        
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded-2xl mb-6"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <HeaderNavigation />
        
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Event Tidak Ditemukan
              </h1>
              <p className="text-gray-600 mb-6">
                {error || 'Event yang Anda cari tidak ditemukan.'}
              </p>
              <Link href="/event">
                <button className="bg-[#16A86E] text-white font-bold py-2 px-6 rounded-xl hover:bg-[#213DFF] transition">
                  Kembali ke Daftar Event
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <HeaderNavigation />
      
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-[#16A86E] transition">
                  Beranda
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/event" className="hover:text-[#16A86E] transition">
                  Event
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium">{event.title}</li>
            </ol>
          </nav>

          {/* Event Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#16A86E] text-white text-xs font-bold px-3 py-1 rounded-full">
                {event.category}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(event.date)}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#213DFF] mb-4">
              {event.title}
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              {event.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span>{event.totalPembaca.toLocaleString()} pembaca</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✍️</span>
                <span>{event.author}</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {event.image && event.image.length > 0 && (
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
              <Image
                src={event.image[0]}
                alt={event.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px"
              />
            </div>
          )}

          {/* Event Content */}
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
              style={{ 
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                lineHeight: '1.8',
                fontSize: '1.1rem',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}
            >
              {event.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <Link href="/event">
              <button className="bg-[#16A86E] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#213DFF] transition">
                ← Kembali ke Daftar Event
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 