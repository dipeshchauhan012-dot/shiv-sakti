import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";
const routes = [
  { path: "/", priority: "1.0", changefreq: "weekly" as const },
  { path: "/menu", priority: "0.9", changefreq: "weekly" as const },
  { path: "/about", priority: "0.7", changefreq: "monthly" as const },
  { path: "/gallery", priority: "0.6", changefreq: "monthly" as const },
  { path: "/banquet", priority: "0.9", changefreq: "monthly" as const },
  { path: "/reserve", priority: "0.9", changefreq: "monthly" as const },
  { path: "/order", priority: "0.9", changefreq: "weekly" as const },
  { path: "/contact", priority: "0.7", changefreq: "monthly" as const },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = routes
          .map(
            (e) =>
              `  <url><loc>${BASE_URL}${e.path}</loc><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
