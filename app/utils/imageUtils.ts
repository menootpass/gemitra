/**
 * Utility functions for handling images and URLs
 */

/**
 * Fixes Google Drive URLs to use the proper export format
 * @param url - The original URL
 * @returns Fixed URL or original URL if not a Google Drive URL
 */
export function fixGoogleDriveUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;
  
  // If it's already a proper Google Drive export URL, return as is
  if (url.includes('drive.google.com/uc?export=view')) {
    return url;
  }
  
  // Extract ID from various Google Drive URL formats
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,  // /d/ID format
    /id=([a-zA-Z0-9_-]+)/,    // ?id=ID format
    /\/file\/d\/([a-zA-Z0-9_-]+)/, // /file/d/ID format
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  
  return url;
}

/**
 * Normalizes an array of image URLs, fixing Google Drive URLs and filtering invalid ones
 * @param images - Array of image URLs or strings
 * @returns Array of normalized and fixed URLs
 */
export function normalizeImageUrls(images: any[]): string[] {
  if (!Array.isArray(images)) return [];
  
  return images
    .flatMap((src) => {
      if (typeof src !== 'string') return [];
      const s = src.trim();
      
      // Handle JSON stringified arrays
      if (s.startsWith('[') && s.endsWith(']')) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) {
            return parsed.filter((u: any) => typeof u === 'string');
          }
        } catch {
          // ignore
        }
      }
      return [s];
    })
    .filter((u) => typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/')))
    .map(fixGoogleDriveUrl);
}

/**
 * Gets a fallback placeholder image URL
 * @returns Placeholder image URL
 */
export function getPlaceholderImageUrl(): string {
  return 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80';
}

/**
 * Handles image load error by setting a fallback image
 * @param e - The error event
 * @param fallbackUrl - Optional custom fallback URL
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>, fallbackUrl?: string): void {
  const target = e.currentTarget;
  target.src = fallbackUrl || getPlaceholderImageUrl();
  target.alt = 'Placeholder Image';
}
