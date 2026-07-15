import type { APIContext } from "astro";

export async function GET({ site }: APIContext) {
  const siteUrl = site ? site.toString() : "https://rohitk06.in";

  // Create robots.txt content with specific instructions for search engines
  const robotsTxt = `# robots.txt for Rohit Kushwaha's Portfolio
User-agent: *
Allow: /

# AI / LLM crawlers — explicitly welcomed for GEO/AEO visibility
# (ChatGPT, Claude, Perplexity, and Google's AI training/answer bots)
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

# Sitemaps
Sitemap: ${siteUrl}sitemap-index.xml
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
