
import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Script from "next/script";
import VisitorTracker from "./components/VisitorTracker";
import { LanguageProvider } from "./contexts/LanguageContext";
import ConnectionStatus from "./components/ConnectionStatus";
import CacheCleanup from "./components/CacheCleanup";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "Gemitra Jogja- Hidden Gems Tourism",
  description: "Temukan destinasi wisata tersembunyi terbaik di Indonesia bersama Gemitra Jogja",
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
          {children}
          <SpeedInsights />
        </LanguageProvider>
      </body>
    </html>
  );
}
