import type { APIContext } from "astro";

export async function GET({ site }: APIContext) {
  const siteUrl = site ? site.toString() : "https://rohitk06.dev";

  // Create robots.txt content with specific instructions for search engines
  const robotsTxt = `# robots.txt for Rohit Kushwaha's Portfolio
User-agent: *
Allow: /

# Important pages that should be prioritized
Allow: /index.html
Allow: /about
Allow: /projects
Allow: /blogs
Allow: /socials

# Slightly less important content - still allow but with lower priority
Allow: /images/

# Optimize crawling rate
Crawl-delay: 5

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
