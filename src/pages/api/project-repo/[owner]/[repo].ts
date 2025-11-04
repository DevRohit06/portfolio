import type { APIRoute } from "astro";
import { GITHUB_ACCESS_TOKEN } from "astro:env/server";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { owner, repo } = params;

  if (!owner || !repo) {
    return new Response(
      JSON.stringify({ error: "Owner and repo parameters required" }),
      { status: 400 }
    );
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    // Add auth token if available to avoid rate limiting
    if (GITHUB_ACCESS_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_ACCESS_TOKEN}`;
    }

    // Fetch repository info
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    if (!repoResponse.ok) {
      throw new Error(`Failed to fetch repo info: ${repoResponse.statusText}`);
    }

    const repoInfo = await repoResponse.json();

    // Fetch README
    let readmeContent = null;
    try {
      const readmeResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        {
          headers: {
            Accept: "application/vnd.github.v3.raw",
            ...(GITHUB_ACCESS_TOKEN && {
              Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
            }),
          },
        }
      );

      if (readmeResponse.ok) {
        readmeContent = await readmeResponse.text();
      }
    } catch (error) {
      console.warn(`README fetch failed for ${owner}/${repo}:`, error);
    }

    // Fetch languages
    let languages = null;
    try {
      const languagesResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/languages`,
        { headers }
      );

      if (languagesResponse.ok) {
        languages = await languagesResponse.json();
      }
    } catch (error) {
      console.warn(`Languages fetch failed for ${owner}/${repo}:`, error);
    }

    return new Response(
      JSON.stringify({
        repoInfo,
        readmeContent,
        languages,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
      }
    );
  } catch (error) {
    console.error(`[API] Project repo error for ${owner}/${repo}:`, error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch repository data" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
