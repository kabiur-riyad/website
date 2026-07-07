import PhotoGridClient from "@/components/PhotoGridClient";
import PhotoGridServer from "@/components/PhotoGridServer";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { photoGridQuery, siteSettingsQuery } from "@/lib/sanity.queries";
import { Photo, SiteSettings } from "@/lib/types";
import { urlFor } from "@/lib/sanity.image";
import {
  getPhotoPageUrl,
  getPhotoLicenseUrl,
  getPhotoAcquireLicenseUrl,
  getPhotoTitle,
  getPhotoDescription,
} from "@/lib/photo.seo";

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://riyad.pro.bd";

  // Build ImageObject structured data for each photo
  const imageObjects = photos
    .filter((p) => p.image && urlFor(p.image))
    .map((photo) => {
      const builder = urlFor(photo.image)!;
      const fullImageUrl = builder.url();
      const pageUrl = getPhotoPageUrl(baseUrl, photo._id);

      const hasCustomLicense = photo.license && photo.license !== "all-rights-reserved";
      const licenseUrl = getPhotoLicenseUrl(photo, baseUrl);
      const acquireLicenseUrl = getPhotoAcquireLicenseUrl(photo, baseUrl);

      return {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        "@id": pageUrl,
        url: pageUrl,
        contentUrl: fullImageUrl,
        name: getPhotoTitle(photo),
        description: getPhotoDescription(photo),
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
          url: baseUrl,
        },
        creator: {
          "@type": "Person",
          name: "Kabiur Rahman Riyad",
        },
        copyrightHolder: {
          "@type": "Person",
          name: "Kabiur Rahman Riyad",
        },
        license: licenseUrl,
        acquireLicensePage: acquireLicenseUrl,
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
            <PhotoGridClient
              photos={photos}
              defaultViewMode={settings?.defaultViewMode || "carousel"}
              initialPhotoId={initialPhotoId}
              lightboxUrlMode="photoPath"
            />
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
