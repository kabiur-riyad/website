import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { siteSettingsQuery, latestPhotoQuery } from "@/lib/sanity.queries";
import type { SiteSettings, Photo } from "@/lib/types";
import { urlFor } from "@/lib/sanity.image";
import { toPlainText } from "@portabletext/react";

const body = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://riyad.pro.bd";
  let settings: SiteSettings | null = null;
  let latestPhoto: Photo | null = null;
  let icon: string | undefined;

  if (hasSanityConfig && sanityClient) {
    [settings, latestPhoto] = await Promise.all([
      sanityClient.fetch<SiteSettings | null>(siteSettingsQuery),
      sanityClient.fetch<Photo | null>(latestPhotoQuery),
    ]);
    if (settings?.favicon) {
      icon = urlFor(settings.favicon)
        ?.width(64)
        ?.height(64)
        ?.fit("max")
        ?.auto("format")
        ?.quality(80)
        ?.url();
    }
  }

  const title = settings?.title || "Kabiur Rahman Riyad";
  const description =
    settings?.ogDescription ||
    (settings?.bio ? toPlainText(settings.bio).slice(0, 160) : null) ||
    "Street, travel, and documentary photography portfolio.";

  const ogImage = latestPhoto?.image
    ? urlFor(latestPhoto.image)
        ?.width(1200)
        ?.height(630)
        ?.fit("crop")
        ?.auto("format")
        ?.quality(80)
        ?.url()
    : undefined;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: ["photography", "portfolio", "street photography", "travel photography", "documentary", "bangladesh", "dhaka"],
    authors: [{ name: "Kabiur Rahman Riyad" }],
    creator: "Kabiur Rahman Riyad",
    icons: icon ? { icon } : undefined,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: baseUrl,
      siteName: title,
      title,
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: latestPhoto?.title || title,
            },
          ]
        : [],
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      creator: "@riyad_pro",
      images: ogImage ? [ogImage] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let backgroundColor = "#f6f4f1";
  let theme: SiteSettings["theme"] = "default";
  let instagramUrl: string | undefined;
  if (hasSanityConfig && sanityClient) {
    const settings = await sanityClient.fetch<SiteSettings | null>(
      siteSettingsQuery
    );
    instagramUrl = settings?.instagramUrl;
    if (
      settings?.theme &&
      (settings.theme === "default" ||
        settings.theme === "white" ||
        settings.theme === "dark")
    ) {
      theme = settings.theme;
    }
    if (
      theme === "default" &&
      settings?.backgroundColor &&
      /^#([0-9a-fA-F]{6})$/.test(settings.backgroundColor)
    ) {
      backgroundColor = settings.backgroundColor;
    }
  }
  const bodyStyle = theme === "default" ? { ["--paper" as any]: backgroundColor } : undefined;
  return (
    <html lang="en" className={body.variable} data-theme={theme}>
      <body style={bodyStyle}>
        <Nav instagramUrl={instagramUrl} />
        {children}
      </body>
    </html>
  );
}
