import { MetadataRoute } from 'next'
import { testDestinations } from './data/testDestinations'
import { testEvents } from './data/testEvents'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gemitra.com'
  const currentDate = new Date().toISOString()

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/wisata`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/event`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/debug`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/debug/deployment`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.2,
    },
    {
      url: `${baseUrl}/offline`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.1,
    },
  ]

  // Dynamic destination pages
  const destinationPages = testDestinations.map((destination) => ({
    url: `${baseUrl}/wisata/${destination.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic event pages
  const eventPages = testEvents.map((event) => ({
    url: `${baseUrl}/event/${event.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Combine all pages
  return [
    ...staticPages,
    ...destinationPages,
    ...eventPages,
  ]
}
