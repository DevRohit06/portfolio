import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const blog = await getCollection("blog");

  // Sort posts by date (newest first)
  const sortedPosts = blog.sort(
    (a, b) =>
      new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );

  // Build the RSS feed
  return rss({
    title: "Rohit Kushwaha's Blog",
    description:
      "Thoughts, learnings, and insights from my journey in tech and software development",
    site: context.site || "https://rohitk06.in",
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.pubDate),
      link: `/blogs/${post.slug || post.id}`,
      content: `<img src="${post.data.heroImage}" alt="${post.data.title}" /><p>${post.data.description}</p><p><a href="https://rohitk06.in/blogs/${post.slug || post.id}">Read more</a></p>`,
      categories: post.data.tags || [],
    })),
    customData: `<language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>https://rohitk06.in/favicon.svg</url>
      <title>Rohit Kushwaha\'s Blog</title>
      <link>https://rohitk06.in</link>
    </image>`,
  });
}
