import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://altarvision.in"),
  title: {
    default: "AltarVision – Premium Digital Agency | Web, App & Software Development",
    template: "%s | AltarVision",
  },
  description:
    "AltarVision is a global digital agency based in Machilipatnam, India. We deliver world-class web development, mobile app development, software solutions, digital marketing, and content creation services.",
  keywords: [
    "digital agency India",
    "web development Machilipatnam",
    "mobile app development",
    "software development",
    "digital marketing",
    "SEO services",
    "content creation",
    "AltarVision",
    "Andhra Pradesh tech company",
  ],
  authors: [{ name: "AltarVision", url: "https://altarvision.in" }],
  creator: "AltarVision",
  publisher: "AltarVision",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://altarvision.in",
    siteName: "AltarVision",
    title: "AltarVision – Premium Digital Agency",
    description:
      "World-class web development, mobile apps, software solutions, and digital marketing from Machilipatnam, India.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AltarVision Digital Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AltarVision – Premium Digital Agency",
    description:
      "World-class web development, mobile apps, software solutions, and digital marketing from Machilipatnam, India.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  verification: {
    google: "l25knexv1-TeP_RVp2wosXp6letFYGyKIz-PUoj2vUU",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AltarVision",
  url: "https://altarvision.in",
  logo: "https://altarvision.in/altarvisionlogo.png",
  description:
    "Premium digital agency offering web development, mobile app development, software solutions, digital marketing, and content creation.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Machilipatnam",
    addressLocality: "Machilipatnam",
    addressRegion: "Andhra Pradesh",
    postalCode: "521001",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-6302596477",
    contactType: "customer service",
    areaServed: "Worldwide",
    availableLanguage: ["English", "Telugu"],
  },
  sameAs: [
    "https://www.facebook.com/altarvision",
    "https://www.instagram.com/altarvision",
    "https://www.linkedin.com/company/altarvision",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* Google Analytics placeholder */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script> */}
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingButtons />
      </body>
    </html>
  );
}
