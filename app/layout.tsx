
import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Script from "next/script";
import VisitorTracker from "./components/VisitorTracker";
import { LanguageProvider } from "./contexts/LanguageContext";
import ConnectionStatus from "./components/ConnectionStatus";
import CacheCleanup from "./components/CacheCleanup";
import ServiceWorker from "./components/ServiceWorker";
import ResourcePreloader from "./components/ResourcePreloader";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "Gemitra Jogja- Hidden Gems Tourism",
  description: "Temukan destinasi wisata tersembunyi terbaik di Indonesia bersama Gemitra Jogja",
  keywords: ["wisata", "jogja", "yogyakarta", "destinasi", "hidden gems", "tourism", "travel"],
  authors: [{ name: "Gemitra Jogja & Travel" }],
  creator: "Gemitra Jogja & Travel",
  publisher: "Gemitra Jogja & Travel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gemitra.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Gemitra Jogja- Hidden Gems Tourism",
    description: "Temukan destinasi wisata tersembunyi terbaik di Indonesia bersama Gemitra Jogja",
    url: 'https://gemitra.vercel.app',
    siteName: 'Gemitra Jogja & Travel',
    images: [
      {
        url: '/images/brandman-transparant.png',
        width: 1200,
        height: 630,
        alt: 'Gemitra Jogja & Travel',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Gemitra Jogja- Hidden Gems Tourism",
    description: "Temukan destinasi wisata tersembunyi terbaik di Indonesia bersama Gemitra Jogja",
    images: ['/images/brandman-transparant.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#213DFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning={true}>
      <head>{/* Google Analytics */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=G-4NEX9PWWFQ`} strategy="afterInteractive"/>
        <Script id="google-analytics" strategy="afterInteractive">
        
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4NEX9PWWFQ');
          `}
        </Script>
      </head>
      <body className="font-sans">
        <LanguageProvider>
          <CacheCleanup />
          <ConnectionStatus />
          <VisitorTracker />
          <ServiceWorker />
          <ResourcePreloader />
          {children}
          <SpeedInsights />
        </LanguageProvider>
      </body>
    </html>
  );
}
