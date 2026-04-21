import PhotoGridClient from "@/components/PhotoGridClient";
import PhotoGridServer from "@/components/PhotoGridServer";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { photoGridQuery, siteSettingsQuery } from "@/lib/sanity.queries";
import { Photo, SiteSettings } from "@/lib/types";
import { urlFor } from "@/lib/sanity.image";

export const revalidate = 60;

interface HomePageProps {
  searchParams: Promise<{ photo?: string }>;
}

async function getData() {
  if (!hasSanityConfig || !sanityClient) {
    return { photos: [], categories: [], settings: null };
  }

  const [photos, settings] = await Promise.all([
    sanityClient.fetch<Photo[]>(photoGridQuery),
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery),
  ]);

  return { photos, categories: [], settings };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { photo: initialPhotoId } = await searchParams;
  const { photos, settings } = await getData();

  // Build ImageObject structured data for each photo
  const imageObjects = photos
    .filter((p) => p.image && urlFor(p.image))
    .map((photo) => {
      const builder = urlFor(photo.image)!;
      const fullImageUrl = builder.url();

      // Map license enum to actual license URL
      const licenseUrlMap: Record<string, string> = {
        "unsplash": "https://unsplash.com/license",
        "cc-by-nc": "https://creativecommons.org/licenses/by-nc/4.0/",
      };
      const hasCustomLicense = photo.license && photo.license !== "all-rights-reserved";
      const licenseUrl = hasCustomLicense ? licenseUrlMap[photo.license!] : undefined;
      const acquireLicenseUrl = hasCustomLicense
        ? undefined
        : (settings?.email ? `mailto:${settings.email}` : undefined);

      return {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        "@id": `https://riyad.pro.bd/?photo=${photo._id}`,
        url: fullImageUrl,
        name: photo.title || "Photography by Kabiur Rahman Riyad",
        description: photo.caption || photo.title || "Street, travel, and documentary photography",
        contentLocation: photo.location
          ? {
              "@type": "Place",
              name: photo.location,
            }
          : undefined,
        datePublished: photo.year ? `${photo.year}` : undefined,
        author: {
          "@type": "Person",
          name: "Kabiur Rahman Riyad",
          url: "https://riyad.pro.bd",
        },
        creator: {
          "@type": "Person",
          name: "Kabiur Rahman Riyad",
        },
        copyrightHolder: {
          "@type": "Person",
          name: "Kabiur Rahman Riyad",
        },
        license: licenseUrl || "https://riyad.pro.bd",
        ...(acquireLicenseUrl && { acquireLicensePage: acquireLicenseUrl }),
        creditText: "Kabiur Rahman Riyad",
        copyrightNotice: `© ${photo.year || new Date().getFullYear()} Kabiur Rahman Riyad. ${hasCustomLicense ? "Some rights reserved." : "All rights reserved."}`,
      };
    });

  return (
    <main className="page">
      {imageObjects.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(imageObjects.length === 1 ? imageObjects[0] : imageObjects),
          }}
        />
      )}
      <div className="container">
        {hasSanityConfig ? (
          <>
            {/* Server-rendered gallery for SEO - visually hidden but accessible to crawlers */}
            <div className="seo-gallery-container" aria-hidden="true">
              <PhotoGridServer photos={photos} />
            </div>
            <PhotoGridClient photos={photos} defaultViewMode={settings?.defaultViewMode || "carousel"} initialPhotoId={initialPhotoId} />
            {settings?.instagramUrl ? (
              <div className="footer-social">
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="instagram-icon"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="4" y="4" width="16" height="16" rx="4" />
                    <circle cx="12" cy="12" r="4.2" />
                    <circle cx="17.2" cy="6.8" r="1.2" />
                  </svg>
                </a>
              </div>
            ) : null}
          </>
        ) : (
          <p>
            Add your Sanity project ID and dataset in `.env.local` to load your
            photo library.
          </p>
        )}
      </div>
    </main>
  );
}
