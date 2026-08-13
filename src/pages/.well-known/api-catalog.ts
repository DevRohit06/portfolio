import type { APIContext } from "astro";

import {
  DOCS_PATH,
  HEALTH_MEDIA_TYPE,
  HEALTH_PATH,
  OPENAPI_PATH,
  absoluteUrl,
  apis,
} from "../../lib/apiCatalog";

/**
 * RFC 9727 API catalog — https://www.rfc-editor.org/rfc/rfc9727
 *
 * Served from a function rather than prerendered so the `application/linkset+json`
 * media type survives: a prerendered `/.well-known/api-catalog` has no file
 * extension, so the host would fall back to guessing its content type.
 */
export const prerender = false;

export async function GET({ site }: APIContext) {
  const linkset = apis.map((api) => ({
    anchor: absoluteUrl(api.anchorPath, site),
    "service-desc": [
      {
        href: absoluteUrl(OPENAPI_PATH, site),
        type: "application/openapi+json",
        title: `OpenAPI description — ${api.name}`,
      },
    ],
    "service-doc": [
      {
        href: `${absoluteUrl(DOCS_PATH, site)}#${api.id}`,
        type: "text/html",
        title: `Documentation — ${api.name}`,
      },
    ],
    status: [
      {
        href: absoluteUrl(HEALTH_PATH, site),
        type: HEALTH_MEDIA_TYPE,
        title: "Service health",
      },
    ],
  }));

  return new Response(JSON.stringify({ linkset }, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      // The catalog describes public endpoints, so let any origin discover it.
      "Access-Control-Allow-Origin": "*",
    },
  });
}
