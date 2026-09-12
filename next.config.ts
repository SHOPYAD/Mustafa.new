import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    "playwright",
    "playwright-core",
    "iyzipay",
    "web-push",
    "nodemailer",
    "@copilotkit/runtime",
    "@copilotkitnext/runtime",
    "@copilotkitnext/agent",
    "openai",
    "facebook-nodejs-business-sdk",
    "google-gax",
    "@whiskeysockets/baileys",
    "pino",
    "qrcode",
    "jimp",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media-cdn.tripadvisor.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dynamic-media-cdn.tripadvisor.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.tacdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dynamic-media.tacdn.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/favicon.png",
      },
      {
        source: "/uploads/:path*",
        destination: "/api/branding/file/:path*",
      },
      {
        // Legacy provider logo path (post-build public/ files are not served by Next)
        source: "/providers/custom/:path*",
        destination: "/api/branding/file/providers/:path*",
      },
      {
        source: "/demo/:path*",
        destination: "/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/uae-tours",
        destination: "/vip-tours",
        permanent: true,
      },
      {
        source: "/uae-tours/:path*",
        destination: "/vip-tours",
        permanent: true,
      },
      {
        source: "/admin/supabase",
        destination: "/admin/pocketbase",
        permanent: true,
      },
      {
        source: "/admin/supabase/:path*",
        destination: "/admin/pocketbase",
        permanent: true,
      },
      {
        source: "/admin/branding",
        destination: "/admin/homepage-editor?panel=design",
        permanent: false,
      },
    ];
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      {
        key: "Permissions-Policy",
        value: "camera=(self), microphone=(self), geolocation=(self)",
      },
      {
        key: "Content-Security-Policy-Report-Only",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://tp.media https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data: https://fonts.gstatic.com",
          "connect-src 'self' https: wss:",
          "frame-src 'self' https://tp.media https://whitelabel.travelpayouts.com https://search.lonaliza.com https://www.iyzico.com https://sandbox-api.iyzipay.com https://api.iyzipay.com https://accounts.google.com",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self' https://www.iyzico.com https://sandbox-api.iyzipay.com https://api.iyzipay.com",
        ].join("; "),
      },
    ];
    return [
      {
        source: "/sw-admin.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/sw-admin-pwa.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/admin" },
        ],
      },
      { source: "/((?!tpwl|web/|intui|ajax|content|transfer|getoffers).*)", headers: security },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const fs = require("fs");
      const path = require("path");
      config.plugins.push({
        apply(compiler: any) {
          compiler.hooks.afterEmit.tap("EnsureNextFontManifest", () => {
            try {
              const serverDir = path.resolve(process.cwd(), ".next/server");
              if (!fs.existsSync(serverDir)) fs.mkdirSync(serverDir, { recursive: true });
              const fontJson = path.join(serverDir, "next-font-manifest.json");
              const fontJs = path.join(serverDir, "next-font-manifest.js");
              const content = JSON.stringify({
                pages: {},
                app: {},
                appUsingSizeAdjust: false,
                pagesUsingSizeAdjust: false,
              });
              if (!fs.existsSync(fontJson)) fs.writeFileSync(fontJson, content, "utf8");
              if (!fs.existsSync(fontJs)) fs.writeFileSync(fontJs, `self.__NEXT_FONT_MANIFEST=${content};`, "utf8");
            } catch {}
          });
        },
      });
    }
    return config;
  },
};

export default nextConfig;
