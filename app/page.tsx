import PhotoGridClient from "@/components/PhotoGridClient";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { photoGridQuery, siteSettingsQuery } from "@/lib/sanity.queries";
import { Photo, SiteSettings } from "@/lib/types";

export const revalidate = 60;

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

export default async function HomePage() {
  const { photos, settings } = await getData();
  return (
    <main className="page">
      <div className="container">
        {hasSanityConfig ? (
          <>
            <PhotoGridClient photos={photos} />
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
