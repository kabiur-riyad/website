import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { siteSettingsQuery } from "@/lib/sanity.queries";
import type { SiteSettings } from "@/lib/types";
import { urlFor } from "@/lib/sanity.image";

const body = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

export async function generateMetadata(): Promise<Metadata> {
  let icon: string | undefined;
  if (hasSanityConfig && sanityClient) {
    const settings = await sanityClient.fetch<SiteSettings | null>(
      siteSettingsQuery
    );
    if (settings?.favicon) {
      const builder = urlFor(settings.favicon);
      icon = builder
        ?.width(64)
        ?.height(64)
        ?.fit("max")
        ?.auto("format")
        ?.quality(80)
        ?.url();
    }
  }
  return {
    title: "Kabiur Rahman Riyad",
    description: "Street, travel, and documentary photography portfolio.",
    icons: icon ? { icon } : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let instagramUrl: string | undefined;
  if (hasSanityConfig && sanityClient) {
    const settings = await sanityClient.fetch<SiteSettings | null>(
      siteSettingsQuery
    );
    instagramUrl = settings?.instagramUrl;
  }
  return (
    <html lang="en" className={body.variable}>
      <body>
        <Nav instagramUrl={instagramUrl} />
        {children}
      </body>
    </html>
  );
}
