import { MetadataRoute } from "next";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { sitemapDataQuery } from "@/lib/sanity.queries";

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

    // Dynamic project routes
    let projectRoutes: MetadataRoute.Sitemap = [];
    if (hasSanityConfig && sanityClient) {
        try {
            const projects = await sanityClient.fetch<
                { slug: string; lastmod: string }[]
            >(sitemapDataQuery);

            projectRoutes = projects.map((project) => ({
                url: `${baseUrl}/collections/${project.slug}`,
                lastModified: new Date(project.lastmod),
                changeFrequency: "monthly" as const,
                priority: 0.6,
            }));
        } catch (error) {
            console.error("Error fetching sitemap data from Sanity:", error);
        }
    }

    return [...routes, ...projectRoutes];
}
