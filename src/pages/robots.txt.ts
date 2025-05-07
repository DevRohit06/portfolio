import type { APIContext } from "astro";

export async function GET({ site }: APIContext) {
  const siteUrl = site ? site.toString() : "https://rohitk06.dev";

  // Create robots.txt content
  // This allows all crawlers to access all areas but optimizes crawling
  const robotsTxt = `# robots.txt for rohitk06.dev
User-agent: *
Allow: /

# Optimize crawling rate
Crawl-delay: 10

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
