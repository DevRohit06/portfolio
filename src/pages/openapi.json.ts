import type { APIContext } from "astro";

import {
  DOCS_PATH,
  HEALTH_MEDIA_TYPE,
  HEALTH_PATH,
  absoluteUrl,
  apis,
  type ApiOperation,
} from "../lib/apiCatalog";

/**
 * OpenAPI 3.1 description of the public API, generated from `src/lib/apiCatalog.ts`.
 * This is the `service-desc` target advertised by /.well-known/api-catalog.
 *
 * Served from a function rather than prerendered so it answers with the
 * `application/openapi+json` type the catalog advertises; a prerendered file
 * would be served as plain `application/json` off its extension.
 */
export const prerender = false;

function jsonContent(schema: Record<string, unknown>) {
  return { "application/json": { schema } };
}

function buildOperation(api: { id: string; name: string }, op: ApiOperation) {
  const responses: Record<string, unknown> = {};
  for (const response of op.responses) {
    responses[response.status] = {
      description: response.description,
      ...(response.schema ? { content: jsonContent(response.schema) } : {}),
    };
  }

  return {
    tags: [api.id],
    operationId: op.operationId,
    summary: op.summary,
    description: op.description,
    ...(op.parameters?.length
      ? {
          parameters: op.parameters.map((parameter) => ({
            name: parameter.name,
            in: parameter.in,
            required: parameter.required,
            description: parameter.description,
            schema: { type: "string" },
            example: parameter.example,
          })),
        }
      : {}),
    ...(op.requestBody
      ? {
          requestBody: {
            required: true,
            description: op.requestBody.description,
            content: jsonContent(op.requestBody.schema),
          },
        }
      : {}),
    responses,
  };
}

export async function GET({ site }: APIContext) {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const api of apis) {
    for (const op of api.operations) {
      paths[op.path] ??= {};
      paths[op.path][op.method] = buildOperation(api, op);
    }
  }

  paths[HEALTH_PATH] = {
    get: {
      tags: ["health"],
      operationId: "getHealth",
      summary: "Service health",
      description:
        "Liveness of the API, in the health-check response format. Advertised as the `status` link relation for every API in the catalog.",
      responses: {
        "200": {
          description: "The API is serving requests.",
          content: {
            [HEALTH_MEDIA_TYPE]: {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["pass"],
                    description: "Overall health of the service.",
                  },
                  version: { type: "string" },
                  serviceId: { type: "string" },
                  description: { type: "string" },
                  time: { type: "string", format: "date-time" },
                },
                required: ["status"],
              },
            },
          },
        },
      },
    },
  };

  const document = {
    openapi: "3.1.0",
    info: {
      title: "Rohit Kushwaha — Portfolio API",
      version: "1.0.0",
      summary: "Public read-only APIs backing rohitk06.in, plus the contact endpoint.",
      description: [
        "The public HTTP API of [rohitk06.in](https://rohitk06.in).",
        "",
        "Every endpoint is unauthenticated. The read endpoints proxy GitHub with a",
        "server-side token and are cached at the edge, so callers do not need",
        "credentials and are not billed against their own GitHub rate limit.",
        "",
        `Human-readable documentation lives at ${absoluteUrl(DOCS_PATH, site)}.`,
      ].join("\n"),
      contact: {
        name: "Rohit Kushwaha",
        url: absoluteUrl("/contact", site),
      },
      license: {
        name: "MIT",
        url: "https://github.com/DevRohit06/portfolio/blob/main/LICENSE",
      },
    },
    servers: [
      {
        url: absoluteUrl("", site),
        description: "Production",
      },
    ],
    tags: [
      ...apis.map((api) => ({
        name: api.id,
        description: api.description,
        externalDocs: {
          description: `Documentation for the ${api.name}`,
          url: `${absoluteUrl(DOCS_PATH, site)}#${api.id}`,
        },
      })),
      {
        name: "health",
        description: "Liveness reporting shared by every API in the catalog.",
      },
    ],
    externalDocs: {
      description: "API documentation",
      url: absoluteUrl(DOCS_PATH, site),
    },
    paths,
  };

  return new Response(JSON.stringify(document, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/openapi+json",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
