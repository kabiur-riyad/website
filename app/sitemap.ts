import { MetadataRoute } from "next";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { photoSitemapQuery, sitemapDataQuery } from "@/lib/sanity.queries";
import { getPhotoPageUrl } from "@/lib/photo.seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://riyad.pro.bd";

    // Static routes
    const routes = [
        "",
        "/about",
        "/collections",
        "/cv.html",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    // Dynamic project and photo routes
    let projectRoutes: MetadataRoute.Sitemap = [];
    let photoRoutes: MetadataRoute.Sitemap = [];
    if (hasSanityConfig && sanityClient) {
        try {
            const [projects, photos] = await Promise.all([
                sanityClient.fetch<{ slug: string; lastmod: string }[]>(sitemapDataQuery),
                sanityClient.fetch<{ _id: string; lastmod: string }[]>(photoSitemapQuery),
            ]);

            projectRoutes = projects.map((project) => ({
                url: `${baseUrl}/collections/${project.slug}`,
                lastModified: new Date(project.lastmod),
                changeFrequency: "monthly" as const,
                priority: 0.6,
            }));

            photoRoutes = photos.map((photo) => ({
                url: getPhotoPageUrl(baseUrl, photo._id),
                lastModified: new Date(photo.lastmod),
                changeFrequency: "monthly" as const,
                priority: 0.5,
            }));
        } catch (error) {
            console.error("Error fetching sitemap data from Sanity:", error);
        }
    }

    return [...routes, ...projectRoutes, ...photoRoutes];
}
