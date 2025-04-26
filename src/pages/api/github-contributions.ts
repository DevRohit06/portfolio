import type { APIRoute } from "astro";
import getGithubContributions from "./_services/github/contributions";

export const GET: APIRoute = async () => {
  try {
    const data = await getGithubContributions();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[API] GitHub contributions error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch GitHub data" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
