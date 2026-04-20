import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { photoGridQuery, siteSettingsQuery } from "@/lib/sanity.queries";
import { Photo, SiteSettings } from "@/lib/types";
import { urlFor, getImageDimensions } from "@/lib/sanity.image";

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

  const contactUrl = settings?.email ? `mailto:${settings.email}` : baseUrl;

  // Build image sitemap entries
  const imageEntries = photos
    .filter((photo) => photo.image && urlFor(photo.image))
    .map((photo) => {
      const builder = urlFor(photo.image)!;
      const dims = getImageDimensions(photo.image);

      // Get full-res image URL
      const imageUrl = builder.url();

      // Get optimized version for sitemap
      const optimizedUrl = builder
        .width(1200)
        .height(dims?.height ? Math.round((1200 * dims.height) / (dims?.width || 1200)) : 800)
        .fit("max")
        .auto("format")
        .quality(85)
        .url();

      const licenseUrl = photo.licenseUrl || contactUrl;

      return `
    <url>
      <loc>${baseUrl}/?photo=${photo._id}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefrequency>monthly</changefrequency>
      <priority>0.7</priority>
      <image:image>
        <image:loc>${optimizedUrl}</image:loc>
        <image:title>${escapeXml(photo.title || "Photography by Kabiur Rahman Riyad")}</image:title>
        <image:caption>${escapeXml(photo.caption || photo.title || "Street, travel, and documentary photography")}</image:caption>
        <image:license>${licenseUrl}</image:license>
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
      const dims = getImageDimensions(photo.image);

      const optimizedUrl = builder
        .width(800)
        .height(dims?.height ? Math.round((800 * dims.height) / (dims?.width || 800)) : 600)
        .fit("max")
        .auto("format")
        .quality(80)
        .url();

      const homeLicenseUrl = photo.licenseUrl || contactUrl;

      return `
      <image:image>
        <image:loc>${optimizedUrl}</image:loc>
        <image:title>${escapeXml(photo.title || "Photography by Kabiur Rahman Riyad")}</image:title>
        <image:caption>${escapeXml(photo.caption || photo.title || "Street, travel, and documentary photography")}</image:caption>
        <image:license>${homeLicenseUrl}</image:license>
      </image:image>`;
    })
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}</loc>
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
