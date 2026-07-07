import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { photoGridQuery, siteSettingsQuery } from "@/lib/sanity.queries";
import { Photo, SiteSettings } from "@/lib/types";
import { urlFor } from "@/lib/sanity.image";
import {
  getPhotoDescription,
  getPhotoPageUrl,
  getPhotoTitle,
  getPhotoLicenseUrl,
} from "@/lib/photo.seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://riyad.pro.bd";

  let photos: Photo[] = [];
  let settings: SiteSettings | null = null;
  if (hasSanityConfig && sanityClient) {
    try {
      [photos, settings] = await Promise.all([
        sanityClient.fetch<Photo[]>(photoGridQuery),
        sanityClient.fetch<SiteSettings | null>(siteSettingsQuery),
      ]);
    } catch (error) {
      console.error("Error fetching data for image sitemap:", error);
    }
  }

  // Build image sitemap entries
  const imageEntries = photos
    .filter((photo) => photo.image && urlFor(photo.image))
    .map((photo) => {
      const builder = urlFor(photo.image)!;
      const imageUrl = builder.url();
      const licenseUrl = getPhotoLicenseUrl(photo, baseUrl);
      const pageUrl = getPhotoPageUrl(baseUrl, photo._id);

      return `
    <url>
      <loc>${escapeXml(pageUrl)}</loc>
      <lastmod>${photo._updatedAt ? new Date(photo._updatedAt).toISOString() : new Date().toISOString()}</lastmod>
      <changefrequency>monthly</changefrequency>
      <priority>0.7</priority>
      <image:image>
        <image:loc>${escapeXml(imageUrl)}</image:loc>
        <image:title>${escapeXml(getPhotoTitle(photo))}</image:title>
        <image:caption>${escapeXml(getPhotoDescription(photo))}</image:caption>
        <image:license>${escapeXml(licenseUrl)}</image:license>
      </image:image>
    </url>`;
    })
    .join("");

  // Also include homepage with all images as a collection
  const homepageImages = photos
    .filter((photo) => photo.image && urlFor(photo.image))
    .slice(0, 20) // Limit to 20 images for homepage reference
    .map((photo) => {
      const builder = urlFor(photo.image)!;
      const imageUrl = builder.url();
      const homeLicenseUrl = getPhotoLicenseUrl(photo, baseUrl);

      return `
      <image:image>
        <image:loc>${escapeXml(imageUrl)}</image:loc>
        <image:title>${escapeXml(getPhotoTitle(photo))}</image:title>
        <image:caption>${escapeXml(getPhotoDescription(photo))}</image:caption>
        <image:license>${escapeXml(homeLicenseUrl)}</image:license>
      </image:image>`;
    })
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${escapeXml(baseUrl)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefrequency>weekly</changefrequency>
    <priority>1.0</priority>${homepageImages}
  </url>${imageEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
