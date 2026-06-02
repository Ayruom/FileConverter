import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { ConsentScripts } from "@/components/ConsentScripts";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://allfilesconvertor.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "All Files Convertor - Free Private File Convertor",
    template: "%s - All Files Convertor"
  },
  description: "Convert files online for free with no sign-up, private temporary processing, and automatic cleanup.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "All Files Convertor",
    description: "Free, privacy-first file conversion with temporary processing and automatic cleanup.",
    url: siteUrl,
    siteName: "All Files Convertor",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "All Files Convertor - Free Private File Convertor",
    description: "Convert files online for free with no sign-up, private temporary processing, and automatic cleanup."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ConsentScripts
          adsenseClient={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
          plausibleDomain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
        />
        <NavBar />
        {children}
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
