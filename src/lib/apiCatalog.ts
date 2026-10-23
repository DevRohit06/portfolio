/**
 * Single source of truth for the public HTTP API surface of this site.
 *
 * Three routes are generated from this list and must stay in sync:
 *   - /.well-known/api-catalog — RFC 9727 linkset, for machine discovery
 *   - /openapi.json            — OpenAPI 3.1 description (the `service-desc` target)
 *   - /api-docs                — human documentation (the `service-doc` target)
 *
 * `/api/github/last-updated-file` is deliberately absent: it queries an
 * unrelated upstream repository and is not part of this site's public API.
 */

export const SITE_FALLBACK = "https://rohitk06.in";

/** Absolute URL for a site-relative path, without a duplicated slash. */
export function absoluteUrl(path: string, site?: URL): string {
  const origin = (site?.toString() ?? SITE_FALLBACK).replace(/\/$/, "");
  return `${origin}${path}`;
}

export interface ApiParameter {
  name: string;
  in: "path" | "query";
  required: boolean;
  description: string;
  example: string;
}

export interface ApiResponse {
  status: string;
  description: string;
  /** JSON Schema for the response body, inlined into the OpenAPI document. */
  schema?: Record<string, unknown>;
}

export interface ApiOperation {
  method: "get" | "post";
  /** OpenAPI-style path with `{braced}` template variables. */
  path: string;
  operationId: string;
  summary: string;
  description: string;
  parameters?: ApiParameter[];
  requestBody?: {
    description: string;
    schema: Record<string, unknown>;
  };
  responses: ApiResponse[];
}

export interface CatalogedApi {
  /** Stable slug — used as the docs fragment and the OpenAPI tag. */
  id: string;
  name: string;
  description: string;
  /**
   * Path that identifies the API itself. Becomes the `anchor` of the API's
   * entry in the RFC 9727 linkset, so it must be stable across releases.
   */
  anchorPath: string;
  operations: ApiOperation[];
}

const contributionDaySchema = {
  type: "object",
  properties: {
    count: { type: "integer", description: "Contributions recorded that day." },
    date: {
      type: "string",
      description: "Date of the contributions, formatted `YYYY/MM/DD`.",
      example: "2026/08/13",
    },
  },
  required: ["count", "date"],
} as const;

const contributionsSchema = {
  type: "object",
  properties: {
    lastPushedAt: {
      type: "string",
      format: "date-time",
      description: "Timestamp of the most recent push to any owned repository.",
    },
    totalContributions: {
      type: "integer",
      description: "Total contributions over the trailing twelve months.",
    },
    contributions: {
      type: "array",
      description: "One entry per day of the trailing twelve months.",
      items: contributionDaySchema,
    },
  },
  required: ["lastPushedAt", "totalContributions", "contributions"],
} as const;

const repoInfoSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    nameWithOwner: { type: "string" },
    description: { type: "string", nullable: true },
    forkCount: { type: "integer" },
    stargazerCount: { type: "integer" },
    openGraphImageUrl: { type: "string", format: "uri" },
    pushedAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    url: { type: "string", format: "uri" },
  },
  required: ["name", "nameWithOwner", "forkCount", "stargazerCount", "url"],
} as const;

const linkMetadataSchema = {
  type: "object",
  properties: {
    success: {
      type: "boolean",
      description: "`false` when the target could not be scraped; no other fields are then present.",
    },
    title: { type: "string" },
    description: { type: "string" },
    faviconUrl: { type: "string", format: "uri" },
    requestUrl: { type: "string", format: "uri" },
    image: {
      type: "object",
      properties: {
        url: { type: "string", format: "uri" },
        alt: { type: "string" },
        width: { type: "integer" },
        height: { type: "integer" },
      },
      required: ["url"],
    },
  },
  required: ["success"],
} as const;

const errorSchema = {
  type: "object",
  properties: { error: { type: "string" } },
  required: ["error"],
} as const;

export const apis: CatalogedApi[] = [
  {
    id: "github-insights",
    name: "GitHub Insights API",
    description:
      "Read-only GitHub activity for the site owner: the contribution calendar for the trailing twelve months, and metadata for a named public repository.",
    anchorPath: "/api/github",
    operations: [
      {
        method: "get",
        path: "/api/github/contributions",
        operationId: "getGithubContributions",
        summary: "Contribution calendar",
        description:
          "Daily GitHub contribution counts for the trailing twelve months, plus the timestamp of the most recent push. Cached at the edge for one hour.",
        responses: [
          {
            status: "200",
            description: "The contribution calendar.",
            schema: contributionsSchema,
          },
        ],
      },
      {
        method: "get",
        path: "/api/github/repo-info/{owner}/{repository}",
        operationId: "getRepoInfo",
        summary: "Public repository metadata",
        description:
          "Name, description, star and fork counts, and last-push time for a public GitHub repository. Cached at the edge for one hour.",
        parameters: [
          {
            name: "owner",
            in: "path",
            required: true,
            description: "GitHub account that owns the repository.",
            example: "DevRohit06",
          },
          {
            name: "repository",
            in: "path",
            required: true,
            description: "Repository name.",
            example: "portfolio",
          },
        ],
        responses: [
          {
            status: "200",
            description: "Repository metadata.",
            schema: repoInfoSchema,
          },
          {
            status: "500",
            description: "The upstream GitHub request failed.",
            schema: errorSchema,
          },
        ],
      },
      {
        method: "get",
        path: "/api/github-contributions",
        operationId: "getGithubContributionsAlias",
        summary: "Contribution calendar (standalone alias)",
        description:
          "Returns the same payload as `/api/github/contributions`. Kept as a separate route for existing callers; prefer the namespaced path in new code.",
        responses: [
          {
            status: "200",
            description: "The contribution calendar.",
            schema: contributionsSchema,
          },
          {
            status: "500",
            description: "The upstream GitHub request failed.",
            schema: errorSchema,
          },
        ],
      },
    ],
  },
  {
    id: "link-metadata",
    name: "Link Metadata API",
    description:
      "Resolves a URL to its Open Graph and Twitter card metadata — title, description, favicon, and preview image — for rendering link previews.",
    anchorPath: "/api/link-metadata",
    operations: [
      {
        method: "get",
        path: "/api/link-metadata",
        operationId: "getLinkMetadata",
        summary: "Scrape link preview metadata",
        description:
          "Fetches the target URL and extracts its Open Graph / Twitter card metadata. Twitter values win over Open Graph values when both are present.",
        parameters: [
          {
            name: "url",
            in: "query",
            required: true,
            description: "Absolute URL to scrape.",
            example: "https://astro.build",
          },
        ],
        responses: [
          {
            status: "200",
            description:
              "Metadata for the target. `success` is `false` when the page could not be scraped.",
            schema: linkMetadataSchema,
          },
          {
            status: "400",
            description: "The `url` query parameter is missing or malformed.",
            schema: errorSchema,
          },
        ],
      },
    ],
  },
  {
    id: "project-repo",
    name: "Project Repository API",
    description:
      "Everything the project pages need about a public GitHub repository in one request: REST metadata, the rendered README source, and the language breakdown.",
    anchorPath: "/api/project-repo",
    operations: [
      {
        method: "get",
        path: "/api/project-repo/{owner}/{repo}",
        operationId: "getProjectRepo",
        summary: "Repository metadata, README, and languages",
        description:
          "Combines three GitHub REST calls into one response. `readmeContent` and `languages` are `null` when the corresponding upstream call fails; only a failed metadata call produces an error status. Cached for one hour.",
        parameters: [
          {
            name: "owner",
            in: "path",
            required: true,
            description: "GitHub account that owns the repository.",
            example: "DevRohit06",
          },
          {
            name: "repo",
            in: "path",
            required: true,
            description: "Repository name.",
            example: "portfolio",
          },
        ],
        responses: [
          {
            status: "200",
            description: "Repository payload.",
            schema: {
              type: "object",
              properties: {
                repoInfo: {
                  type: "object",
                  description: "Raw GitHub REST repository object.",
                  additionalProperties: true,
                },
                readmeContent: {
                  type: "string",
                  nullable: true,
                  description: "Raw README markdown, or `null` if unavailable.",
                },
                languages: {
                  type: "object",
                  nullable: true,
                  description: "Language name to bytes-of-code, or `null` if unavailable.",
                  additionalProperties: { type: "integer" },
                },
              },
              required: ["repoInfo"],
            },
          },
          {
            status: "400",
            description: "`owner` or `repo` is missing.",
            schema: errorSchema,
          },
          {
            status: "500",
            description: "The upstream GitHub request failed.",
            schema: errorSchema,
          },
        ],
      },
    ],
  },
  {
    id: "contact",
    name: "Contact API",
    description:
      "Delivers a message from the site's contact form to the owner's inbox. Every request must carry a valid Cloudflare Turnstile token.",
    anchorPath: "/api/contact",
    operations: [
      {
        method: "post",
        path: "/api/contact",
        operationId: "submitContactMessage",
        summary: "Send a contact message",
        description:
          "Validates the payload, verifies the Turnstile token against Cloudflare, then sends the message by email. Intended for the site's own contact form.",
        requestBody: {
          description: "The message and its Turnstile proof-of-humanity token.",
          schema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Sender's name." },
              email: {
                type: "string",
                format: "email",
                description: "Sender's email address; used as the reply-to.",
              },
              subject: { type: "string", description: "Message subject." },
              message: { type: "string", description: "Message body." },
              turnstileToken: {
                type: "string",
                description: "Token issued by the Cloudflare Turnstile widget.",
              },
            },
            required: ["name", "email", "subject", "message", "turnstileToken"],
          },
        },
        responses: [
          {
            status: "200",
            description: "The message was accepted and sent.",
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
              },
              required: ["success", "message"],
            },
          },
          {
            status: "400",
            description:
              "A required field is missing, the email is malformed, or Turnstile verification failed.",
            schema: errorSchema,
          },
          {
            status: "500",
            description: "The message could not be delivered.",
            schema: errorSchema,
          },
        ],
      },
    ],
  },
];

/** Path of the shared health endpoint, the `status` target for every API. */
export const HEALTH_PATH = "/api/health";

/** Media type of the health endpoint, per draft-inadarei-api-health-check. */
export const HEALTH_MEDIA_TYPE = "application/health+json";

export const OPENAPI_PATH = "/openapi.json";
export const DOCS_PATH = "/api-docs";
export const CATALOG_PATH = "/.well-known/api-catalog";
