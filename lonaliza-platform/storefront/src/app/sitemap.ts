import { MetadataRoute } from "next";
import { listMergedPackages } from "@/lib/server/packages-store";
import { listMergedTours } from "@/lib/server/tours-store";
import { defaultHotels } from "@/data/hotels";
import { listPublishedBlogPosts } from "@/lib/server/blog-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://lonaliza.com";

    const staticPages = [
        { url: baseUrl, priority: 1.0, changeFrequency: "daily" as const },
        { url: `${baseUrl}/holidays`, priority: 0.9, changeFrequency: "daily" as const },
        { url: `${baseUrl}/hotels`, priority: 0.9, changeFrequency: "daily" as const },
        { url: `${baseUrl}/vip-tours`, priority: 0.9, changeFrequency: "daily" as const },
        { url: `${baseUrl}/flights`, priority: 0.8, changeFrequency: "daily" as const },
        { url: `${baseUrl}/flight-tracker`, priority: 0.9, changeFrequency: "daily" as const },
        { url: `${baseUrl}/transfers`, priority: 0.8, changeFrequency: "weekly" as const },
        { url: `${baseUrl}/cars`, priority: 0.8, changeFrequency: "weekly" as const },
        { url: `${baseUrl}/visa`, priority: 0.8, changeFrequency: "weekly" as const },
        { url: `${baseUrl}/blog`, priority: 0.8, changeFrequency: "daily" as const },
        { url: `${baseUrl}/b2b`, priority: 0.8, changeFrequency: "weekly" as const },
        { url: `${baseUrl}/contact`, priority: 0.7, changeFrequency: "monthly" as const },
        { url: `${baseUrl}/about`, priority: 0.6, changeFrequency: "monthly" as const },
    ];

    let packagePages: MetadataRoute.Sitemap = [];
    try {
        const pkgs = await listMergedPackages();
        packagePages = pkgs
            .filter((p) => p.isPublished !== false)
            .map((pkg) => ({
                url: `${baseUrl}/package/${pkg.slug}`,
                priority: 0.9,
                changeFrequency: "weekly" as const,
                lastModified: new Date(pkg.updatedAt || pkg.createdAt || Date.now()),
            }));
    } catch {
        packagePages = [];
    }

    let tourPages: MetadataRoute.Sitemap = [];
    try {
        const tours = await listMergedTours();
        tourPages = tours
            .filter((t) => t.isActive !== false)
            .map((tour) => ({
                url: `${baseUrl}/tours/${tour.id}`,
                priority: 0.8,
                changeFrequency: "weekly" as const,
                lastModified: new Date(),
            }));
    } catch {
        tourPages = [];
    }

    const hotelPages: MetadataRoute.Sitemap = defaultHotels
        .filter((h) => h.isActive !== false)
        .map((hotel) => ({
            url: `${baseUrl}/hotels/${hotel.slug}`,
            priority: 0.8,
            changeFrequency: "weekly" as const,
            lastModified: new Date(),
        }));

    let blogPages: MetadataRoute.Sitemap = [];
    try {
        const posts = await listPublishedBlogPosts();
        blogPages = posts.map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            priority: 0.7,
            changeFrequency: "weekly" as const,
            lastModified: new Date(post.updatedAt || post.publishedAt || post.createdAt),
        }));
    } catch {
        blogPages = [];
    }

    return [
        ...staticPages.map((page) => ({
            ...page,
            lastModified: new Date(),
        })),
        ...packagePages,
        ...tourPages,
        ...hotelPages,
        ...blogPages,
    ];
}
