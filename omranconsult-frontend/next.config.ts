import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8000";
const apiOrigin = new URL(apiBaseUrl).origin;
const csp = [
  "default-src 'self'",
  `connect-src 'self' ${apiOrigin}`,
  `img-src 'self' data: blob: ${apiOrigin}`,
  "font-src 'self' data:",
  // Next emits the theme pre-paint script and style attributes. React needs eval() in development only
  // (call stacks across environments); production never sends 'unsafe-eval'.
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Hero photos behind heavy scrims use lower qualities (Home LCP); 75 stays the default.
  images: {
    qualities: [40, 60, 75],
  },
  partialPrefetching: true,
  async rewrites() {
    return [
      {
        source: "/sanctum/:path*",
        destination: `${apiBaseUrl}/sanctum/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${apiBaseUrl}/storage/:path*`,
      },
    ];
  },
  async headers() {
    const headers = [
      { key: "Content-Security-Policy", value: csp },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/:path*",
        headers,
      },
      {
        source: "/dashboard",
        headers: [
          ...headers,
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/dashboard/:path*",
        headers: [
          ...headers,
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/cms/:path*",
        headers: [
          ...headers,
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
