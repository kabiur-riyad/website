import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://riyad.pro.bd";

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: "/studio/",
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
