import type { APIRoute } from "astro";

import { HEALTH_MEDIA_TYPE } from "../../lib/apiCatalog";

/**
 * Health endpoint advertised as the `status` link relation of every API in
 * /.well-known/api-catalog. Shape follows the health-check response format
 * (draft-inadarei-api-health-check).
 *
 * Served from a function so the response reflects the deployment that is
 * actually answering, and is never cached.
 */
export const prerender = false;

export const GET: APIRoute = async () => {
  const body = {
    status: "pass",
    version: "1",
    releaseId: import.meta.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
    serviceId: "rohitk06.in-portfolio-api",
    description: "Public API for rohitk06.in",
    time: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "Content-Type": HEALTH_MEDIA_TYPE,
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
