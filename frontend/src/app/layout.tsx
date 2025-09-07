import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { MainLayout } from "@/components/layout/main-layout";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pradeep Opticals - Premium Eyewear & Optical Solutions",
  description: "Discover the latest in fashion frames, prescription lenses, and eye care services at Pradeep Opticals. Your trusted partner for premium eyewear.",
  keywords: ["eyewear", "glasses", "frames", "prescription lenses", "optical", "eye care", "fashion frames"],
  authors: [{ name: "Pradeep Opticals" }],
  creator: "Pradeep Opticals",
  publisher: "Pradeep Opticals",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Pradeep Opticals - Premium Eyewear & Optical Solutions',
    description: 'Discover the latest in fashion frames, prescription lenses, and eye care services at Pradeep Opticals.',
    siteName: 'Pradeep Opticals',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pradeep Opticals - Premium Eyewear & Optical Solutions',
    description: 'Discover the latest in fashion frames, prescription lenses, and eye care services at Pradeep Opticals.',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
