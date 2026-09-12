// src/app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/admin/login", "/api/admin/"],
            },
            {
                userAgent: [
                    "GPTBot",
                    "ChatGPT-User",
                    "ClaudeBot",
                    "Claude-Web",
                    "PerplexityBot",
                    "Google-Extended",
                    "Applebot-Extended",
                    "cohere-ai",
                    "Diffbot",
                    "FacebookBot",
                    "Bytespider",
                ],
                allow: ["/", "/llms.txt", "/llms-full.txt"],
                disallow: ["/admin/", "/api/admin/"],
            },
        ],
        sitemap: "https://lonaliza.com/sitemap.xml",
        host: "https://lonaliza.com",
    };
}
